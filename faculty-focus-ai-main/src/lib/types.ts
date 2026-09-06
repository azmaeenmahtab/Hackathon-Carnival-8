export const CATEGORIES = [
  "Meeting",
  "Class/Schedule",
  "Student Issue",
  "Examination",
  "Re-evaluation",
  "Committee/Admin",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const URGENCIES = ["Low", "Medium", "High", "Critical"] as const;
export type Urgency = (typeof URGENCIES)[number];

export interface ThreadMessage {
  sender: string;
  isFaculty: boolean;
  sentAt: string;
  body: string;
}

export interface Thread {
  id: string;
  subject: string;
  participants: string[];
  lastMessagePreview: string;
  lastMessageAt: string;
  messageCount: number;
  messages: ThreadMessage[];
  category: Category;
  urgency: Urgency;
  actionNeeded: boolean;
  deadline: string | null;
  aiExplanation: string;
  isRead: boolean;
  needsFollowUp: boolean;
  correctedCategory: Category | null;
}

export const URGENCY_RANK: Record<Urgency, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

/** Category shown to the user (faculty correction wins over the AI guess). */
export function effectiveCategory(thread: Thread): Category {
  return thread.correctedCategory ?? thread.category;
}

export function sortByPriority(threads: Thread[]): Thread[] {
  return [...threads].sort(
    (a, b) =>
      URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] ||
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );
}

export function waitingDays(thread: Thread): number {
  const ms = Date.now() - new Date(thread.lastMessageAt).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}
