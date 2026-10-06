import prisma from "../../utils/db.js";

export const getAllCategories = async (req, res) => {
  try {
    const menuCategories = await prisma.menuCategory.findMany();
    if (menuCategories.length === 0) {
      return res.status(200).json([]); 
    }
    res.status(200).json(menuCategories);
  } catch {
    res.status(500).json({ message: "Server Error." });
  }
};

export const getCategory = async (req, res) => {
  try {
    const category = await prisma.menuCategory.findUnique({
      where: { category_id: parseInt(req.params.id) },
    });
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.status(200).json(category);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createCategory = async (req, res) => {
  const { category_name, type } = req.body; 
  try {
    const menuCategory = await prisma.menuCategory.create({
      data: { 
        category_name, 
        type
      },
    });
    res.status(201).json(menuCategory);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Category already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCategory = async (req, res) => {
  const { category_name, type } = req.body;
  try {
    await prisma.menuCategory.update({
      where: { category_id: parseInt(req.params.id) },
      data: { category_name, type },
      select: { category_id: true, category_name: true },
    });

    res.status(200).json({ message: "Category updated"});
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await prisma.menuCategory.delete({
      where: { category_id: parseInt(req.params.id) },
    });
    res.json({ message: "Category deleted" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Category not found" });
    }
    if (error.code === "P2003") {
      return res.status(400).json({ code: "CATEGORY_HAS_ITEMS", message: "Can't delete this category — it still has menu items in it. Move or delete those items first." });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
