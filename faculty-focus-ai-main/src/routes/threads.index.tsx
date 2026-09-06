import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { PageHeading } from "@/components/app-shell";
import { CategoryFilter } from "@/components/dashboard-widgets";
import { EmptyState, ErrorState, ThreadListSkeleton } from "@/components/states";
import { ThreadList } from "@/components/thread-list";
import { useInbox } from "@/hooks/use-inbox";
import {
  CATEGORIES,
  URGENCIES,
  effectiveCategory,
  sortByPriority,
  type Category,
  type Urgency,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/threads/")({
  head: () => ({
    meta: [
      { title: "All threads — FacultyInbox AI" },
      {
        name: "description",
        content:
          "Browse every triaged email thread and filter by category or urgency level.",
      },
      { property: "og:title", content: "All threads — FacultyInbox AI" },
      {
        property: "og:description",
        content: "Filter your triaged faculty inbox by category and urgency.",
      },
    ],
  }),
  component: AllThreads,
});

function AllThreads() {
  const { threads, isLoading, error, reload } = useInbox();
  const [category, setCategory] = useState<Category | "All">("All");
  const [urgency, setUrgency] = useState<Urgency | "All">("All");

  const counts = useMemo(() => {
    const result: Record<string, number> = { All: threads.length };
    for (const c of CATEGORIES) {
      result[c] = threads.filter((t) => effectiveCategory(t) === c).length;
    }
    return result;
  }, [threads]);

  const visible = sortByPriority(
    threads.filter(
      (t) =>
        (category === "All" || effectiveCategory(t) === category) &&
        (urgency === "All" || t.urgency === urgency),
    ),
  );

  return (
    <div className="space-y-5">
      <PageHeading
        title="All threads"
        description="Every conversation in your inbox, including the ones filtered as low priority."
      />

      <div className="space-y-3">
        <CategoryFilter active={category} onChange={setCategory} counts={counts} />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Urgency</span>
          {(["All", ...URGENCIES] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setUrgency(option)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                urgency === option
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : isLoading ? (
        <ThreadListSkeleton rows={6} />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No threads match these filters"
          description="Try widening the category or urgency filter."
        />
      ) : (
        <ThreadList threads={visible} />
      )}
    </div>
  );
}
