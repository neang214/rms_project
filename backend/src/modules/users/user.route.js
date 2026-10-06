import express from "express";
import * as userController from "./user.controller.js";
import { authorize } from "../../middleware/authorize.js";
import { authenticate } from "../../middleware/authenticate.js";

const router = express.Router();

router.get("/", authenticate, authorize("admin"), userController.getAllUsers);
router.get("/:id", authenticate, authorize("admin"), userController.getUserById);
router.post("/", authenticate, authorize("admin"), userController.createUser);
router.put("/:id", authenticate, authorize("admin"), userController.updateUser);
router.delete("/:id", authenticate, authorize("admin"), userController.deleteUser);

export default router;
