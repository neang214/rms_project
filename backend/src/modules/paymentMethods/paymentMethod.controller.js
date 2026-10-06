import prisma from "../../utils/db.js";

export const getAllMethods = async (req, res) => {
  try {
    const methods = await prisma.paymentMethod.findMany();

    res.status(201).json(methods);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createMethod = async (req, res) => {
  const { method_name } = req.body;

  if (!method_name) {
    return res.status(400).json({ message: "Method name is required" });
  }

  try {
    const method = await prisma.paymentMethod.create({
      data: { method_name },
    });

    res.status(201).json(method);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Method already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMethod = async (req, res) => {
  try {
    await prisma.paymentMethod.delete({
      where: { method_id: parseInt(req.params.id) },
    });

    res.status(200).json({ message: "Method deleted successfully" });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Method not found" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
