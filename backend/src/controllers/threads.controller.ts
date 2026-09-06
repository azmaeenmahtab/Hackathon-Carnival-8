import { Request, Response, NextFunction } from "express";
import { threadService } from "../services/threadService.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import { ThreadCategory, THREAD_CATEGORIES } from "../models/Thread.js";
import { logger } from "../utils/logger.js";

export async function listThreads(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { category, urgency, needsFollowUp, isRead, page, limit, sort } =
      req.query;

    const result = await threadService.listThreads(userId, {
      category: category ? String(category) : undefined,
      urgency: urgency ? String(urgency) : undefined,
      needsFollowUp:
        needsFollowUp !== undefined ? needsFollowUp === "true" : undefined,
      isRead: isRead !== undefined ? isRead === "true" : undefined,
      page: page ? parseInt(String(page), 10) : 1,
      limit: limit ? parseInt(String(limit), 10) : 20,
      sort: sort as any,
    });

    return sendSuccess(res, result.items, result.meta);
  } catch (error) {
    next(error);
  }
}

export async function getThreadById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const thread = await threadService.getThreadById(userId, id);
    if (!thread) {
      // 404 whether missing or belonging to someone else to avoid leak
      return sendError(res, "THREAD_NOT_FOUND", "Thread not found", 404);
    }

    return sendSuccess(res, thread);
  } catch (error) {
    next(error);
  }
}

export async function markRead(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { isRead } = req.body;

    const updated = await threadService.markRead(userId, id, isRead);
    if (!updated) {
      return sendError(res, "THREAD_NOT_FOUND", "Thread not found", 404);
    }

    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
}

export async function reclassify(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { category } = req.body;

    if (!THREAD_CATEGORIES.includes(category as ThreadCategory)) {
      return sendError(
        res,
        "INVALID_CATEGORY",
        `Category must be one of: ${THREAD_CATEGORIES.join(", ")}`,
        400
      );
    }

    const updated = await threadService.reclassify(userId, id, category);
    if (!updated) {
      return sendError(res, "THREAD_NOT_FOUND", "Thread not found", 404);
    }

    logger.info(
      {
        threadId: id,
        userId,
        originalCategory: updated.category,
        newCategory: category,
      },
      "Faculty manually reclassified thread"
    );

    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
}

export async function getFollowUp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const result = await threadService.getFollowUpThreads(userId);
    return sendSuccess(res, result.items, result.meta);
  } catch (error) {
    next(error);
  }
}

export async function getOther(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const result = await threadService.getOtherThreads(userId);
    return sendSuccess(res, result.items, result.meta);
  } catch (error) {
    next(error);
  }
}

export async function ingestIncomingEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const userObjectId = new (await import("mongoose")).default.Types.ObjectId(userId);
    const { subject, sender, body, isFaculty = false } = req.body;

    const { classifierService } = await import("../providers/classification/ClassifierService.js");
    const { Thread } = await import("../models/Thread.js");
    const { DigestCache } = await import("../models/DigestCache.js");

    const now = new Date();
    const externalThreadId = `th-inbound-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const raw = {
      externalThreadId,
      subject,
      participants: [sender],
      lastMessageAt: now,
      messages: [
        {
          sender,
          senderIsFaculty: Boolean(isFaculty),
          sentAt: now,
          body,
        },
      ],
    };

    // Run AI Classification Pipeline
    const classification = await classifierService.classifyThread(raw);

    // Save directly to MongoDB Atlas
    const newThread = await Thread.create({
      userId: userObjectId,
      externalThreadId,
      subject,
      participants: [sender],
      messages: raw.messages,
      messageCount: 1,
      category: classification.category,
      urgency: classification.urgency,
      actionNeeded: classification.actionNeeded,
      deadline: classification.deadline,
      aiExplanation: classification.aiExplanation,
      classificationStatus: classification.status,
      classificationError: classification.error,
      isRead: false,
      needsFollowUp: classification.category !== "Other" && !isFaculty,
      lastMessageAt: now,
    });

    // Invalidate DigestCache so the summary instantly incorporates this new email
    await DigestCache.deleteOne({ userId: userObjectId });

    const formatted = threadService.formatSummary(newThread);
    logger.info({ threadId: newThread._id, subject, category: classification.category }, "New email triaged and saved to Atlas");

    return sendSuccess(res, formatted, undefined, 201);
  } catch (error) {
    next(error);
  }
}

export async function resolveThread(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { note } = req.body || {};

    const resolved = await threadService.resolveThread(userId, id, note);
    if (!resolved) {
      return sendError(res, "THREAD_NOT_FOUND", "Thread not found or already resolved", 404);
    }

    return sendSuccess(res, resolved);
  } catch (error) {
    next(error);
  }
}

export async function listResolvedThreads(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { page, limit } = req.query;

    const result = await threadService.listResolvedThreads(
      userId,
      page ? parseInt(String(page), 10) : 1,
      limit ? parseInt(String(limit), 10) : 50
    );

    return sendSuccess(res, result.items, result.meta);
  } catch (error) {
    next(error);
  }
}

export async function restoreResolvedThread(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const restored = await threadService.restoreResolvedThread(userId, id);
    if (!restored) {
      return sendError(res, "THREAD_NOT_FOUND", "Resolved thread not found", 404);
    }

    return sendSuccess(res, restored);
  } catch (error) {
    next(error);
  }
}
