// prisma/seed-menu-items.js
// Run: node prisma/seed-menu-items.js
//
// Adds a handful of sample menu items across every category, purely for
// testing the guest -> kitchen/barista -> cashier order flow end-to-end.
// Replace/delete these once you're adding real items with real images
// through the admin UI.

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

// Generic placeholder image so image_url (required) is never empty.
// Swap these for your own uploads later — these are throwaway test data.
const PLACEHOLDER = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

async function main() {
  console.log("🌱 Seeding test menu items...");

  const categories = await prisma.menuCategory.findMany();
  const findCat = (name) => {
    const cat = categories.find((c) => c.category_name === name);
    if (!cat) throw new Error(`Category "${name}" not found — run the main seed first.`);
    return cat.category_id;
  };

  const items = [
    // ---- Main Course (food → kitchen) ----
    { item_name: "Beef Burger",        category_id: findCat("Main Course"), price: 6.50 },
    { item_name: "Grilled Chicken",    category_id: findCat("Main Course"), price: 7.00 },
    { item_name: "Khmer Beef Stew",    category_id: findCat("Main Course"), price: 6.00 },

    // ---- Appetizers (food → kitchen) ----
    { item_name: "Spring Rolls",       category_id: findCat("Appetizers"),  price: 3.50 },
    { item_name: "Fried Calamari",     category_id: findCat("Appetizers"),  price: 4.50 },

    // ---- Snacks (food → kitchen) ----
    { item_name: "French Fries",       category_id: findCat("Snacks"),     price: 2.50 },
    { item_name: "Garlic Bread",       category_id: findCat("Snacks"),     price: 2.00 },

    // ---- Desserts (food → kitchen) ----
    { item_name: "Chocolate Cake",     category_id: findCat("Desserts"),   price: 3.00 },
    { item_name: "Mango Sticky Rice",  category_id: findCat("Desserts"),   price: 3.50 },

    // ---- Coffee & Tea (drink → barista) ----
    { item_name: "Iced Coffee",        category_id: findCat("Coffee & Tea"), price: 2.00 },
    { item_name: "Cappuccino",         category_id: findCat("Coffee & Tea"), price: 2.50 },
    { item_name: "Green Tea",          category_id: findCat("Coffee & Tea"), price: 1.50 },

    // ---- Soft Drinks (drink → barista) ----
    { item_name: "Coca-Cola",          category_id: findCat("Soft Drinks"), price: 1.50 },
    { item_name: "Fresh Lemonade",     category_id: findCat("Soft Drinks"), price: 2.00 },

    // ---- Wine (drink → barista) ----
    { item_name: "House Red Wine",     category_id: findCat("Wine"),        price: 5.00 },
    { item_name: "House White Wine",   category_id: findCat("Wine"),        price: 5.00 },
  ];

  for (const item of items) {
    const created = await prisma.menuItem.upsert({
      where: {
        // no unique constraint on item_name alone, so check by name +
        // category to avoid duplicate inserts if this script runs twice
        menu_item_id: (await prisma.menuItem.findFirst({
          where: { item_name: item.item_name, category_id: item.category_id },
          select: { menu_item_id: true },
        }))?.menu_item_id ?? -1,
      },
      update: {},
      create: {
        item_name: item.item_name,
        category_id: item.category_id,
        price: item.price,
        available: true,
        image_url: PLACEHOLDER,
      },
    });
    console.log(`   ${item.item_name} → id: ${created.menu_item_id} ($${item.price})`);
  }

  console.log("\n🎉 Test menu items seeded — 16 items across 7 categories.");
  console.log("ℹ️  Swap image_url on these (or delete them) once you add your real menu.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });