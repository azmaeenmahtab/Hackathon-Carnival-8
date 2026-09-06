import mongoose from "mongoose";
import {
  Thread,
  IThread,
  ThreadCategory,
  THREAD_CATEGORIES,
} from "../models/Thread.js";
import { ResolvedThread, IResolvedThread } from "../models/ResolvedThread.js";
import { computeNeedsFollowUp } from "./followUpService.js";

export interface ThreadListOptions {
  category?: string;
  urgency?: string;
  needsFollowUp?: boolean;
  isRead?: boolean;
  page?: number;
  limit?: number;
  sort?: "urgency" | "recent" | "oldest";
}

export interface ThreadSummary {
  id: string;
  externalThreadId: string;
  subject: string;
  participants: string[];
  messageCount: number;
  lastMessagePreview?: string;
  category: ThreadCategory;
  correctedCategory: ThreadCategory | null;
  effectiveCategory: ThreadCategory;
  urgency: string;
  actionNeeded: boolean;
  deadline: Date | null;
  aiExplanation: string;
  classificationStatus: string;
  isRead: boolean;
  needsFollowUp: boolean;
  lastMessageAt: Date;
  waitingHours?: number;
  reason?: string | null;
}

export class ThreadService {
  /**
   * Helper to format a Thread document into a ThreadSummary
   */
  formatSummary(thread: IThread): ThreadSummary {
    const followUp = computeNeedsFollowUp(thread);
    const effectiveCategory = (thread.correctedCategory ?? thread.category) as ThreadCategory;
    const lastMsg =
      thread.messages && thread.messages.length > 0
        ? thread.messages[thread.messages.length - 1].body
        : "";

    return {
      id: thread._id.toString(),
      externalThreadId: thread.externalThreadId,
      subject: thread.subject,
      participants: thread.participants,
      messageCount: thread.messageCount || thread.messages?.length || 0,
      lastMessagePreview: lastMsg.length > 120 ? `${lastMsg.substring(0, 120)}...` : lastMsg,
      category: thread.category,
      correctedCategory: thread.correctedCategory,
      effectiveCategory,
      urgency: thread.urgency,
      actionNeeded: thread.actionNeeded,
      deadline: thread.deadline,
      aiExplanation: thread.aiExplanation,
      classificationStatus: thread.classificationStatus,
      isRead: thread.isRead,
      needsFollowUp: followUp.needsFollowUp,
      lastMessageAt: thread.lastMessageAt,
      waitingHours: followUp.waitingHours,
      reason: followUp.reason,
    };
  }

  async listThreads(userId: string, options: ThreadListOptions = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const query: any = { userId: userObjectId };

    if (options.category && options.category !== "All") {
      query.$or = [
        { correctedCategory: options.category },
        { correctedCategory: null, category: options.category },
      ];
    }

    if (options.urgency && options.urgency !== "All") {
      query.urgency = options.urgency;
    }

    if (options.isRead !== undefined) {
      query.isRead = options.isRead;
    }

    // Urgency sort weight
    const urgencyOrder: Record<string, number> = {
      Critical: 1,
      High: 2,
      Medium: 3,
      Low: 4,
    };

    let sortObj: any = { lastMessageAt: -1 };
    if (options.sort === "oldest") {
      sortObj = { lastMessageAt: 1 };
    }

    // Fetch matching docs
    const allMatching = await Thread.find(query).sort(sortObj);

    // Compute dynamic followUp and format
    let items = allMatching.map((t) => this.formatSummary(t));

    if (options.needsFollowUp !== undefined) {
      items = items.filter((t) => t.needsFollowUp === options.needsFollowUp);
    }

    if (options.sort === "urgency" || !options.sort) {
      items.sort((a, b) => {
        const uA = urgencyOrder[a.urgency] || 5;
        const uB = urgencyOrder[b.urgency] || 5;
        if (uA !== uB) return uA - uB;
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      });
    }

    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedItems = items.slice(skip, skip + limit);

    return {
      items: paginatedItems,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getThreadById(userId: string, threadId: string) {
    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return null;
    }

    const thread = await Thread.findOne({
      _id: new mongoose.Types.ObjectId(threadId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!thread) return null;

    const followUp = computeNeedsFollowUp(thread);
    const effectiveCategory = (thread.correctedCategory ?? thread.category) as ThreadCategory;

    return {
      id: thread._id.toString(),
      externalThreadId: thread.externalThreadId,
      subject: thread.subject,
      participants: thread.participants,
      messages: thread.messages,
      messageCount: thread.messages.length,
      category: thread.category,
      correctedCategory: thread.correctedCategory,
      effectiveCategory,
      urgency: thread.urgency,
      actionNeeded: thread.actionNeeded,
      deadline: thread.deadline,
      aiExplanation: thread.aiExplanation,
      classificationStatus: thread.classificationStatus,
      classificationError: thread.classificationError,
      isRead: thread.isRead,
      needsFollowUp: followUp.needsFollowUp,
      waitingHours: followUp.waitingHours,
      reason: followUp.reason,
      lastMessageAt: thread.lastMessageAt,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    };
  }

  async markRead(userId: string, threadId: string, isRead: boolean) {
    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return null;
    }

    const thread = await Thread.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(threadId),
        userId: new mongoose.Types.ObjectId(userId),
      },
      { isRead },
      { new: true }
    );

    if (!thread) return null;
    return this.formatSummary(thread);
  }

