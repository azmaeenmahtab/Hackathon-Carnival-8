import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Check, Mail, MailOpen, Tag } from "lucide-react";
import { toast } from "sonner";

import {
  AiExplanation,
  CategoryBadge,
  DeadlineChip,
  UrgencyBadge,
} from "@/components/triage-badges";
import { ThreadListSkeleton } from "@/components/states";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInbox } from "@/hooks/use-inbox";
import { initials, messageTime } from "@/lib/format";
import { CATEGORIES, effectiveCategory, waitingDays, type Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/threads/$threadId")({
  head: () => ({
    meta: [
      { title: "Thread detail — FacultyInbox AI" },
      {
        name: "description",
        content:
          "Read the full conversation with the AI's triage reasoning, reclassify it, or mark it read.",
      },
      { property: "og:title", content: "Thread detail — FacultyInbox AI" },
      {
        property: "og:description",
        content: "Full email history with AI triage reasoning for faculty.",
      },
    ],
  }),
  component: ThreadDetail,
});

function ThreadDetail() {
  const { threadId } = Route.useParams();
  const { getThread, isLoading, setRead, reclassify } = useInbox();
  const thread = getThread(threadId);

  if (isLoading) {
    return <ThreadListSkeleton rows={3} />;
  }

  if (!thread) {
    return (
      <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
        <h1 className="text-lg font-semibold">Thread not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          It may have been archived. Head back to your priorities.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const category = effectiveCategory(thread);

  return (
    <article className="space-y-5">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden /> Back to priorities
      </Link>

      <header className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="font-serif text-xl leading-snug font-semibold">
            {thread.subject}
          </h1>
          <UrgencyBadge urgency={thread.urgency} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {thread.participants.join(", ")} · {thread.messageCount} message
          {thread.messageCount === 1 ? "" : "s"}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CategoryBadge
            category={category}
            corrected={Boolean(thread.correctedCategory)}
          />
          {thread.deadline && <DeadlineChip deadline={thread.deadline} />}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRead(thread.id, !thread.isRead);
              toast.success(thread.isRead ? "Marked as unread" : "Marked as read");
            }}
          >
            {thread.isRead ? (
              <>
                <Mail className="size-4" /> Mark as unread
              </>
            ) : (
              <>
                <MailOpen className="size-4" /> Mark as read
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Tag className="size-4" /> Reclassify
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Move to category</DropdownMenuLabel>
              {CATEGORIES.map((option: Category) => (
                <DropdownMenuItem
                  key={option}
                  onSelect={() => {
                    reclassify(thread.id, option);
                    toast.success(`Reclassified to ${option}`, {
                      description: "The AI will learn from your correction.",
                    });
                  }}
                >
                  {option}
                  {option === category && <Check className="ml-auto size-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <AiExplanation text={thread.aiExplanation} variant="callout" />

      {thread.needsFollowUp && (
        <div className="rounded-lg border border-high/30 bg-high-surface px-4 py-3">
          <p className="text-sm font-semibold text-high">Needs follow-up</p>
          <p className="mt-1 text-sm text-high/90">
            Waiting {waitingDays(thread)} days without a reply from you — the last message
            appears to expect one.
          </p>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Conversation
        </h2>
        {thread.messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "rounded-xl border p-4",
              message.isFaculty
                ? "border-accent bg-accent/40"
                : "border-border bg-surface",
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-surface-muted text-[11px] font-semibold text-muted-foreground">
                {initials(message.sender)}
              </span>
              <div>
                <p className="text-sm font-medium">
                  {message.sender}
                  {message.isFaculty && (
                    <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {messageTime(message.sentAt)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              {message.body}
            </p>
          </div>
        ))}
      </section>
    </article>
  );
}
