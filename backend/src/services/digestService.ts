import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DigestCache } from "../models/DigestCache.js";
import { Thread } from "../models/Thread.js";
import { env } from "../config/env.js";
import { computeNeedsFollowUp } from "./followUpService.js";
import { logger } from "../utils/logger.js";

/**
 * System prompt for digest generation.
 * Keeps the AI in role as a concise academic email summarizer.
 */
const DIGEST_SYSTEM_PROMPT = `You are FacultyInbox AI, a concise academic email intelligence assistant for university professors.

Your task is to generate a brief, plain-English daily digest summary of the professor's email inbox state.

## Rules
1. Write 3-5 sentences maximum — be concise and professional
2. Lead with the most urgent items first (Critical > High > needs follow-up)
3. Mention specific subjects when relevant (e.g., "a re-evaluation request from Ahmed Hassan")
4. If no urgent items exist, say so reassuringly
5. End with one actionable suggestion for the professor's focus today
6. Write in second person ("You have...", "Your...", "Consider...")
7. Do NOT use bullet points, markdown, or headers — plain flowing sentences only`;

export class DigestService {
  private genAI: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI | null {
    if (!env.LLM_API_KEY || env.LLM_API_KEY === "YOUR_GEMINI_API_KEY_HERE" || env.LLM_API_KEY === "mock-key-for-dev") {
      return null;
    }
    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(env.LLM_API_KEY);
    }
    return this.genAI;
  }

  async getOrGenerateDigest(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get current top priority items to check cache freshness
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
          aiGenerated: true,
        };
      }
    }

    // Gather all threads for context
    const allThreads = await Thread.find({ userId: userObjectId }).sort({
      lastMessageAt: -1,
    });

    if (allThreads.length === 0) {
      return {
        digestText:
          "No emails synced yet — click '+ Inbound Mail' to simulate and populate your triaged inbox.",
        generatedAt: new Date(),
        stale: false,
        aiGenerated: false,
      };
    }

    // Build digest text (Gemini or fallback)
    const digestText = await this.generateDigest(allThreads);
    const generatedAt = new Date();

    // Upsert digest cache
    await DigestCache.findOneAndUpdate(
      { userId: userObjectId },
      {
        digestText,
        generatedAt,
        basedOnThreadIds: topThreads.map((t) => t._id),
      },
      { upsert: true, new: true }
    );

    logger.info({ userId, digestLength: digestText.length }, "Digest generated and cached");

    return {
      digestText,
      generatedAt,
      stale: false,
      aiGenerated: !!this.getClient(),
    };
  }

  private async generateDigest(allThreads: any[]): Promise<string> {
    const client = this.getClient();

    // Compute stats
    const criticalCount = allThreads.filter((t) => t.urgency === "Critical").length;
    const highCount = allThreads.filter((t) => t.urgency === "High").length;
    const followUpCount = allThreads.filter((t) => computeNeedsFollowUp(t).needsFollowUp).length;
    const unreadCount = allThreads.filter((t) => !t.isRead).length;

    // If no Gemini key, use the enhanced string-based fallback
    if (!client) {
      return this.heuristicDigest(allThreads, criticalCount, highCount, followUpCount);
    }

    // Build a compact inbox summary for Gemini (top 10 threads by priority)
    const priorityOrder: Record<string, number> = { Critical: 1, High: 2, Medium: 3, Low: 4 };
    const sortedThreads = [...allThreads]
      .sort((a, b) => (priorityOrder[a.urgency] || 5) - (priorityOrder[b.urgency] || 5))
      .slice(0, 10);

    const threadSummaries = sortedThreads
      .map((t) => {
        const fu = computeNeedsFollowUp(t);
        return `- [${t.urgency}] ${t.category}: "${t.subject}" | ${t.participants.slice(0, 2).join(", ")} | ${fu.needsFollowUp ? `⚠ Needs follow-up (${fu.waitingHours}h waiting)` : t.isRead ? "Read" : "Unread"} | ${t.aiExplanation}`;
      })
      .join("\n");

    const userPrompt = `Generate a daily digest for this professor's inbox:

INBOX STATS:
- Critical: ${criticalCount} | High: ${highCount} | Follow-up needed: ${followUpCount} | Unread: ${unreadCount}
- Total threads: ${allThreads.length}

TOP PRIORITY THREADS:
${threadSummaries}

Write the digest now:`;

    try {
      const model = client.getGenerativeModel({
        model: env.LLM_MODEL,
        systemInstruction: DIGEST_SYSTEM_PROMPT,
        generationConfig: {
          temperature: 0.4,    // Slightly creative but still grounded
          maxOutputTokens: 200,
        },
      });

      const result = await model.generateContent(userPrompt);
      const text = result.response.text().trim();
      logger.debug({ digestPreview: text.substring(0, 100) }, "Gemini digest generated");
      return text;
    } catch (err: any) {
      logger.warn({ error: err?.message }, "Gemini digest generation failed, using heuristic fallback");
      return this.heuristicDigest(allThreads, criticalCount, highCount, followUpCount);
    }
  }

  /**
   * String-based fallback digest when no Gemini key is configured
   */
  private heuristicDigest(
    allThreads: any[],
    criticalCount: number,
    highCount: number,
    followUpCount: number
  ): string {
    const priorityItems: string[] = [];

    allThreads
      .filter((t) => t.urgency === "Critical")
      .slice(0, 2)
      .forEach((t) => priorityItems.push(t.aiExplanation));

    allThreads
      .filter((t) => t.urgency === "High")
      .slice(0, 2)
      .forEach((t) => priorityItems.push(t.aiExplanation));

    if (criticalCount > 0 || highCount > 0 || followUpCount > 0) {
      return `You have ${criticalCount} critical and ${highCount} high-priority thread${highCount === 1 ? "" : "s"} requiring attention today, with ${followUpCount} thread${followUpCount === 1 ? "" : "s"} awaiting follow-up. Key items: ${priorityItems.join(" Also, ")}. Review re-evaluation requests and upcoming committee deadlines before end of day.`;
    }

    return "Your inbox is currently clear of critical and high-urgency alerts. Routine class inquiries and administrative updates can be addressed during your scheduled office hours. Keep up the great work!";
  }
}

export const digestService = new DigestService();
