import prisma from "../../utils/db.js";
import { Prisma } from "../../generated/prisma/client.js";

export const getAllItems = async (req, res) => {
    try {
        const menuItems = await prisma.menuItem.findMany();
        if (menuItems.length === 0) {
            return res.status(200).json([]);
        }
        res.json(menuItems);
    } catch {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getItemsByCategory = async (req, res) => {
    try {
        const menuItems = await prisma.menuItem.findMany({
            where: {
                category_id: parseInt(req.params.categoryId),
                available: true, 
            },
            include: {
                category: { select: { category_name: true } }, 
            },
        });

        if (menuItems.length === 0)
            return res
                .status(404)
                .json({ message: "No items found for this category" });

        res.json(menuItems);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getItem = async (req, res) => {
    try {
        const menuItem = await prisma.menuItem.findUnique({
            where: { menu_item_id: parseInt(req.params.id) },
        });
        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }
        res.json(menuItem);
    } catch {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const createItem = async (req, res) => {
    const { item_name, item_name_km, category_id, price, available } = req.body;
    try {
        const menuItem = await prisma.menuItem.create({
            data: {
                item_name,
                item_name_km: item_name_km || null,
                category_id: parseInt(category_id),
                price: new Prisma.Decimal(price),
                available: available === true || available === "true",
            },
        });
        res.status(201).json(menuItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateItem = async (req, res) => {
    const { item_name, item_name_km, price } = req.body;
    try {
        const menuItem = await prisma.menuItem.update({
            where: { menu_item_id: parseInt(req.params.id) },
            data: {
                item_name,
                item_name_km: item_name_km || null,
                price: new Prisma.Decimal(price),
            },
        });
        res.json(menuItem);
    } catch (error) {
        if (error.code === "P2025")
            return res.status(404).json({ message: "Item not found" });
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const toggleItem = async (req, res) => {
    const { available } = req.body;
    const isAvailable =
        available === true || available === "true" || available === 1;
    try {
        const itemId = parseInt(req.params.id);

        if (isNaN(itemId)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        await prisma.menuItem.update({
            where: { menu_item_id: itemId },
            data: { available: isAvailable },
        });

        res.json({
            message: "Status updated successfully",
            available: isAvailable,
        });
    } catch (error) {
        if (error.code === "P2025")
            return res.status(404).json({ message: "Item not found" });
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const uploadItemImage = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No image file provided" });
 
    
    
    const imageUrl = `/uploads/${req.file.filename}`;
 
    const updated = await prisma.menuItem.update({
      where: { menu_item_id: parseInt(req.params.id) },
      data: { image_url: imageUrl },
    });
 
    res.json({ image_url: imageUrl, menu_item: updated });
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Menu item not found" });
    console.error("uploadItemImage error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteItem = async (req, res) => {
    try {
        await prisma.menuItem.delete({
            where: { menu_item_id: parseInt(req.params.id) },
        });
        res.json({ message: "Menu deleted" });
    } catch (error) {
        if (error.code === "P2025")
            return res.status(404).json({ message: "Item not found" });
        if (error.code === "P2003")
            return res.status(400).json({ code: "ITEM_HAS_ORDERS", message: "Can't delete this item — it has already been ordered before. Mark it unavailable instead." });
        res.status(500).json({ message: "Internal Server Error" });
    }
};
