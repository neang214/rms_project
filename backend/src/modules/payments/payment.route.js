import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import * as paymentController from "./payment.controller.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("admin", "cashier"),
  paymentController.getAllPayments,
);
router.get(
  "/:id",
  authenticate,
  authorize("admin", "cashier"),
  paymentController.getPaymentById,
);
router.get(
  "/order/:orderId",
  authenticate,
  authorize("admin", "cashier"),
  paymentController.getPaymentByOrder,
);
router.post(
  "/",
  authenticate,
  authorize("admin", "cashier"),
  paymentController.createPayment,
);
router.patch(
  "/:id/status",
  authenticate,
  authorize("admin", "cashier"),
  paymentController.updatePaymentStatus,
);

export default router;
