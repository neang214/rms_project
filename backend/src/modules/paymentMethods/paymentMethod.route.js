import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import * as methodController from "./paymentMethod.controller.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("admin", "cashier"),
  methodController.getAllMethods,
);

router.post(
  "/",
  authenticate,
  authorize("admin", "cashier"),
  methodController.createMethod,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin", "cashier"),
  methodController.deleteMethod,
);

export default router;
