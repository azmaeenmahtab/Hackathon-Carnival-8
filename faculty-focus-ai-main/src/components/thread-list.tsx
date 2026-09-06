import { Link } from "@tanstack/react-router";
import { Clock, MessageSquare } from "lucide-react";

import {
  AiExplanation,
  CategoryBadge,
  DeadlineChip,
  FollowUpFlag,
  UrgencyBadge,
} from "@/components/triage-badges";
import { relativeTime } from "@/lib/format";
import { effectiveCategory, waitingDays, type Thread } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ThreadRow({
  thread,
  showWaiting = false,
  muted = false,
}: {
  thread: Thread;
  showWaiting?: boolean;
  muted?: boolean;
}) {
  const days = waitingDays(thread);
  return (
    <Link
      to="/threads/$threadId"
      params={{ threadId: thread.id }}
      className={cn(
        "group block rounded-xl border border-l-4 bg-surface p-5 shadow-card transition-all hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        muted ? "border-border/70 border-l-border bg-surface-muted/60" : "border-border",
        !muted && thread.urgency === "Critical" && "border-l-critical",
        !muted && thread.urgency === "High" && "border-l-high",
        !muted && thread.urgency === "Medium" && "border-l-medium",
        !muted && thread.urgency === "Low" && "border-l-secondary",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-start gap-2.5">
          {!thread.isRead && (
            <span
              className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
              aria-label="Unread"
            />
          )}
          <div className="min-w-0">
            <h3
              className={cn(
                "truncate text-[17px] leading-snug transition-colors group-hover:text-primary",
                thread.isRead ? "font-medium text-foreground/90" : "font-semibold",
              )}
            >
              {thread.subject}
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {thread.participants.join(", ")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!muted && <UrgencyBadge urgency={thread.urgency} />}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3.5" aria-hidden />
            {relativeTime(thread.lastMessageAt)}
          </span>
        </div>
      </div>

      <AiExplanation text={thread.aiExplanation} className="mt-3" />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <CategoryBadge
          category={effectiveCategory(thread)}
          corrected={Boolean(thread.correctedCategory)}
        />
        {thread.deadline && <DeadlineChip deadline={thread.deadline} />}
        {thread.needsFollowUp &&
          (showWaiting ? (
            <FollowUpFlag label={`Waiting ${days} day${days === 1 ? "" : "s"}`} />
          ) : (
            <FollowUpFlag />
          ))}
        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <MessageSquare className="size-3.5" aria-hidden />
          {thread.messageCount} message{thread.messageCount === 1 ? "" : "s"}
        </span>
      </div>
    </Link>
  );
}

export function ThreadList({
  threads,
  showWaiting = false,
  muted = false,
}: {
  threads: Thread[];
  showWaiting?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="space-y-2.5">
      {threads.map((thread) => (
        <ThreadRow
          key={thread.id}
          thread={thread}
          showWaiting={showWaiting}
          muted={muted}
        />
      ))}
    </div>
  );
}
