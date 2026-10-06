import express from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { requireGuestSession, requireGuestSessionIfGuestChannel } from "../../middleware/guestSession.js";
import * as orderController from "./order.controller.js";

const router = express.Router();

const guestOrderLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many orders from this device. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/", guestOrderLimit, requireGuestSessionIfGuestChannel, orderController.createOrder);

router.patch("/:id/details", guestOrderLimit, requireGuestSession, orderController.updateOrderDetails);
router.get("/session/active", requireGuestSession, orderController.getActiveOrderBySession);
router.get("/table/:tableId", authenticate, authorize("admin", "cashier", "server"), orderController.getActiveOrderByTable);

router.get(
  "/history",
  authenticate,
  authorize("admin", "cashier"),
  orderController.getOrderHistory,
);

router.get(
  "/unconfirmed",
  authenticate,
  authorize("cashier", "admin"),
  orderController.getUnconfirmedOrders,
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
  authorize("cashier", "admin"),
  orderController.getOrderById,
);
router.patch(
  "/:id/status",
  authenticate,
  authorize("cashier"),
  orderController.updateOrderStatus,
);
router.patch(
  "/:id/confirm",
  authenticate,
  authorize("cashier", "admin"),
  orderController.confirmOrder,
);
router.delete(
  "/:id",
  authenticate,
  authorize("cashier", "admin"),
  orderController.deleteOrder,
);

export default router;
