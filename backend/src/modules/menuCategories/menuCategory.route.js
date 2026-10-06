import express from "express";
import * as categoryController from "./menuCategory.controller.js";
import { authorize } from "../../middleware/authorize.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategory);
router.post("/", authenticate, authorize("admin"), categoryController.createCategory);
router.put("/:id", authenticate, authorize("admin"), categoryController.updateCategory);
router.delete("/:id", authenticate, authorize("admin"), categoryController.deleteCategory);

export default router;
