import express from "express";
import rateLimit from "express-rate-limit";
import { createSession } from "./guestSession.controller.js";

const router = express.Router();

const sessionLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many session requests from this device. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/", sessionLimit, createSession);

export default router;
