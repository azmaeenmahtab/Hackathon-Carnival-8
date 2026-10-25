import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { MockIngestionProvider } from "../providers/ingestion/MockIngestionProvider.js";
import { classifierService } from "../providers/classification/ClassifierService.js";
import { Thread } from "../models/Thread.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

const mockProvider = new MockIngestionProvider();

export async function syncMock(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const { reset } = req.body || {};

    if (reset) {
      await Thread.deleteMany({ userId: userObjectId });
      logger.info({ userId }, "Reset user threads prior to mock sync");
    }

    const rawThreads = await mockProvider.fetchThreads(userId);
    let ingested = 0;
    let failed = 0;

    for (const raw of rawThreads) {
      try {
        const classification = await classifierService.classifyThread(raw);

        await Thread.findOneAndUpdate(
          {
            userId: userObjectId,
            externalThreadId: raw.externalThreadId,
          },
          {
            userId: userObjectId,
            externalThreadId: raw.externalThreadId,
            subject: raw.subject,
            participants: raw.participants,
            messages: raw.messages,
            messageCount: raw.messages.length,
            category: classification.category,
            urgency: classification.urgency,
            actionNeeded: classification.actionNeeded,
            deadline: classification.deadline,
            aiExplanation: classification.aiExplanation,
            classificationStatus: classification.status,
            classificationError: classification.error,
            isRead: raw.mockIsRead ?? false,
            lastMessageAt: raw.lastMessageAt,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        ingested++;
        if (classification.status === "failed") {
          failed++;
        }
      } catch (itemErr: any) {
        logger.error(
          { error: itemErr.message, threadId: raw.externalThreadId },
          "Error ingesting thread"
        );
        failed++;
      }
    }

    return sendSuccess(res, {
      ingested,
      reclassified: 0,
      failed,
    });
  } catch (error) {
    next(error);
  }
}

const gmailProvider = new (await import("../providers/ingestion/GmailIngestionProvider.js")).GmailIngestionProvider();

export async function syncGmail(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const { EmailAccountLink } = await import("../models/EmailAccountLink.js");
    const { DigestCache } = await import("../models/DigestCache.js");

    // Check link exists
    const link = await EmailAccountLink.findOne({
      userId: userObjectId,
      provider: "gmail",
    });

    if (!link || !link.gmailRefreshTokenEncrypted) {
      return res.status(400).json({
        success: false,
        error: {
          code: "GMAIL_NOT_CONNECTED",
          message: "Please connect your Gmail account before syncing.",
        },
      });
    }

    // Set syncing status
    await EmailAccountLink.updateOne(
      { userId: userObjectId, provider: "gmail" },
      { syncStatus: "syncing" }
    );

    const rawThreads = await gmailProvider.fetchThreads(userId);

    let ingested = 0;
    let failed = 0;

    for (const raw of rawThreads) {
      try {
        const classification = await classifierService.classifyThread(raw);

        await Thread.findOneAndUpdate(
          {
            userId: userObjectId,
            externalThreadId: raw.externalThreadId,
          },
          {
            userId: userObjectId,
            externalThreadId: raw.externalThreadId,
            subject: raw.subject,
            participants: raw.participants,
            messages: raw.messages,
            messageCount: raw.messages.length,
            category: classification.category,
            urgency: classification.urgency,
            actionNeeded: classification.actionNeeded,
            deadline: classification.deadline,
            aiExplanation: classification.aiExplanation,
            classificationStatus: classification.status,
            classificationError: classification.error,
            isRead: false,
            lastMessageAt: raw.lastMessageAt,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        ingested++;
        if (classification.status === "failed") {
          failed++;
        }
      } catch (itemErr: any) {
        logger.error(
          { error: itemErr.message, threadId: raw.externalThreadId },
          "Error ingesting Gmail thread"
        );
        failed++;
      }
    }

    // Invalidate digest cache so fresh digest is generated from live emails
    await DigestCache.deleteOne({ userId: userObjectId });

    // Mark sync completed
    await EmailAccountLink.updateOne(
      { userId: userObjectId, provider: "gmail" },
      { lastSyncedAt: new Date(), syncStatus: "idle" }
    );

    return sendSuccess(res, {
      ingested,
      reclassified: 0,
      failed,
    });
  } catch (error) {
    try {
      const userObjectId = new mongoose.Types.ObjectId(req.user!.id);
      const { EmailAccountLink } = await import("../models/EmailAccountLink.js");
      await EmailAccountLink.updateOne(
        { userId: userObjectId, provider: "gmail" },
        { syncStatus: "error" }
      );
    } catch {
      // ignore
    }
    next(error);
  }
}
