import prisma from "../../utils/db.js";

export const getAllPurchaseOrders = async (req, res) => {
    try {
        const purchaseOrders = await prisma.stockOrder.findMany({
            include: {
                stock: { select: { item_name: true } },
                supplier: { select: { supplier_name: true } },
                user: { select: { username: true } },
            },
        });
        res.status(200).json(purchaseOrders);
    } catch {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getPurchaseOrder = async (req, res) => {
    try {
        const purchaseOrder = await prisma.stockOrder.findUnique({
            where: { stock_order_id: parseInt(req.params.id) },
        });
        if (!purchaseOrder)
            return res
                .status(404)
                .json({ message: "Purchase order not found" });
        res.json(purchaseOrder);
    } catch {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const createPurchase = async (req, res) => {
    const { invoice, quantity, stock_id, supplier_id } = req.body;
    const user_id = req.user?.userId || null;

    if (!quantity || !stock_id || !supplier_id) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const purchaseOrder = await prisma.stockOrder.create({
            data: {
                invoice,
                quantity: parseInt(quantity),
                user_id,
                stock_id: parseInt(stock_id),
                supplier_id: parseInt(supplier_id),
            },
        });
        res.status(201).json(purchaseOrder);
    } catch {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateStatus = async (req, res) => {
    const { status } = req.body;
    const validate = ["Pending", "Ordered", "Received"];

    if (!validate.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
    }

    try {
        const purchaseOrderId = parseInt(req.params.id);

        await prisma.$transaction(async (tx) => {
            const order = await tx.stockOrder.findUnique({
                where: { stock_order_id: purchaseOrderId },
            });

            if (!order) {
                throw new Error("NOT_FOUND");
            }

            
            
            if (status === "Received" && order.status !== "Received") {
                await tx.stock.update({
                    where: { stock_id: order.stock_id },
                    data: { quantity: { increment: order.quantity } },
                });
            }

            await tx.stockOrder.update({
                where: { stock_order_id: purchaseOrderId },
                data: { status },
            });
        });

        res.status(200).json({ message: "Stock order updated successfully" });
    } catch (error) {
        if (error.message === "NOT_FOUND" || error.code === "P2025") {
            return res
                .status(404)
                .json({ message: "Purchase order not found" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};
