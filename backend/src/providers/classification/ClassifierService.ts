import { GoogleGenerativeAI } from "@google/generative-ai";
import { RawThread } from "../ingestion/IngestionProvider.js";
import {
  THREAD_CATEGORIES,
  THREAD_URGENCIES,
  ThreadCategory,
  ThreadUrgency,
} from "../../models/Thread.js";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

export interface ClassificationResult {
  category: ThreadCategory;
  urgency: ThreadUrgency;
  actionNeeded: boolean;
  deadline: Date | null;
  aiExplanation: string;
  status: "completed" | "failed";
  error: string | null;
}

/**
 * System prompt that defines the AI's role, output schema, and rules.
 * This is the "persona" injected before any email content is passed in.
 */
const CLASSIFIER_SYSTEM_PROMPT = `You are FacultyInbox AI, an intelligent email triage assistant for university professors.

Your job is to read an academic email thread and classify it with precision so the professor can quickly understand what needs attention.

## Classification Categories
Choose EXACTLY ONE:
- "Meeting" — meeting requests, office-hours scheduling, calendar invites, sync requests
- "Class/Schedule" — class cancellations, room changes, lab sessions, lecture logistics
- "Student Issue" — academic accommodations, personal hardship, integrity concerns, student welfare
- "Examination" — exam scheduling, proctoring arrangements, question papers, exam logistics
- "Re-evaluation" — grade disputes, regrade requests, appeal letters, marks review
- "Committee/Admin" — department meetings, committee work, administrative duties, payroll, HR
- "Other" — newsletters, IT notices, conference invites, spam, marketing, unrelated university-wide blasts

## Urgency Levels
- "Critical" — time-sensitive, cannot be delayed (deadline within 24-48h, formal complaint, emergency)
- "High" — needs attention within 2-3 days, involves student welfare or formal academic processes
- "Medium" — should be addressed this week, scheduling or informational but requires action
- "Low" — no action needed soon, informational, or "Other" category items

## Rules
1. "Other" category items MUST always have urgency "Low" and actionNeeded: false
2. Grade disputes (Re-evaluation) default to High urgency unless the student explicitly states no rush
3. Extract deadline dates in ISO 8601 format if mentioned, otherwise return null
4. aiExplanation must be one clear, concise sentence (max 20 words) explaining WHY this matters to the professor
5. Never guess — if genuinely unclear, classify as "Other" with Low urgency

## Output Format
Return ONLY valid JSON matching this exact schema:
{
  "category": string,
  "urgency": string,
  "actionNeeded": boolean,
  "deadline": string | null,
  "aiExplanation": string
}`;

