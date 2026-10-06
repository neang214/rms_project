import express from "express";
import { authorize } from "../../middleware/authorize.js";
import { authenticate } from "../../middleware/authenticate.js";
import { upload, setUploadPrefix } from "../../middleware/upload.js";
import * as menuItemController from "./menuItem.controller.js";

const router = express.Router();

router.get("/", menuItemController.getAllItems);
router.get("/category/:categoryId", menuItemController.getItemsByCategory);
router.get("/:id", menuItemController.getItem);
router.post(
  "/",
  authenticate,
  authorize("admin"),
  menuItemController.createItem,
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  menuItemController.updateItem,
);

router.post(
  "/:id/image",
  authenticate,
  authorize("admin"),
  setUploadPrefix("menu"),
  upload.single("image"),
  menuItemController.uploadItemImage,
);

router.patch(
  "/:id/toggle",
  authenticate,
  authorize("admin", "kitchen", "barista"),
  menuItemController.toggleItem,
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  menuItemController.deleteItem,
);

export default router;