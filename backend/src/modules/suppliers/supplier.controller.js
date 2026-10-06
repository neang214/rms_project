import prisma from "../../utils/db.js";

export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { supplier_name: "asc" },
    });
    res.status(200).json(suppliers);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSupplier = async (req, res) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { supplier_id: parseInt(req.params.id) },
      include: {
        _count: { select: { stock_orders: true } },
      },
    });

    if (!supplier)
      return res.status(404).json({ message: "Supplier not found" });

    res.status(200).json(supplier);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createSupplier = async (req, res) => {
  const { supplier_name, phone, email } = req.body;

  if (!supplier_name) {
    return res.status(400).json({ message: "Supplier name is required" });
  }

  try {
    const supplier = await prisma.supplier.create({
      data: { supplier_name, phone, email },
    });

    res.status(201).json(supplier);
  } catch (error) {
    if (error.code === "P2002")
      return res
        .status(400)
        .json({ message: "Supplier with this email already exists" });

    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSupplier = async (req, res) => {
  const { supplier_name, phone, email } = req.body;
  try {
    const supplier = await prisma.supplier.update({
      where: { supplier_id: parseInt(req.params.id) },
      data: { supplier_name, phone, email },
    });

    res.status(200).json(supplier);
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Supplier not found" });
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    await prisma.supplier.delete({
      where: { supplier_id: parseInt(req.params.id) },
    });

    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Supplier not found" });

    if (error.code === "P2003")
      return res
        .status(400)
        .json({ code: "SUPPLIER_HAS_RECORDS", message: "Cannot delete supplier with active stock orders" });

    res.status(500).json({ message: "Internal server error" });
  }
};
