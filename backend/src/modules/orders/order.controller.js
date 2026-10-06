import prisma from "../../utils/db.js";
import { getIO } from "../../sockets/index.js";
import { getQueueNumber, attachQueueNumbers } from "../../utils/queueNumber.js";

export const getAllOrders = async (req, res) => {
  const { status } = req.query;
  try {
    const orders = await prisma.order.findMany({
      where: status ? { status } : {},
      include: {
        table: { select: { table_number: true } },
        user:  { select: { username: true, role: true } },
        order_items: {
          include: {
            menu_item: { select: { item_name: true, price: true } },
          },
        },
        
        
        
        payments: { where: { status: "Completed" }, select: { payment_id: true } },
      },
      orderBy: { order_date: "desc" },
    });

    
    
    
    
    
    const queueNumbers = await attachQueueNumbers(orders);
    const shaped = orders.map(({ payments, ...o }) => ({
      ...o,
      is_paid: o.status === "Paid" || (payments?.length || 0) > 0,
      queue_number: queueNumbers.get(o.order_id),
    }));
    res.json(shaped);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { order_id: parseInt(req.params.id) },
      include: {
        table: { select: { table_number: true } },
        user:  { select: { username: true, role: true } },
        order_items: {
          include: {
            menu_item: { select: { item_name: true, price: true } },
          },
        },
        payments: true,
      },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

async function findActiveOrderForTable(table_id) {
  const order = await prisma.order.findFirst({
    where: {
      table_id,
      status: { not: "Paid" },
      payments: { none: { status: "Completed" } },
    },
    include: {
      order_items: {
        include: {
          menu_item: { select: { item_name: true, price: true, image_url: true } },
        },
      },
    },
  });
  if (!order) return null;

  const queue_number = await getQueueNumber(order);
  return { ...order, queue_number };
}

export const getActiveOrderByTable = async (req, res) => {
  try {
    const result = await findActiveOrderForTable(parseInt(req.params.tableId));
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createOrder = async (req, res) => {
  const { table_id, note, party_size } = req.body;

  if (!table_id) {
    return res.status(400).json({ message: "table_id is required" });
  }

  try {
    const table = await prisma.table.findUnique({
      where: { table_id: parseInt(table_id) },
      select: { table_id: true, table_number: true },
    });

    if (!table)
      return res.status(404).json({ message: "Table not found" });

    let order;
    try {
      order = await prisma.$transaction(async (tx) => {
        // Serialize concurrent order-creation attempts for this exact
        // table so two simultaneous requests can't both pass the
        // "no active order" check below and each create their own order.
        // pg_advisory_xact_lock is scoped to this transaction and
        // releases automatically on commit or rollback — no schema
        // change needed, so it works with our `prisma db push` workflow.
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${table.table_id})`;

        const existingOrder = await tx.order.findFirst({
          where: {
            table_id: table.table_id,
            status: { not: "Paid" },
            payments: { none: { status: "Completed" } },
          },
        });

        if (existingOrder) {
          const err = new Error("TABLE_HAS_ACTIVE_ORDER");
          err.order_id = existingOrder.order_id;
          throw err;
        }

        const newOrder = await tx.order.create({
          data: {
            table_id:  table.table_id,
            user_id:   req.user?.userId ?? null,
            note:      note ? String(note).slice(0, 1000) : null,
            party_size: party_size ? parseInt(party_size) : null,
          },
          include: {
            table: { select: { table_number: true } },
          },
        });

        await tx.table.update({
          where: { table_id: table.table_id },
          data:  { is_available: false },
        });

        return newOrder;
      });
    } catch (err) {
      if (err.message === "TABLE_HAS_ACTIVE_ORDER") {
        return res.status(400).json({
          message: "Table already has an active order",
          order_id: err.order_id,
        });
      }
      // In case the optional DB-level constraint (see
      // backend/sql/one_active_order_per_table.sql) is applied and
      // somehow still gets hit despite the advisory lock above.
      if (err.code === "P2002") {
        return res.status(400).json({ message: "Table already has an active order" });
      }
      throw err;
    }

    const io = getIO();
    io.to("role:cashier").to("role:server").emit("order:new", order);
    io.to(`table:${order.table_id}`).emit("order:new", order);

    io.to("role:admin").to("role:cashier").to("role:server").emit("table:updated", {
      table_id: order.table_id,
      is_available: false,
    });

    const queue_number = await getQueueNumber(order);

    res.status(201).json({ ...order, queue_number });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["Pending", "Preparing", "Served", "Paid"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Status must be one of: ${validStatuses.join(", ")}`,
    });
  }

  try {
    const order = await prisma.order.update({
      where: { order_id: parseInt(req.params.id) },
      data:  { status },
    });

    const io = getIO();
    io.to("role:cashier").to("role:kitchen").to("role:barista").to("role:admin").to("role:server")
      .emit("order:status_changed", order);
    io.to(`table:${order.table_id}`).emit("order:status_changed", order);

    res.json(order);
  } catch (error) {
    console.log(error);
    if (error.code === "P2025")
      return res.status(404).json({ message: "Order not found" });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { order_id: parseInt(req.params.id) },
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.status !== "Pending") {
      return res.status(400).json({
        message: "Cannot cancel order that is already being prepared",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({
        where: { order_id: parseInt(req.params.id) },
      });

      await tx.order.delete({
        where: { order_id: parseInt(req.params.id) },
      });

      await tx.table.update({
        where: { table_id: order.table_id },
        data:  { is_available: true },
      });
    });

    const io = getIO();
    io.to("role:cashier").to("role:kitchen").to("role:barista").to("role:admin").to("role:server")
      .emit("order:deleted", { order_id: order.order_id, table_id: order.table_id });
    io.to(`table:${order.table_id}`).emit("order:deleted", { order_id: order.order_id });
    
    io.to("role:admin").to("role:cashier").to("role:server").emit("table:updated", {
      table_id: order.table_id,
      is_available: true,
    });

    res.json({ message: "Order cancelled" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().split("T")[0];
    const start = new Date(`${dateStr}T00:00:00.000Z`);
    const end   = new Date(`${dateStr}T23:59:59.999Z`);

    
    const tableId = req.query.table_id ? parseInt(req.query.table_id) : null;

    const orders = await prisma.order.findMany({
      where: {
        order_date: { gte: start, lte: end },
        ...(tableId ? { table_id: tableId } : {}),
      },
      include: {
        table: { select: { table_number: true } },
        user:  { select: { username: true, role: true } },
        order_items: {
          include: {
            menu_item: {
              select: {
                item_name: true,
                price: true,
                category: { select: { category_name: true, type: true } },
              },
            },
          },
        },
        payments: {
          include: {
            method: { select: { method_name: true } },
          },
        },
      },
      orderBy: { order_date: "desc" },
    });

    
    
    const totalRevenue = orders
      .filter(o => o.status === "Paid")
      .reduce((sum, o) => {
        return sum + o.order_items.reduce((s, oi) => s + Number(oi.unit_price) * oi.quantity, 0);
      }, 0);

    res.json({
      date: dateStr,
      table_id: tableId,
      orders,
      summary: {
        total_orders: orders.length,
        paid_orders: orders.filter(o => o.status === "Paid").length,
        total_revenue: totalRevenue.toFixed(2),
      },
    });
  } catch (error) {
    console.error("getOrderHistory error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
