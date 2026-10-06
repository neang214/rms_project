// prisma/seed.js
// Run: node prisma/seed.js
//
// Sets up a working dev environment from empty tables: menu categories,
// one login per role (including the new "server" role), a few tables,
// and a handful of menu items across every category. Safe to run more
// than once — everything is upserted by its unique field.
//
// No qr_token, no GuestSession — guest self-ordering was removed, so
// there's nothing to seed for it.

import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

// Generic placeholder image so menu items look right in the UI.
// Swap these for real uploads later — this is throwaway test data.
const PLACEHOLDER = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

async function seedCategories() {
  console.log("🌱 Seeding menu categories...");
  const categories = [
    { category_name: "Main Course",  type: "food" },
    { category_name: "Appetizers",   type: "food" },
    { category_name: "Snacks",       type: "food" },
    { category_name: "Desserts",     type: "food" },
    { category_name: "Coffee & Tea", type: "drink" },
    { category_name: "Soft Drinks",  type: "drink" },
    { category_name: "Wine",         type: "drink" },
  ];

  const byName = {};
  for (const cat of categories) {
    const created = await prisma.menuCategory.upsert({
      where:  { category_name: cat.category_name },
      update: {},
      create: cat,
    });
    byName[cat.category_name] = created.category_id;
    console.log(`   ${cat.category_name} (${cat.type}) → id: ${created.category_id}`);
  }
  return byName;
}

async function seedUsers() {
  console.log("\n🌱 Seeding one login per role...");

  // Reads from SEED_PASSWORD so a real password never has to be hardcoded
  // in a file that's likely to end up in git. Falls back to a dev default
  // ONLY for local/throwaway databases — the warning below is deliberately
  // loud so it's hard to miss if this ever points at something real.
  const DEV_PASSWORD = process.env.SEED_PASSWORD || "password123";
  if (!process.env.SEED_PASSWORD) {
    console.warn(
      "\n⚠️  SEED_PASSWORD not set in .env — using the default dev password.\n" +
      "   Set SEED_PASSWORD before running this against anything but a\n" +
      "   local/throwaway database, and never commit a real one to git.\n"
    );
  }
  const hashed = await bcrypt.hash(DEV_PASSWORD, 10);

  const users = [
    { username: "admin",   email: "admin@rms.test",   role: "admin"   },
    { username: "cashier", email: "cashier@rms.test", role: "cashier" },
    { username: "kitchen", email: "kitchen@rms.test", role: "kitchen" },
    { username: "barista", email: "barista@rms.test", role: "barista" },
    { username: "server",  email: "server@rms.test",  role: "server"  },
  ];

  for (const u of users) {
    const created = await prisma.user.upsert({
      where:  { username: u.username },
      update: {},
      create: { ...u, password: hashed },
      select: { user_id: true, username: true, role: true },
    });
    console.log(`   ${created.username} (${created.role}) → id: ${created.user_id}`);
  }
  console.log(
    process.env.SEED_PASSWORD
      ? "   ℹ️  All dev logins use the password from SEED_PASSWORD."
      : '   ℹ️  All dev logins use the default dev password: "password123"'
  );
}

async function seedTables() {
  console.log("\n🌱 Seeding tables...");
  const tableNumbers = ["T1", "T2", "T3", "T4", "T5", "T6"];

  for (const table_number of tableNumbers) {
    const created = await prisma.table.upsert({
      where:  { table_number },
      update: {},
      create: { table_number, capacity: 4, is_available: true },
    });
    console.log(`   ${created.table_number} → id: ${created.table_id}`);
  }
}

async function seedPaymentMethods() {
  console.log("\n🌱 Seeding payment methods...");
  // "KHQR" matches exactly what khqr.controller.js auto-creates on a real
  // Bakong payment, and the name PaymentDialog.jsx's /khqr|aba|bakong/i
  // regex looks for to show the KHQR tab — keep this spelling if you add
  // more methods later.
  const methods = ["Cash", "Card", "KHQR"];

  for (const method_name of methods) {
    const created = await prisma.paymentMethod.upsert({
      where:  { method_name },
      update: {},
      create: { method_name },
    });
    console.log(`   ${created.method_name} → id: ${created.method_id}`);
  }
}

async function seedMenuItems(categoryIds) {
  console.log("\n🌱 Seeding menu items...");

  const items = [
    // ---- Main Course (food → kitchen) ----
    { item_name: "Beef Burger",        category_id: categoryIds["Main Course"],  price: 6.50 },
    { item_name: "Grilled Chicken",    category_id: categoryIds["Main Course"],  price: 7.00 },
    { item_name: "Khmer Beef Stew",    category_id: categoryIds["Main Course"],  price: 6.00 },

    // ---- Appetizers (food → kitchen) ----
    { item_name: "Spring Rolls",       category_id: categoryIds["Appetizers"],   price: 3.50 },
    { item_name: "Fried Calamari",     category_id: categoryIds["Appetizers"],   price: 4.50 },

    // ---- Snacks (food → kitchen) ----
    { item_name: "French Fries",       category_id: categoryIds["Snacks"],       price: 2.50 },
    { item_name: "Garlic Bread",       category_id: categoryIds["Snacks"],       price: 2.00 },

    // ---- Desserts (food → kitchen) ----
    { item_name: "Chocolate Cake",     category_id: categoryIds["Desserts"],     price: 3.00 },
    { item_name: "Mango Sticky Rice",  category_id: categoryIds["Desserts"],     price: 3.50 },

    // ---- Coffee & Tea (drink → barista) ----
    { item_name: "Iced Coffee",        category_id: categoryIds["Coffee & Tea"], price: 2.00 },
    { item_name: "Cappuccino",         category_id: categoryIds["Coffee & Tea"], price: 2.50 },
    { item_name: "Green Tea",          category_id: categoryIds["Coffee & Tea"], price: 1.50 },

    // ---- Soft Drinks (drink → barista) ----
    { item_name: "Coca-Cola",          category_id: categoryIds["Soft Drinks"],  price: 1.50 },
    { item_name: "Fresh Lemonade",     category_id: categoryIds["Soft Drinks"],  price: 2.00 },

    // ---- Wine (drink → barista) ----
    { item_name: "House Red Wine",     category_id: categoryIds["Wine"],         price: 5.00 },
    { item_name: "House White Wine",   category_id: categoryIds["Wine"],         price: 5.00 },
  ];

  for (const item of items) {
    const existing = await prisma.menuItem.findFirst({
      where: { item_name: item.item_name, category_id: item.category_id },
      select: { menu_item_id: true },
    });

    const created = existing
      ? await prisma.menuItem.update({
          where: { menu_item_id: existing.menu_item_id },
          data: {},
        })
      : await prisma.menuItem.create({
          data: { ...item, available: true, image_url: PLACEHOLDER },
        });

    console.log(`   ${item.item_name} → id: ${created.menu_item_id} ($${item.price})`);
  }

  console.log(`\n🎉 Seeded ${items.length} menu items across ${Object.keys(categoryIds).length} categories.`);
  console.log("ℹ️  Swap image_url on these (or delete them) once you add your real menu.");
}

async function main() {
  const categoryIds = await seedCategories();
  await seedUsers();
  await seedTables();
  await seedPaymentMethods();
  await seedMenuItems(categoryIds);
  console.log("\n✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
