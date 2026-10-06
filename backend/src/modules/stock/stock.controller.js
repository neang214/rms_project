import prisma from "../../utils/db.js";
import { sendTelegramMessage, stockUsedMessage, lowStockMessage } from "../../utils/telegram.js";

export const getAllStockItems = async (req, res) => {
    try {
        const role = req.user?.role;
        let where = undefined;
        if (role === "kitchen") where = { stock_type: { in: ["kitchen", "both"] } };
        else if (role === "barista") where = { stock_type: { in: ["barista", "both"] } };

        const stockItems = await prisma.stock.findMany({
            where,
            include: { unit: true },
        });
        res.status(200).json(stockItems);
    } catch {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getStockById = async (req, res) => {
    try {
        const stockItem = await prisma.stock.findUnique({
            where: { stock_id: parseInt(req.params.id) },
        });
        if (!stockItem)
            return res.status(404).json({ message: "Stock item not found" });
        res.json(stockItem);
    } catch {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getLowStock = async (req, res) => {
    try {
        const lowStock = await prisma.$queryRaw`
      SELECT s.*, u.unit_name 
      FROM stock s
      JOIN units u ON s.unit_id = u.unit_id
      WHERE s.min_level IS NOT NULL 
      AND s.quantity < s.min_level
    `;
        res.json(lowStock);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" + error });
    }
};

export const createStock = async (req, res) => {
    const { item_name, quantity, unit_id, min_level, stock_type } = req.body;
    if (!item_name || !quantity || !unit_id || !min_level)
        return res.status(400).json({ message: "All fields are required" });

    try {
        const stock = await prisma.stock.create({
            data: {
                item_name,
                quantity: parseFloat(quantity),
                unit_id: parseInt(unit_id),
                min_level: parseFloat(min_level),
                stock_type: stock_type || "both",
            },
        });
        res.status(201).json(stock);
    } catch {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateStock = async (req, res) => {
    const { item_name, quantity, unit_id, min_level, stock_type } = req.body;
    try {
        const stock = await prisma.stock.update({
            where: { stock_id: parseInt(req.params.id) },
            data: {
                item_name,
                quantity: quantity != null ? parseFloat(quantity) : undefined,
                unit_id: unit_id != null ? parseInt(unit_id) : undefined,
                min_level: min_level != null ? parseFloat(min_level) : undefined,
                stock_type: stock_type || undefined,
            },
            include: { unit: true },
        });
        res.status(200).json(stock);
    } catch (error) {
        if (error.code === "P2025")
            return res.status(404).json({ message: "Stock not found" });
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const addStockQuantity = async (req, res) => {
    const quantity = parseInt(req.body.quantity);
    if (isNaN(quantity))
        return res.status(400).json({ message: "Invalid quantity" });

    try {
        const updatedStock = await prisma.stock.update({
            where: { stock_id: parseInt(req.params.id) },
            data: { quantity: { increment: quantity } },
        });

        res.status(200).json(updatedStock);
    } catch (error) {
        if (error.code === "P2025")
            return res.status(404).json({ message: "Stock not found" });
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const decreaseStockQuantity = async (req, res) => {
    const quantity = parseFloat(req.body.quantity);

    if (isNaN(quantity) || quantity <= 0)
        return res.status(400).json({ message: "Invalid quantity" });

    try {
        const stock = await prisma.stock.findUnique({
            where: { stock_id: parseInt(req.params.id) },
            include: { unit: true },
        });

        if (!stock) return res.status(404).json({ message: "Stock not found" });

        if (Number(stock.quantity) < quantity)
            return res
                .status(400)
                .json({ message: "Not enough stock available" });

        const updatedStock = await prisma.stock.update({
            where: { stock_id: parseInt(req.params.id) },
            data: { quantity: { decrement: quantity } },
            include: { unit: true },
        });

        // 1. Always send a usage log so admin knows what was taken and by whom.
        const role = req.user?.role || "staff"
        sendTelegramMessage(stockUsedMessage(updatedStock, quantity, role))
            .catch(err => console.error("Telegram usage log error:", err))

        // 2. Also send a low stock alert if quantity hit or dropped below min_level.
        if (
            updatedStock.min_level !== null &&
            Number(updatedStock.quantity) <= Number(updatedStock.min_level)
        ) {
            sendTelegramMessage(lowStockMessage(updatedStock))
                .catch(err => console.error("Telegram low stock error:", err))
        }

        res.json(updatedStock);
    } catch (error) {
        console.error("decreaseStockQuantity error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteStock = async (req, res) => {
    try {
        await prisma.$transaction(async (tx) => {
            // 1. delete related stock orders first
            await tx.stockOrder.deleteMany({
                where: { stock_id: parseInt(req.params.id) },
            });

            // 2. then delete the stock item
            await tx.stock.delete({
                where: { stock_id: parseInt(req.params.id) },
            });
        });

        res.status(200).json({ message: "Stock deleted successfully" });
    } catch (error) {
        if (error.code === "P2025")
            return res.status(404).json({ message: "Stock not found" });
        res.status(500).json({ message: "Internal server error" });
    }
};

// POST /api/stock/:id/image  (admin, multipart field "image")
// Stores a RELATIVE url so the image keeps working when the API is reached
// through ngrok or a deployed host — the frontend prefixes the API origin.
export const uploadStockImage = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No image file provided" });

    const imageUrl = `/uploads/${req.file.filename}`;

    const updated = await prisma.stock.update({
      where: { stock_id: parseInt(req.params.id) },
      data: { image_url: imageUrl },
    });

    res.json({ image_url: imageUrl, stock: updated });
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Stock item not found" });
    console.error("uploadStockImage error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
