import prisma from "../../utils/db.js";

export const getAllUnits = async (req, res) => {
  try {
    const units = await prisma.unit.findMany();
    res.status(200).json(units);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUnitById = async (req, res) => {
  try {
    const unit = await prisma.unit.findUnique({
      where: { unit_id: parseInt(req.params.id) },
    });
    if (!unit) return res.status(404).json({ message: "Unit not found" });
    res.json(unit);
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createUnit = async (req, res) => {
  const { unit_name } = req.body;
  if (!unit_name)
    return res.status(400).json({ message: "unit_name is required" });
  try {
    const unit = await prisma.unit.create({
      data: { unit_name },
    });
    res.status(201).json(unit);
  } catch (error) {
    if (error.code === "P2002")
      return res.status(409).json({ message: "Unit name already exists" });
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUnit = async (req, res) => {
  const { unit_name } = req.body;
  try {
    const unit = await prisma.unit.update({
      where: { unit_id: parseInt(req.params.id) },
      data: { unit_name },
    });
    res.status(200).json(unit);
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Unit not found" });
    if (error.code === "P2002")
      return res.status(409).json({ message: "Unit name already exists" });
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteUnit = async (req, res) => {
  try {
    await prisma.unit.delete({
      where: { unit_id: parseInt(req.params.id) },
    });
    res.status(200).json({ message: "Unit deleted successfully" });
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Unit not found" });
    res.status(500).json({ message: "Internal server error" });
  }
};