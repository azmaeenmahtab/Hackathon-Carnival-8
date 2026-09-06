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

export class ClassifierService {
  /**
   * Classify a raw thread using an LLM or intelligent fallback
   */
  async classifyThread(thread: RawThread): Promise<ClassificationResult> {
    // If mock pre-classified fields exist and no active real API key is set, use them
    if (
      thread.mockCategory &&
      (!env.LLM_API_KEY || env.LLM_API_KEY === "mock-key-for-dev")
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

    // Try classification with retry policy (1 retry)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await this.callLLM(thread);
        return {
          ...result,
          status: "completed",
          error: null,
        };
      } catch (err: any) {
        logger.warn(
          { attempt, error: err?.message, threadId: thread.externalThreadId },
          "Classification attempt failed"
        );
        if (attempt === 2) {
          return {
            category: "Other",
            urgency: "Low",
            actionNeeded: false,
            deadline: null,
            aiExplanation: "Classification failed — please review manually.",
            status: "failed",
            error: err?.message || "LLM classification failed",
          };
        }
      }
    }

    return {
      category: "Other",
      urgency: "Low",
      actionNeeded: false,
      deadline: null,
      aiExplanation: "Classification failed — please review manually.",
      status: "failed",
      error: "Unknown classification failure",
    };
  }

  private async callLLM(thread: RawThread): Promise<{
    category: ThreadCategory;
    urgency: ThreadUrgency;
    actionNeeded: boolean;
    deadline: Date | null;
    aiExplanation: string;
  }> {
    if (!env.LLM_API_KEY || env.LLM_API_KEY === "mock-key-for-dev") {
      // Rule-based fallback when LLM key is absent
      return this.heuristicClassifier(thread);
    }

    // Real LLM call structure
    const prompt = `You are FacultyInbox AI triage system for a university professor. Analyze this email thread:
Subject: ${thread.subject}
Participants: ${thread.participants.join(", ")}
Messages:
${thread.messages
  .slice(-3)
  .map((m) => `[${m.senderIsFaculty ? "FACULTY" : "OTHER"}]: ${m.body}`)
  .join("\n")}

Respond strictly with valid JSON with keys:
{
  "category": "Meeting" | "Class/Schedule" | "Student Issue" | "Examination" | "Re-evaluation" | "Committee/Admin" | "Other",
  "urgency": "Low" | "Medium" | "High" | "Critical",
  "actionNeeded": boolean,
  "deadline": string (ISO date) or null,
  "aiExplanation": string (one concise sentence explaining why this matters)
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.LLM_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: env.LLM_MODEL,
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API returned status ${response.status}`);
    }

    const data: any = await response.json();
    const text = data.content?.[0]?.text;
    const parsed = JSON.parse(text);

    return {
      category: this.coerceCategory(parsed.category),
      urgency: this.coerceUrgency(parsed.urgency),
      actionNeeded: Boolean(parsed.actionNeeded),
      deadline: parsed.deadline ? new Date(parsed.deadline) : null,
      aiExplanation: String(parsed.aiExplanation || "Automated email triage explanation."),
    };
  }

  private heuristicClassifier(thread: RawThread) {
    const sub = thread.subject.toLowerCase();
    let category: ThreadCategory = "Other";
    let urgency: ThreadUrgency = "Low";
    let actionNeeded = false;
    let deadline: Date | null = null;
    let aiExplanation = "Classified based on thread subject and participant analysis.";

    if (sub.includes("re-eval") || sub.includes("regrade") || sub.includes("grade")) {
      category = "Re-evaluation";
      urgency = "High";
      actionNeeded = true;
      aiExplanation = "Student inquiry regarding grade re-evaluation.";
    } else if (sub.includes("exam") || sub.includes("midterm") || sub.includes("proctor")) {
      category = "Examination";
      urgency = "High";
      actionNeeded = true;
      aiExplanation = "Examination scheduling or exam paper logistics.";
    } else if (sub.includes("meeting") || sub.includes("sync") || sub.includes("office hours")) {
      category = "Meeting";
      urgency = "Medium";
      actionNeeded = true;
      aiExplanation = "Meeting scheduling request requiring schedule check.";
    } else if (sub.includes("student") || sub.includes("accommodation") || sub.includes("integrity")) {
      category = "Student Issue";
      urgency = "High";
      actionNeeded = true;
      aiExplanation = "Student issue or academic accommodation matter.";
    } else if (sub.includes("committee") || sub.includes("chair") || sub.includes("payroll")) {
      category = "Committee/Admin";
      urgency = "Medium";
      actionNeeded = true;
      aiExplanation = "Department administrative and committee request.";
    } else if (sub.includes("class") || sub.includes("lab") || sub.includes("room")) {
      category = "Class/Schedule";
      urgency = "Medium";
      aiExplanation = "Classroom schedule adjustment notification.";
    }

    if (sub.includes("urgent") || sub.includes("emergency")) {
      urgency = "Critical";
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
