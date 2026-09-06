import { Thread } from "@/types/threads";

/**
 * Checks whether a thread matches a search query across sender email/participants,
 * subject line, message contents, and AI explanation.
 */
export function matchThreadSearch(thread: Thread, query: string): boolean {
  if (!query || !query.trim()) return true;
  const q = query.toLowerCase().trim();

  // 1. Subject Line
  if (thread.subject && thread.subject.toLowerCase().includes(q)) {
    return true;
  }

  // 2. Participant / Mail Address
  if (
    thread.participants &&
    thread.participants.some((p) => p.toLowerCase().includes(q))
  ) {
    return true;
  }

  // 3. Message Senders and Sender Emails
  if (thread.messages && thread.messages.length > 0) {
    const hasSenderMatch = thread.messages.some((m) => {
      const emailMatch = m.senderEmail && m.senderEmail.toLowerCase().includes(q);
      const senderMatch = m.sender && m.sender.toLowerCase().includes(q);
      const bodyMatch = m.body && m.body.toLowerCase().includes(q);
      return Boolean(emailMatch || senderMatch || bodyMatch);
    });
    if (hasSenderMatch) return true;
  }

  // 4. AI Explanation & Reasoning
  if (thread.aiExplanation && thread.aiExplanation.toLowerCase().includes(q)) {
    return true;
  }

  // 5. Waiting reason
  if (thread.waitingReason && thread.waitingReason.toLowerCase().includes(q)) {
    return true;
  }

  return false;
}
