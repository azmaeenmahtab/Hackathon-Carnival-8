import { IThread } from "../models/Thread.js";
import { env } from "../config/env.js";

export function computeNeedsFollowUp(thread: IThread): {
  needsFollowUp: boolean;
  waitingHours: number;
  reason: string | null;
} {
  const effectiveCategory = thread.correctedCategory ?? thread.category;

  // Rule: "Other" category threads are never eligible for needsFollowUp = true
  if (effectiveCategory === "Other") {
    return {
      needsFollowUp: false,
      waitingHours: 0,
      reason: null,
    };
  }

  const now = new Date();
  const lastMsgTime = new Date(thread.lastMessageAt).getTime();
  const diffHours = Math.max(0, Math.floor((now.getTime() - lastMsgTime) / (3600 * 1000)));

  // Check messages
  const msgs = thread.messages || [];
  if (msgs.length === 0) {
    return {
      needsFollowUp: false,
      waitingHours: diffHours,
      reason: null,
    };
  }

  const lastMessage = msgs[msgs.length - 1];

  // If last sender is faculty, they already responded
  if (lastMessage.senderIsFaculty) {
    return {
      needsFollowUp: false,
      waitingHours: diffHours,
      reason: null,
    };
  }

  // Find last inbound message and check if any subsequent reply was sent by faculty
  let lastInboundIndex = -1;
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (!msgs[i].senderIsFaculty) {
      lastInboundIndex = i;
      break;
    }
  }

  const facultyRepliedAfter = msgs
    .slice(lastInboundIndex + 1)
    .some((m) => m.senderIsFaculty);

  // If unanswered/unread and past age threshold
  const isPastThreshold = diffHours >= env.FOLLOWUP_THRESHOLD_HOURS;
  const isUnanswered = !facultyRepliedAfter;

  const needsFollowUp = isUnanswered && (isPastThreshold || !thread.isRead);

  let reason: string | null = null;
  if (needsFollowUp) {
    if (diffHours >= 24) {
      const days = Math.floor(diffHours / 24);
      reason = `Unanswered for ${days} day${days > 1 ? "s" : ""} — expects a faculty reply`;
    } else {
      reason = `Unread for ${diffHours} hours — expects a reply`;
    }
  }

  return {
    needsFollowUp,
    waitingHours: diffHours,
    reason,
  };
}
