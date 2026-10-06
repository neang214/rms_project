import prisma from "../../utils/db.js";
import { getIO } from "../../sockets/index.js";
import { attachQueueNumbers } from "../../utils/queueNumber.js";

const getQueue = async (type) => {
  const items = await prisma.orderItem.findMany({
    where: {
      status: { in: ["Pending", "Preparing"] },
      menu_item: {
        category: { type },
      },
    },
    include: {
      menu_item: {
        select: {
          item_name: true,
          category: { select: { category_name: true } },
        },
      },
      order: {
        select: {
          order_id: true,
          order_date: true,
          note: true,
          party_size: true,
          table: { select: { table_number: true } },
        },
      },
    },
    orderBy: {
      order: { order_date: "asc" },
    },
  });

  
  
  
  const queueNumbers = await attachQueueNumbers(items.map(i => i.order));
  return items.map(i => ({
    ...i,
    order: { ...i.order, queue_number: queueNumbers.get(i.order.order_id) },
  }));
};

export const getItemsByOrder = async (req, res) => {
  try {
    const items = await prisma.orderItem.findMany({
      where: { order_id: parseInt(req.params.orderId) },
      include: {
        menu_item: {
          select: { item_name: true, price: true },
        },
      },
    });

    res.json(items);
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getKitchenQueue = async (req, res) => {
  try {
    const items = await getQueue("food");
    res.json(items);
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getBaristaQueue = async (req, res) => {
  try {
    const items = await getQueue("drink");
    res.json(items);
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addItem = async (req, res) => {
  const { order_id, menu_item_id, quantity, note } = req.body;

  if (!order_id || !menu_item_id || quantity === undefined) {
    return res.status(400).json({
      message: "Required fields missing: order_id, menu_item_id, quantity",
    });
  }

  const parsedOrderId = parseInt(order_id);
  const parsedMenuItemId = parseInt(menu_item_id);
  const parsedQuantity = parseInt(quantity);

  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 50) {
    return res.status(400).json({ message: "quantity must be between 1 and 50" });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { order_id: parsedOrderId },
      select: { order_id: true, status: true, table_id: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Paid") {
      return res
        .status(400)
        .json({ message: "This order has already been paid and is closed" });
    }

    const menuItem = await prisma.menuItem.findUnique({
      where: { menu_item_id: parsedMenuItemId },
      select: { price: true, available: true, item_name: true, category: { select: { type: true } } },
    });

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    if (!menuItem.available) {
      return res.status(400).json({ message: "Menu item is not available" });
    }

    const orderItem = await prisma.orderItem.create({
      data: {
        order_id: parsedOrderId,
        menu_item_id: parsedMenuItemId,
        quantity: parsedQuantity,
        unit_price: menuItem.price,
        note: note ? String(note).slice(0, 255) : null,
      },
      include: {
        menu_item: { select: { item_name: true, price: true } },
        order: { select: { order_id: true, table: { select: { table_number: true } } } },
      },
    });

    const io = getIO();

    io.to("role:cashier").to("role:server").emit("order_item:new", orderItem);
    io.to(`table:${order.table_id}`).emit("order_item:new", orderItem);

    if (menuItem.category?.type === "food") {
      io.to("role:kitchen").emit("order_item:new", orderItem);
    } else if (menuItem.category?.type === "drink") {
      io.to("role:barista").emit("order_item:new", orderItem);
    }

    res.status(201).json(orderItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateItemStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["Pending", "Preparing", "Ready"];

  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
  }

  try {
    const orderItem = await prisma.orderItem.update({
      where: { order_item_id: parseInt(req.params.id) },
      data: { status },
      include: {
        menu_item: { select: { item_name: true, category: { select: { type: true } } } },
      },
    });

    const io = getIO();
    const room = orderItem.menu_item?.category?.type === "drink" ? "role:barista" : "role:kitchen";
    io.to(room).to("role:cashier").to("role:server").emit("order_item:status_changed", orderItem);

    if (status === "Ready") {
      const allItems = await prisma.orderItem.findMany({
        where: { order_id: orderItem.order_id },
        select: { status: true },
      });

      const allReady = allItems.every((item) => item.status === "Ready");

      if (allReady) {
        const updatedOrder = await prisma.order.update({
          where: { order_id: orderItem.order_id },
          data: { status: "Served" },
        });
        io.to("role:cashier").to("role:admin").to("role:server").emit("order:status_changed", updatedOrder);
        io.to(`table:${updatedOrder.table_id}`).emit("order:status_changed", updatedOrder);
      }
    }

    res.json(orderItem);
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Order item not found" });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateItemNote = async (req, res) => {
  const { note } = req.body;
  try {
    const existing = await prisma.orderItem.findUnique({
      where: { order_item_id: parseInt(req.params.id) },
    });

    if (!existing) {
      return res.status(404).json({ message: "Order item not found" });
    }

    if (existing.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Cannot edit the note on an item that's already being prepared" });
    }

    const orderItem = await prisma.orderItem.update({
      where: { order_item_id: parseInt(req.params.id) },
      data: { note: note ? String(note).slice(0, 255) : null },
      include: {
        menu_item: { select: { item_name: true, category: { select: { type: true } } } },
      },
    });

    const io = getIO();
    const room = orderItem.menu_item?.category?.type === "drink" ? "role:barista" : "role:kitchen";
    io.to(room).to("role:cashier").emit("order_item:note_changed", orderItem);

    res.json(orderItem);
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Order item not found" });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const orderItem = await prisma.orderItem.findUnique({
      where: { order_item_id: parseInt(req.params.id) },
    });

    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" });
    }

    if (orderItem.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Cannot remove item that is already being prepared" });
    }

    await prisma.orderItem.delete({
      where: { order_item_id: parseInt(req.params.id) },
    });

    res.status(200).json({ message: "Item successfully removed from order" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};
