import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { sendSuccess } from "../utils/apiResponse.js";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  const stateMap: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const dbState = stateMap[mongoose.connection.readyState] || "unknown";
  return sendSuccess(res, {
    status: "ok",
    db: dbState,
    timestamp: new Date().toISOString(),
  });
});

export default router;
