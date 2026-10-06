import "dotenv/config";
import http from "http";
import { app } from "./app.js";
import { initSocket } from "./sockets/index.js";
import prisma from "./utils/db.js";

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);
initSocket(server);

setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    console.error("Neon keepalive failed:", e.message);
  }
}, 4 * 60 * 1000);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
