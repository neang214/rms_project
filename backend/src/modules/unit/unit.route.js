import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import * as unitController from "./unit.controller.js";

const router = express.Router();

router.get("/", authenticate, authorize("admin"), unitController.getAllUnits);
router.get("/:id", authenticate, authorize("admin"), unitController.getUnitById);
router.post("/", authenticate, authorize("admin"), unitController.createUnit);
router.put("/:id", authenticate, authorize("admin"), unitController.updateUnit);
router.delete("/:id", authenticate, authorize("admin"), unitController.deleteUnit);

export default router;