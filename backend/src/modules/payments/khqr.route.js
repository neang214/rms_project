
import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { generateKHQR, checkKHQR } from "./khqr.controller.js";

const router = express.Router();

router.post(
  "/generate",
  authenticate,
  authorize("cashier", "admin"),
  generateKHQR
);

router.get(
  "/check/:md5",
  authenticate,
  authorize("cashier", "admin"),
  checkKHQR
);

export default router;
