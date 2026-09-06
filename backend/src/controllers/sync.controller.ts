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
