import { createFileRoute } from "@tanstack/react-router";

import { PageHeading } from "@/components/app-shell";
import { EmptyState, ErrorState, ThreadListSkeleton } from "@/components/states";
import { ThreadList } from "@/components/thread-list";
import { useInbox } from "@/hooks/use-inbox";
import { waitingDays } from "@/lib/types";

export const Route = createFileRoute("/follow-up")({
  head: () => ({
    meta: [
      { title: "Needs follow-up — FacultyInbox AI" },
      {
        name: "description",
        content:
          "Threads that appear to expect a reply from you and have gone unanswered the longest.",
      },
      { property: "og:title", content: "Needs follow-up — FacultyInbox AI" },
      {
        property: "og:description",
        content: "A safety net for emails waiting on your reply.",
      },
    ],
  }),
  component: FollowUpView,
});

function FollowUpView() {
  const { threads, isLoading, error, reload } = useInbox();
  const waiting = threads
    .filter((t) => t.needsFollowUp)
    .sort((a, b) => waitingDays(b) - waitingDays(a));

  return (
    <div className="space-y-5">
      <PageHeading
        tone="attention"
        title="Needs follow-up"
        description="These conversations look like they are waiting on you. Longest wait first."
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : isLoading ? (
        <ThreadListSkeleton rows={4} />
      ) : waiting.length === 0 ? (
        <EmptyState
          tone="positive"
          title="You're all caught up"
          description="Nothing is sitting unanswered right now. We'll flag anything that starts to wait."
        />
      ) : (
        <>
          <div className="rounded-lg border border-high/25 bg-high-surface px-4 py-3 text-sm text-high">
            {waiting.length} thread{waiting.length === 1 ? "" : "s"} have had no reply from
            you — the oldest has been waiting {waitingDays(waiting[0]!)} days.
          </div>
          <ThreadList threads={waiting} showWaiting />
        </>
      )}
    </div>
  );
}
