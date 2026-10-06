import { Server } from "socket.io";

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join_role", (role) => {
      const validRoles = ["kitchen", "barista", "cashier", "admin", "server"];
      if (validRoles.includes(role)) {
        socket.join(`role:${role}`);
      }
    });

    socket.on("join_table", (tableId) => {
      if (tableId) {
        socket.join(`table:${tableId}`);
      }
    });

    socket.on("leave_table", (tableId) => {
      if (tableId) {
        socket.leave(`table:${tableId}`);
      }
    });

    socket.on("disconnect", () => {
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO has not been initialized yet");
  }
  return io;
}
