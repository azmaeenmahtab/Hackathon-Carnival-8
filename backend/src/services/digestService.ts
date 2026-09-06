import mongoose from "mongoose";
import { DigestCache } from "../models/DigestCache.js";
import { Thread } from "../models/Thread.js";
import { env } from "../config/env.js";
import { computeNeedsFollowUp } from "./followUpService.js";

export class DigestService {
  async getOrGenerateDigest(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get current top critical and high priority items to check cache freshness
    const topThreads = await Thread.find({
      userId: userObjectId,
      urgency: { $in: ["Critical", "High"] },
    })
      .sort({ lastMessageAt: -1 })
      .limit(5);

    const currentThreadIds = topThreads.map((t) => t._id.toString()).sort();

    // Check existing cache
    const cached = await DigestCache.findOne({ userId: userObjectId });

    if (cached) {
      const now = new Date();
      const ageSeconds = (now.getTime() - new Date(cached.generatedAt).getTime()) / 1000;
      const cachedThreadIds = (cached.basedOnThreadIds || [])
        .map((id: any) => id.toString())
        .sort();

      const sameThreads =
        currentThreadIds.length === cachedThreadIds.length &&
        currentThreadIds.every((id, idx) => id === cachedThreadIds[idx]);

      if (ageSeconds < env.DIGEST_CACHE_TTL_SECONDS && sameThreads) {
        return {
          digestText: cached.digestText,
          generatedAt: cached.generatedAt,
          stale: false,
        };
      }
    }

    // Generate fresh digest
    const allThreads = await Thread.find({ userId: userObjectId }).sort({
      lastMessageAt: -1,
    });

    if (allThreads.length === 0) {
      return {
        digestText: "No emails synced yet — click 'Run Mock Sync' to populate your triaged inbox.",
        generatedAt: new Date(),
        stale: false,
      };
    }

    const criticalCount = allThreads.filter((t) => t.urgency === "Critical").length;
    const highCount = allThreads.filter((t) => t.urgency === "High").length;
    const followUpCount = allThreads.filter((t) => computeNeedsFollowUp(t).needsFollowUp).length;

    // Construct synthesized AI digest summary
    const priorityItems: string[] = [];
    const criticalItems = allThreads.filter((t) => t.urgency === "Critical").slice(0, 2);
    criticalItems.forEach((t) => {
      priorityItems.push(t.aiExplanation);
    });

    const highItems = allThreads.filter((t) => t.urgency === "High").slice(0, 2);
    highItems.forEach((t) => {
      priorityItems.push(t.aiExplanation);
    });

    let digestText = "";
    if (criticalCount > 0 || highCount > 0 || followUpCount > 0) {
      digestText = `You have ${criticalCount} critical and ${highCount} high-priority thread${
        highCount === 1 ? "" : "s"
      } requiring attention today, with ${followUpCount} thread${
        followUpCount === 1 ? "" : "s"
      } awaiting follow-up. Key items: ${priorityItems.join(
        " Also, "
      )}. Review re-evaluation requests and upcoming committee deadlines before end of day.`;
    } else {
      digestText =
        "Your inbox is currently clear of critical and high-urgency alerts. Routine class inquiries and administrative updates can be addressed during your scheduled office hours.";
    }

    // Update or insert digest cache
    const generatedAt = new Date();
    await DigestCache.findOneAndUpdate(
      { userId: userObjectId },
      {
        digestText,
        generatedAt,
        basedOnThreadIds: topThreads.map((t) => t._id),
      },
      { upsert: true, new: true }
    );

    return {
      digestText,
      generatedAt,
      stale: false,
    };
  }
}

export const digestService = new DigestService();