export class ClassifierService {
  private genAI: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      if (!env.LLM_API_KEY || env.LLM_API_KEY === "YOUR_GEMINI_API_KEY_HERE" || env.LLM_API_KEY === "mock-key-for-dev") {
        throw new Error("Gemini API key not configured. Set LLM_API_KEY in .env");
      }
      this.genAI = new GoogleGenerativeAI(env.LLM_API_KEY);
    }
    return this.genAI;
  }

  /**
   * Classify a raw thread using Gemini or intelligent fallback
   */
  async classifyThread(thread: RawThread): Promise<ClassificationResult> {
    // Use pre-classified mock fields if no valid API key is set
    if (
      thread.mockCategory &&
      (!env.LLM_API_KEY ||
        env.LLM_API_KEY === "YOUR_GEMINI_API_KEY_HERE" ||
        env.LLM_API_KEY === "mock-key-for-dev")
    ) {
      return {
        category: this.coerceCategory(thread.mockCategory),
        urgency: this.coerceUrgency(thread.mockUrgency || "Low"),
        actionNeeded: thread.mockActionNeeded ?? false,
        deadline: thread.mockDeadline || null,
        aiExplanation:
          thread.mockAiExplanation ||
          `Triage: ${thread.mockCategory} email thread requiring attention.`,
        status: "completed",
        error: null,
      };
    }

    // If still no valid API key, fall back to heuristic
    if (!env.LLM_API_KEY || env.LLM_API_KEY === "YOUR_GEMINI_API_KEY_HERE" || env.LLM_API_KEY === "mock-key-for-dev") {
      logger.warn({ threadId: thread.externalThreadId }, "No Gemini API key set — using heuristic classifier");
      const heuristic = this.heuristicClassifier(thread);
      return { ...heuristic, status: "completed", error: null };
    }

    // Try Gemini classification with 1 retry
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await this.callGemini(thread);
        return {
          ...result,
          status: "completed",
          error: null,
        };
      } catch (err: any) {
        logger.warn(
          { attempt, error: err?.message, threadId: thread.externalThreadId },
          "Gemini classification attempt failed"
        );
        if (attempt === 2) {
          logger.error({ threadId: thread.externalThreadId }, "Gemini classification failed after 2 attempts, using heuristic fallback");
          const fallback = this.heuristicClassifier(thread);
          return {
            ...fallback,
            status: "failed",
            error: err?.message || "Gemini classification failed",
          };
        }
        // Wait 1 second before retry
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    // Should never reach here
    const fallback = this.heuristicClassifier(thread);
    return { ...fallback, status: "failed", error: "Unknown classification failure" };
  }

  /**
   * Call Gemini 1.5 Flash with system prompt + structured JSON output
   */
  private async callGemini(thread: RawThread): Promise<{
    category: ThreadCategory;
    urgency: ThreadUrgency;
    actionNeeded: boolean;
    deadline: Date | null;
    aiExplanation: string;
  }> {
    const client = this.getClient();
    const modelToUse = env.LLM_MODEL || "gemini-3.6-flash";

    const model = client.getGenerativeModel({
      model: modelToUse,
      systemInstruction: CLASSIFIER_SYSTEM_PROMPT,
      generationConfig: {
        // Force structured JSON output — no markdown fences, no prose
        responseMimeType: "application/json",
        temperature: 0.1,   // Low temp = deterministic, consistent classification
        maxOutputTokens: 300,
      },
    });

    // Build the user turn: subject + sender + body of recent messages
    const recentMessages = thread.messages.slice(-3);
    const messagesText = recentMessages
      .map((m) => `[${m.senderIsFaculty ? "PROFESSOR" : "STUDENT/SENDER"} - ${m.sender}]:\n${m.body}`)
      .join("\n\n");

    const userPrompt = `Analyze and classify this academic email thread based on BOTH the subject line AND full message body context:

Subject: ${thread.subject}
Participants: ${thread.participants.join(", ")}

Email Message Content:
${messagesText}`;

    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();

    logger.debug({ threadId: thread.externalThreadId, response: responseText }, "Gemini classification response");

    const parsed = JSON.parse(responseText);

    return {
      category: this.coerceCategory(parsed.category),
      urgency: this.coerceUrgency(parsed.urgency),
      actionNeeded: Boolean(parsed.actionNeeded),
      deadline: parsed.deadline ? new Date(parsed.deadline) : null,
      aiExplanation: String(parsed.aiExplanation || "Automated email triage based on message context."),
    };
  }

  /**
   * Rule-based heuristic fallback that analyzes BOTH subject and email body
   */
  private heuristicClassifier(thread: RawThread) {
    const bodyContent = thread.messages.map((m) => m.body).join(" ");
    const fullText = (thread.subject + " " + bodyContent).toLowerCase();
    
    let category: ThreadCategory = "Other";
    let urgency: ThreadUrgency = "Low";
    let actionNeeded = false;
    let deadline: Date | null = null;
    let aiExplanation = "Classified based on email subject and message content analysis.";

    if (
      fullText.includes("re-eval") ||
      fullText.includes("regrade") ||
      fullText.includes("grade dispute") ||
      fullText.includes("marks review") ||
      fullText.includes("appeal my grade") ||
      fullText.includes("midterm score")
    ) {
      category = "Re-evaluation";
      urgency = "High";
      actionNeeded = true;
      aiExplanation = "Student requesting grade review or midterm regrade.";
    } else if (
      fullText.includes("exam") ||
      fullText.includes("midterm") ||
      fullText.includes("proctor") ||
      fullText.includes("final exam") ||
      fullText.includes("question paper")
    ) {
      category = "Examination";
      urgency = "High";
      actionNeeded = true;
      aiExplanation = "Examination logistics or test paper preparation.";
    } else if (
      fullText.includes("meeting") ||
      fullText.includes("sync") ||
      fullText.includes("office hours") ||
      fullText.includes("appointment") ||
      fullText.includes("zoom call")
    ) {
      category = "Meeting";
      urgency = "Medium";
      actionNeeded = true;
      aiExplanation = "Meeting or office-hours consultation request.";
    } else if (
      fullText.includes("student") ||
      fullText.includes("accommodation") ||
      fullText.includes("integrity") ||
      fullText.includes("medical hardship") ||
      fullText.includes("illness") ||
      fullText.includes("hospitalized")
    ) {
      category = "Student Issue";
      urgency = "High";
      actionNeeded = true;
      aiExplanation = "Student welfare, medical emergency, or academic accommodation.";
    } else if (
      fullText.includes("committee") ||
      fullText.includes("chair") ||
      fullText.includes("payroll") ||
      fullText.includes("accreditation") ||
      fullText.includes("abet") ||
      fullText.includes("dean")
    ) {
      category = "Committee/Admin";
      urgency = "Medium";
      actionNeeded = true;
      aiExplanation = "Department administration, committee duty, or dean sync.";
    } else if (
      fullText.includes("class") ||
      fullText.includes("lab") ||
      fullText.includes("room") ||
      fullText.includes("lecture canceled") ||
      fullText.includes("reschedule lecture")
    ) {
      category = "Class/Schedule";
      urgency = "Medium";
      actionNeeded = true;
      aiExplanation = "Class schedule, room allocation, or lab timing update.";
    }

    // Urgency detection from both subject and body
    if (
      fullText.includes("urgent") ||
      fullText.includes("emergency") ||
      fullText.includes("asap") ||
      fullText.includes("within 24 hours") ||
      fullText.includes("deadline tomorrow") ||
      fullText.includes("immediate attention")
    ) {
      urgency = "Critical";
      actionNeeded = true;
    }

    return { category, urgency, actionNeeded, deadline, aiExplanation };
  }

  private coerceCategory(val?: string): ThreadCategory {
    if (THREAD_CATEGORIES.includes(val as ThreadCategory)) {
      return val as ThreadCategory;
    }
    return "Other";
  }

  private coerceUrgency(val?: string): ThreadUrgency {
    if (THREAD_URGENCIES.includes(val as ThreadUrgency)) {
      return val as ThreadUrgency;
    }
    return "Low";
  }
}

export const classifierService = new ClassifierService();
