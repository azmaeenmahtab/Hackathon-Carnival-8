import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { sendError } from "../utils/apiResponse.js";

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    return sendError(
      res,
      "RATE_LIMIT_EXCEEDED",
      "Too many requests, please try again later",
      429
    );
  },
});

export const syncRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return (req as any).user?.id || req.ip || "unknown";
  },
  handler: (req: Request, res: Response) => {
    return sendError(
      res,
      "RATE_LIMIT_EXCEEDED",
      "Sync rate limit exceeded (max 10 requests per minute)",
      429
    );
  },
});
