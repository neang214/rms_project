import express from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import * as orderController from "./order.controller.js";

const router = express.Router();

const createOrderLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many orders from this device. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// SECURITY FIX: this route previously had no auth middleware at all — it
// relied solely on requireGuestSessionIfGuestChannel, which only gated
// requests claiming channel:"guest" and called next() unconditionally for
// everything else. Any unauthenticated request could create a fully
// confirmed order. Now that staff are the only callers, it needs real
// auth like every other route here.
router.post(
  "/",
  createOrderLimit,
  authenticate,
  authorize("admin", "cashier", "server"),
  orderController.createOrder,
);

router.get("/table/:tableId", authenticate, authorize("admin", "cashier", "server"), orderController.getActiveOrderByTable);

router.get(
  "/history",
  authenticate,
  authorize("admin", "cashier"),
  orderController.getOrderHistory,
);

router.get(
  "/",
  authenticate,
  authorize("cashier", "admin", "server"),
  orderController.getAllOrders,
);
router.get(
  "/:id",
  authenticate,
  authorize("cashier", "admin", "server"),
  orderController.getOrderById,
);
router.patch(
  "/:id/status",
  authenticate,
  authorize("cashier"),
  orderController.updateOrderStatus,
);
router.delete(
  "/:id",
  authenticate,
  authorize("cashier", "admin"),
  orderController.deleteOrder,
);

export default router;
