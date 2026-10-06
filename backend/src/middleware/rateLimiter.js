import rateLimit from "express-rate-limit";

export const writeRateLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 20,             
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please wait a moment and try again.",
  },
});