  async reclassify(userId: string, threadId: string, category: ThreadCategory) {
    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return null;
    }

    const thread = await Thread.findOne({
      _id: new mongoose.Types.ObjectId(threadId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!thread) return null;

    thread.correctedCategory = category;
    await thread.save();

    return this.formatSummary(thread);
  }

  async getFollowUpThreads(userId: string) {
    const res = await this.listThreads(userId, {
      needsFollowUp: true,
      sort: "oldest",
      limit: 100,
    });

    return {
      items: res.items,
      meta: {
        total: res.items.length,
      },
    };
  }

  async getOtherThreads(userId: string) {
    const res = await this.listThreads(userId, {
      category: "Other",
      limit: 100,
    });

    const totalCount = await Thread.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
    });

    const filteredCount = res.items.length;
    const filteredPercentOfInbox =
      totalCount > 0 ? Math.round((filteredCount / totalCount) * 100) : 0;

    return {
      items: res.items,
      meta: {
        total: filteredCount,
        filteredCount,
        filteredPercentOfInbox,
      },
    };
  }

  /**
   * Transfer a thread to the resolved_threads collection
   */
  async resolveThread(userId: string, threadId: string, note?: string) {
    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      return null;
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const threadObjectId = new mongoose.Types.ObjectId(threadId);

    const thread = await Thread.findOne({
      _id: threadObjectId,
      userId: userObjectId,
    });

    if (!thread) return null;

    // Create entry in resolved_threads collection
    const resolvedDoc = await ResolvedThread.create({
      userId: thread.userId,
      originalThreadId: thread._id,
      externalThreadId: thread.externalThreadId,
      subject: thread.subject,
      participants: thread.participants,
      messages: thread.messages,
      messageCount: thread.messageCount || thread.messages?.length || 1,
      category: thread.category,
      correctedCategory: thread.correctedCategory,
      urgency: thread.urgency,
      actionNeeded: false,
      deadline: thread.deadline,
      aiExplanation: thread.aiExplanation,
      isRead: true,
      resolvedAt: new Date(),
      resolutionNote: note || "Resolved by faculty",
      lastMessageAt: thread.lastMessageAt,
    });

    // Remove from active threads collection
    await Thread.deleteOne({ _id: thread._id });

    return {
      id: resolvedDoc._id.toString(),
      originalThreadId: resolvedDoc.originalThreadId.toString(),
      subject: resolvedDoc.subject,
      category: resolvedDoc.category,
      urgency: resolvedDoc.urgency,
      resolvedAt: resolvedDoc.resolvedAt,
      aiExplanation: resolvedDoc.aiExplanation,
    };
  }

  /**
   * List all threads from resolved_threads collection
   */
  async listResolvedThreads(userId: string, page = 1, limit = 50) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ResolvedThread.find({ userId: userObjectId })
        .sort({ resolvedAt: -1 })
        .skip(skip)
        .limit(limit),
      ResolvedThread.countDocuments({ userId: userObjectId }),
    ]);

    const formatted = items.map((t) => {
      const lastMsg =
        t.messages && t.messages.length > 0
          ? t.messages[t.messages.length - 1].body
          : "";

      return {
        id: t._id.toString(),
        originalThreadId: t.originalThreadId.toString(),
        externalThreadId: t.externalThreadId,
        subject: t.subject,
        participants: t.participants,
        messageCount: t.messageCount,
        lastMessagePreview:
          lastMsg.length > 120 ? `${lastMsg.substring(0, 120)}...` : lastMsg,
        category: t.category,
        correctedCategory: t.correctedCategory,
        effectiveCategory: (t.correctedCategory ?? t.category) as ThreadCategory,
        urgency: t.urgency,
        actionNeeded: false,
        deadline: t.deadline,
        aiExplanation: t.aiExplanation,
        isRead: true,
        needsFollowUp: false,
        resolvedAt: t.resolvedAt,
        resolutionNote: t.resolutionNote,
        lastMessageAt: t.lastMessageAt,
      };
    });

    return {
      items: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Restore a resolved thread back to active threads collection
   */
  async restoreResolvedThread(userId: string, resolvedId: string) {
    if (!mongoose.Types.ObjectId.isValid(resolvedId)) {
      return null;
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const resolved = await ResolvedThread.findOne({
      _id: new mongoose.Types.ObjectId(resolvedId),
      userId: userObjectId,
    });

    if (!resolved) return null;

    // Restore to active Thread collection
    const restored = await Thread.create({
      userId: resolved.userId,
      externalThreadId: resolved.externalThreadId,
      subject: resolved.subject,
      participants: resolved.participants,
      messages: resolved.messages,
      messageCount: resolved.messageCount,
      category: resolved.category,
      correctedCategory: resolved.correctedCategory,
      urgency: resolved.urgency,
      actionNeeded: false,
      deadline: resolved.deadline,
      aiExplanation: resolved.aiExplanation,
      classificationStatus: "completed",
      isRead: true,
      needsFollowUp: false,
      lastMessageAt: resolved.lastMessageAt,
    });

    // Remove from resolved_threads
    await ResolvedThread.deleteOne({ _id: resolved._id });

    return this.formatSummary(restored);
  }
}

export const threadService = new ThreadService();
