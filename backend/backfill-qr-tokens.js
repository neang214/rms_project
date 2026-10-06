// Run this ONCE before adding the @unique constraint on qr_token, if you
// already have existing rows in the tables table:
//
//   node backfill-qr-tokens.js
//
// Steps to apply this whole change in order:
//   1. Add `qr_token String? @db.VarChar(64)` (OPTIONAL, no @unique yet) to schema.prisma
//   2. npx prisma migrate dev --name add_table_qr_token_nullable
//   3. node backfill-qr-tokens.js   <-- this script
//   4. Change schema.prisma to `qr_token String @unique @db.VarChar(64)` (now required)
//   5. npx prisma migrate dev --name make_qr_token_required

import crypto from "crypto";
import prisma from "./src/utils/db.js"; // adjust path if running from elsewhere

const run = async () => {
  const tables = await prisma.table.findMany({
    where: { qr_token: null },
  });

  console.log(`Found ${tables.length} table(s) without a qr_token. Generating...`);

  for (const table of tables) {
    const token = crypto.randomBytes(24).toString("hex"); // 48-char random token
    await prisma.table.update({
      where: { table_id: table.table_id },
      data: { qr_token: token },
    });
    console.log(`  Table ${table.table_number} -> ${token}`);
  }

  console.log("Done.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
