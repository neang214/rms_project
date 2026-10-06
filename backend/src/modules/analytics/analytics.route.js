import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import * as analyticController from "./analytic.controller.js";

const router = express.Router();

router.get(
  "/revenue/daily",
  authenticate,
  authorize("admin", "cashier"),
  analyticController.getDailyRevenue,
);

router.get(
  "/revenue/weekly",
  authenticate,
  authorize("admin", "cashier"),
  analyticController.getWeeklyRevenue,
);

router.get(
  "/revenue/monthly",
  authenticate,
  authorize("admin", "cashier"),
  analyticController.getMonthlyRevenue,
);

router.get(
  "/menu/top-selling",
  authenticate,
  authorize("admin"),
  analyticController.getTopSelling,
);

router.get(
  "/orders/peak-hours",
  authenticate,
  authorize("admin"),
  analyticController.peakHour,
);

export default router;
