-- Run this against your database, then `npx prisma db push` (matching the
-- db push workflow already used in this project — see the comment in
-- order.controller.js's createOrder) so Prisma Client matches schema.prisma.
--
-- No change needed to the Role enum — "server" was already added to it.

-- 1. Drop the column that gated guest orders pending cashier review.
--    Every order is now created already-trusted by staff.
ALTER TABLE orders DROP COLUMN IF EXISTS confirmed;

-- 2. Drop the QR-token column — table QR codes / guest self-order no
--    longer exist.
ALTER TABLE tables DROP COLUMN IF EXISTS qr_token;

-- 3. Drop the guest_sessions table entirely.
DROP TABLE IF EXISTS guest_sessions;
