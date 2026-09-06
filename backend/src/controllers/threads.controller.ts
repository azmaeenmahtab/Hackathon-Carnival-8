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
