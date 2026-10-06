-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."OrderItemStatus" AS ENUM ('Pending', 'Preparing', 'Ready');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('Pending', 'Preparing', 'Served', 'Paid');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('Pending', 'Completed', 'Failed');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('admin', 'cashier', 'barista', 'kitchen');

-- CreateEnum
CREATE TYPE "public"."StockOrderStatus" AS ENUM ('Pending', 'Ordered', 'Received');

-- CreateTable
CREATE TABLE "public"."menu_categories" (
    "category_id" SERIAL NOT NULL,
    "category_name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(10) NOT NULL,

    CONSTRAINT "menu_categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "public"."menu_items" (
    "menu_item_id" SERIAL NOT NULL,
    "item_name" VARCHAR(150) NOT NULL,
    "category_id" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "image_url" TEXT NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("menu_item_id")
);

-- CreateTable
CREATE TABLE "public"."order_items" (
    "order_item_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "menu_item_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "status" "public"."OrderItemStatus" NOT NULL DEFAULT 'Pending',

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("order_item_id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "order_id" SERIAL NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'Pending',
    "note" TEXT,
    "table_id" INTEGER NOT NULL,
    "user_id" INTEGER,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "public"."payment_methods" (
    "method_id" SERIAL NOT NULL,
    "method_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("method_id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "payment_id" SERIAL NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(10,2) NOT NULL,
    "method_id" INTEGER NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'Pending',
    "order_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "public"."stock" (
    "stock_id" SERIAL NOT NULL,
    "item_name" VARCHAR(150) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "min_level" DECIMAL(10,2),
    "last_updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_pkey" PRIMARY KEY ("stock_id")
);

-- CreateTable
CREATE TABLE "public"."stock_orders" (
    "stock_order_id" SERIAL NOT NULL,
    "invoice" VARCHAR(100),
    "quantity" DECIMAL(10,2) NOT NULL,
    "status" "public"."StockOrderStatus" NOT NULL DEFAULT 'Pending',
    "user_id" INTEGER NOT NULL,
    "stock_id" INTEGER NOT NULL,
    "supplier_id" INTEGER NOT NULL,

    CONSTRAINT "stock_orders_pkey" PRIMARY KEY ("stock_order_id")
);

-- CreateTable
CREATE TABLE "public"."suppliers" (
    "supplier_id" SERIAL NOT NULL,
    "supplier_name" VARCHAR(200) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(150),

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("supplier_id")
);

-- CreateTable
CREATE TABLE "public"."tables" (
    "table_id" SERIAL NOT NULL,
    "table_number" VARCHAR(20) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tables_pkey" PRIMARY KEY ("table_id")
);

-- CreateTable
CREATE TABLE "public"."units" (
    "unit_id" SERIAL NOT NULL,
    "unit_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("unit_id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "user_id" SERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "role" "public"."Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "menu_categories_category_name_key" ON "public"."menu_categories"("category_name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_method_name_key" ON "public"."payment_methods"("method_name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "tables_table_number_key" ON "public"."tables"("table_number" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "units_unit_name_key" ON "public"."units"("unit_name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username" ASC);

-- AddForeignKey
ALTER TABLE "public"."menu_items" ADD CONSTRAINT "menu_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."menu_categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("menu_item_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("table_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_method_id_fkey" FOREIGN KEY ("method_id") REFERENCES "public"."payment_methods"("method_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock" ADD CONSTRAINT "stock_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_orders" ADD CONSTRAINT "stock_orders_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "public"."stock"("stock_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_orders" ADD CONSTRAINT "stock_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("supplier_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stock_orders" ADD CONSTRAINT "stock_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

