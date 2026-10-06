import prisma from "../../utils/db.js";
import bcrypt from "bcrypt";

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        user_id: true,
        username: true,
        email: true,
        role: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    });

    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(req.params.id) },
      select: {
        user_id: true,
        username: true,
        email: true,
        role: true,
        created_at: true,
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashed, role },
      select: {
        user_id: true,
        username: true,
        email: true,
        role: true,
        created_at: true,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { username, email, role, password } = req.body;

  try {
    const updateData = { username, email, role };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { user_id: parseInt(req.params.id) },
      data: updateData,
      select: { user_id: true, username: true, email: true, role: true },
    });

    res.status(200).json(user);
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "User not found" });
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { user_id: parseInt(req.params.id) },
    });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    if (error.code === "P2025")
      return res.status(404).json({ message: "User not found" });
    if (error.code === "P2003")
      return res.status(400).json({ code: "USER_HAS_RECORDS", message: "Can't delete this user — they have orders or payments on record." });
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
