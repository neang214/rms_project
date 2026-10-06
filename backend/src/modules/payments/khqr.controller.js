import { BakongKHQR, khqrData, IndividualInfo } from "bakong-khqr";
import prisma from "../../utils/db.js";
import { getIO } from "../../sockets/index.js";

const KHR_RATE = 4100;

export const generateKHQR = async (req, res) => {
  const { order_id, currency = "USD" } = req.body;

  console.log(`[KHQR] generateKHQR — order_id=${order_id} currency=${currency}`);

  if (!order_id)
    return res.status(400).json({ message: "order_id is required" });

  try {
    const order = await prisma.order.findUnique({
      where: { order_id: parseInt(order_id) },
      include: {
        order_items: true,
        payments: { where: { status: "Completed" } },
      },
    });

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.payments.length > 0)
      return res.status(409).json({ message: "This order has already been paid" });

    const totalUSD = order.order_items.reduce(
      (sum, item) => sum + item.quantity * Number(item.unit_price), 0
    );

    const isusd = currency.toUpperCase() === "USD";
    const amount = isusd
      ? parseFloat(totalUSD.toFixed(2))
      : Math.round(totalUSD * KHR_RATE);

    
    
    
    const bakongId = "abaakhppxxx@abaa";
    const accountNumber = process.env[isusd ? "KHQR_BAKONG_ID_USD" : "KHQR_BAKONG_ID_KHR"] || "";

    console.log(`[KHQR] bakongId=${bakongId} accountNumber=${accountNumber} amount=${amount} ${currency}`);

    if (!accountNumber)
      return res.status(500).json({ message: `KHQR_BAKONG_ID_${currency.toUpperCase()} not set in .env` });

    const optionalData = {
      currency: isusd ? khqrData.currency.usd : khqrData.currency.khr,
      amount,
      billNumber: `#${String(order_id).padStart(4, "0")}`,
      storeLabel: process.env.KHQR_MERCHANT_NAME || "Zoom Garden Cafe",
      terminalLabel: "Cashier-1",
      expirationTimestamp: Date.now() + 10 * 60 * 1000,
      accountInformation: accountNumber,
    };

    // IndividualInfo correct signature: (bakongAccountID, merchantName, merchantCity, optionalData)
    // Currency and amount go ONLY in optionalData, NOT as constructor params
    const info = new IndividualInfo(
      bakongId,
      process.env.KHQR_MERCHANT_NAME || "NEN NEANG",
      process.env.KHQR_MERCHANT_CITY || "Phnom Penh",
      optionalData
    );

    const khqr = new BakongKHQR();
    const result = khqr.generateIndividual(info);

    console.log(`[KHQR] result: code=${result.status.code} qr=${result.data?.qr}`);

    if (result.status.code !== 0)
      return res.status(500).json({ message: "Failed to generate KHQR", detail: result.status.message });

    res.json({
      qr: result.data.qr,
      md5: result.data.md5,
      amount,
      currency: currency.toUpperCase(),
      order_id: parseInt(order_id),
      expires_at: Date.now() + 10 * 60 * 1000,
    });
  } catch (error) {
    console.error("[KHQR] generateKHQR error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkKHQR = async (req, res) => {
  const { md5 } = req.params;
  const { order_id } = req.query;

  if (!md5 || !order_id)
    return res.status(400).json({ message: "md5 and order_id are required" });

  const token = process.env.BAKONG_TOKEN;
  if (!token)
    return res.json({ paid: false, reason: "BAKONG_TOKEN not configured — use manual confirm" });

  try {
    const bakongRes = await checkBakongMD5(md5, token);
    if (!bakongRes.paid) return res.json({ paid: false });

    const order = await prisma.order.findUnique({
      where: { order_id: parseInt(order_id) },
      include: {
        order_items: true,
        payments: { where: { status: "Completed" } },
      },
    });

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.payments.length > 0 || order.status === "Paid")
      return res.json({ paid: true, already_processed: true });

    const totalAmount = order.order_items.reduce(
      (sum, item) => sum + item.quantity * Number(item.unit_price), 0
    );

    let khqrMethod = await prisma.paymentMethod.findFirst({ where: { method_name: "KHQR" } });
    if (!khqrMethod)
      khqrMethod = await prisma.paymentMethod.create({ data: { method_name: "KHQR" } });

    const cashier = await prisma.user.findFirst({ where: { role: { in: ["cashier", "admin"] } } });

    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          order_id: parseInt(order_id),
          method_id: khqrMethod.method_id,
          user_id: cashier?.user_id || 1,
          amount: totalAmount,
          status: "Completed",
        },
      });
      await tx.order.update({ where: { order_id: parseInt(order_id) }, data: { status: "Paid" } });
      if (order.table_id)
        await tx.table.update({ where: { table_id: order.table_id }, data: { is_available: true } });
    });

    const io = getIO();
    io.to("role:cashier").to("role:admin").emit("payment:completed", { order_id: parseInt(order_id) });
    io.to("role:cashier").to("role:admin").emit("order:status_changed", { order_id: parseInt(order_id), status: "Paid" });
    io.to(`table:${order.table_id}`).emit("order:status_changed", { order_id: parseInt(order_id), status: "Paid" });

    res.json({ paid: true, order_id: parseInt(order_id) });
  } catch (error) {
    console.error("[KHQR] checkKHQR error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

async function checkBakongMD5(md5, token) {
  const { default: https } = await import("https");
  return new Promise((resolve) => {
    const body = JSON.stringify({ md5 });
    const options = {
      hostname: "api-bakong.nbc.gov.kh",
      path: "/v1/check_transaction_by_md5",
      method: "POST",
      family: 4,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        Authorization: `Bearer ${token}`,
      },
    };
    const req = https.request(options, (response) => {
      let data = "";
      response.on("data", (chunk) => { data += chunk; });
      response.on("end", () => {
        try { resolve({ paid: JSON.parse(data).responseCode === 0 }); }
        catch { resolve({ paid: false }); }
      });
    });
    req.on("error", () => resolve({ paid: false }));
    req.write(body);
    req.end();
  });
}

//KHQR_BAKONG_ID_USD