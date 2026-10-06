import crypto from "crypto";
import prisma from "../../utils/db.js";
import { getIO } from "../../sockets/index.js";

const generateQrToken = () => crypto.randomBytes(24).toString("hex");

export const getAllTables = async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { table_number: "asc" },
      select: {
        table_id: true,
        table_number: true,
        capacity: true,
        is_available: true,
      },
    });

    res.status(200).json(tables);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllTablesAdmin = async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { table_number: "asc" },
    });
    res.status(200).json(tables);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getTable = async (req, res) => {
  try {
    const table = await prisma.table.findUnique({
      where: { table_id: parseInt(req.params.id) },
      select: {
        table_id: true,
        table_number: true,
        capacity: true,
        is_available: true,
      },
    });

    if (!table) return res.status(404).json({ message: "Table not found" });
    res.status(200).json(table);
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getTableByToken = async (req, res) => {
  try {
    const table = await prisma.table.findUnique({
      where: { qr_token: req.params.token },
    });

    if (!table) return res.status(404).json({ message: "Table not found" });
    res.status(200).json(table);
  } catch (error) {
    console.error("getTableByToken error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createTable = async (req, res) => {
  const { table_number, capacity, is_available } = req.body;
  try {
    const table = await prisma.table.create({
      data: {
        table_number,
        capacity: parseInt(capacity),
        is_available: is_available ?? true,
        qr_token: generateQrToken(),
      },
    });

    const io = getIO();
    
    
    
    const { qr_token, ...safeTable } = table;
    io.to("role:admin").to("role:cashier").emit("table:created", safeTable);

    res.status(201).json(table);
  } catch (error) {
    if (error.code === "P2002")
      return res.status(400).json({ message: "Table number already exists" });
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const regenerateQrToken = async (req, res) => {
  try {
    const table = await prisma.table.update({
      where: { table_id: parseInt(req.params.id) },
      data: { qr_token: generateQrToken() },
    });
    res.status(200).json(table);
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Table not found" });
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTable = async (req, res) => {
  const { table_number, capacity, is_available } = req.body;
  try {
    const table = await prisma.table.update({
      where: { table_id: parseInt(req.params.id) },
      data: {
        table_number,
        capacity: capacity ? parseInt(capacity) : undefined,
        is_available,
      },
    });

    const io = getIO();
    const { qr_token, ...safeTable } = table;
    io.to("role:admin").to("role:cashier").emit("table:updated", safeTable);

    res.status(200).json(table);
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Table not found" });
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTableStatus = async (req, res) => {
  const { is_available } = req.body;
  try {
    const table = await prisma.table.update({
      where: { table_id: parseInt(req.params.id) },
      data: { is_available },
    });

    const io = getIO();
    const { qr_token, ...safeTable } = table;
    io.to("role:admin").to("role:cashier").emit("table:updated", safeTable);

    res.json({ message: "Table updated" });
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Table not found" });
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const tableId = parseInt(req.params.id);
    await prisma.table.delete({
      where: { table_id: tableId },
    });

    const io = getIO();
    io.to("role:admin").to("role:cashier").emit("table:deleted", { table_id: tableId });

    res.status(200).json({ message: "Table deleted successfully" });
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "Table not found" });
    if (error.code === "P2003")
      return res.status(400).json({ code: "TABLE_HAS_ORDERS", message: "Can't delete this table — it still has orders linked to it." });
    return res.status(500).json({ message: "Internal server error" });
  }
};
