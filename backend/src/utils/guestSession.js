import crypto from "crypto";
import prisma from "./db.js";

const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createGuestSession(table_id) {
  const rawToken = crypto.randomBytes(32).toString("hex"); // 256-bit
  const token_hash = hashToken(rawToken);
  const expires_at = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.guestSession.create({
    data: { token_hash, table_id, expires_at },
  });

  return { rawToken, expires_at };
}

export async function resolveGuestSession(rawToken) {
  if (!rawToken) return null;

  const session = await prisma.guestSession.findUnique({
    where: { token_hash: hashToken(rawToken) },
  });

  if (!session) return null;
  if (session.expires_at < new Date()) return null;

  return session;
}

export async function deleteExpiredGuestSessions() {
  return prisma.guestSession.deleteMany({
    where: { expires_at: { lt: new Date() } },
  });
}
