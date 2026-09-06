export const THREAD_CATEGORIES = [
  "Meeting",
  "Class/Schedule",
  "Student Issue",
  "Examination",
  "Re-evaluation",
  "Committee/Admin",
  "Other",
] as const;

export type ThreadCategory = (typeof THREAD_CATEGORIES)[number];

export const THREAD_URGENCIES = ["Low", "Medium", "High", "Critical"] as const;
export type ThreadUrgency = (typeof THREAD_URGENCIES)[number];

export interface Message {
  id?: string;
  sender: string;
  senderEmail?: string;
  isFaculty: boolean;
  sentAt: string; // ISO string
  body: string;
}

export interface Thread {
  id: string;
  externalThreadId?: string;
  subject: string;
  participants: string[];
  lastMessagePreview: string;
  lastMessageAt: string; // ISO string
  messageCount: number;
  messages: Message[];
  category: ThreadCategory;
  urgency: ThreadUrgency;
  actionNeeded: boolean;
  deadline: string | null; // ISO string or null
  aiExplanation: string; // Core AI reasoning
  isRead: boolean;
  needsFollowUp: boolean; // Computed or mock
  waitingHours?: number;
  waitingReason?: string | null;
  correctedCategory: ThreadCategory | null; // If faculty manually reclassified
}

export type ActiveView = "dashboard" | "all" | "follow-up" | "other";

export interface PriorityStats {
  critical: number;
  high: number;
  needsFollowUp: number;
  unread: number;
  totalThreads: number;
}
