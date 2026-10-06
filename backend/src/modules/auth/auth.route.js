import express from "express";
import { authenticate } from "../../middleware/authenticate.js";
import * as authController from "./auth.controller.js";

const router = express.Router();

router.post("/login", authController.login);
router.get("/me", authenticate, authController.checkAuth);
router.post("/logout", authController.logout);

export default router;
