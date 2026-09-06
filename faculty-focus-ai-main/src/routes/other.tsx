import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { PageHeading } from "@/components/app-shell";
import { EmptyState, ErrorState, ThreadListSkeleton } from "@/components/states";
import { ThreadList } from "@/components/thread-list";
import { useInbox } from "@/hooks/use-inbox";
import { effectiveCategory, sortByPriority } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/other")({
  head: () => ({
    meta: [
      { title: "Other / low priority — FacultyInbox AI" },
      {
        name: "description",
        content:
          "Newsletters, notices and vendor mail filtered out of your priority view — still here whenever you want them.",
      },
      { property: "og:title", content: "Other / low priority — FacultyInbox AI" },
      {
        property: "og:description",
        content: "Non-academic mail kept out of the way, never deleted.",
      },
    ],
  }),
  component: OtherView,
});

function OtherView() {
  const { threads, isLoading, error, reload, stats } = useInbox();
  const [open, setOpen] = useState(false);
  const others = sortByPriority(threads.filter((t) => effectiveCategory(t) === "Other"));

  return (
    <div className="space-y-5">
      <PageHeading
        title="Other / low priority"
        description="Filtered out of your priority view — newsletters, notices and outreach. Nothing is deleted."
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : isLoading ? (
        <ThreadListSkeleton rows={3} />
      ) : others.length === 0 ? (
        <EmptyState
          title="Nothing filtered out"
          description="Every thread in your inbox was classified as academic work."
        />
      ) : (
        <>
          <div className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground tabular-nums">
              {stats.filteredOther} emails
            </span>{" "}
            were automatically filtered as non-academic this week, keeping your priority
            view clear.
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-expanded={open}
          >
            {open ? "Hide filtered messages" : `Show ${others.length} filtered messages`}
            <ChevronDown
              className={cn("size-4 transition-transform", open && "rotate-180")}
              aria-hidden
            />
          </button>

          {open && <ThreadList threads={others} muted />}
        </>
      )}
    </div>
  );
}
