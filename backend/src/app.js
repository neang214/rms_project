import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes          from "./modules/auth/auth.route.js";
import userRoutes          from "./modules/users/user.route.js";
import menuCategoryRoutes  from "./modules/menuCategories/menuCategory.route.js";
import menuItemRoutes      from "./modules/menuItems/menuItem.route.js";
import tableRoutes         from "./modules/tables/table.route.js";
import orderRoutes         from "./modules/orders/order.route.js";
import orderItemRoutes     from "./modules/orderItems/orderItem.route.js";
import paymentRoutes       from "./modules/payments/payment.route.js";
import paymentMethodRoutes from "./modules/paymentMethods/paymentMethod.route.js";
import stockRoutes         from "./modules/stock/stock.route.js";
import stockOrderRoutes    from "./modules/stockOrders/stockOrder.route.js";
import supplierRoutes      from "./modules/suppliers/supplier.route.js";
import analyticsRoutes     from "./modules/analytics/analytics.route.js";
import unitRouter          from "./modules/unit/unit.route.js";
import khqrRoutes          from "./modules/payments/khqr.route.js";

const app = express();

app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use("/api/auth",            authRoutes);
app.use("/api/users",           userRoutes);
app.use("/api/menu-categories", menuCategoryRoutes);
app.use("/api/menu-items",      menuItemRoutes);
app.use("/api/tables",          tableRoutes);
app.use("/api/orders",          orderRoutes);
app.use("/api/order-items",     orderItemRoutes);
app.use("/api/payments",        paymentRoutes);
app.use("/api/payments/khqr",   khqrRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);
app.use("/api/stock",           stockRoutes);
app.use("/api/stock-orders",    stockOrderRoutes);
app.use("/api/suppliers",       supplierRoutes);
app.use("/api/analytics",       analyticsRoutes);
app.use("/api/units",           unitRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export { app };
