import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Thread } from "../models/Thread.js";
import { computeNeedsFollowUp } from "../services/followUpService.js";
import { sendSuccess } from "../utils/apiResponse.js";

export async function getOverviewStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const threads = await Thread.find({ userId: userObjectId });

    let critical = 0;
    let high = 0;
    let needsFollowUp = 0;
    let unread = 0;

    for (const t of threads) {
      if (t.urgency === "Critical") critical++;
      if (t.urgency === "High") high++;
      if (t.isRead === false) unread++;
      if (computeNeedsFollowUp(t).needsFollowUp) needsFollowUp++;
    }

    return sendSuccess(res, {
      critical,
      high,
      needsFollowUp,
      unread,
      totalThreads: threads.length,
    });
  } catch (error) {
    next(error);
  }
}
