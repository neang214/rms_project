import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import * as stockOrderController from "./stockOrder.controller.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("admin"),
  stockOrderController.getAllPurchaseOrders,
);

router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  stockOrderController.getPurchaseOrder,
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  stockOrderController.createPurchase,
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  stockOrderController.updateStatus,
);

export default router;
