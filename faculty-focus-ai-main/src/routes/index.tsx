import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { PageHeading } from "@/components/app-shell";
import { CategoryFilter, DigestCard, StatStrip } from "@/components/dashboard-widgets";
import {
  DigestSkeleton,
  EmptyState,
  ErrorState,
  ThreadListSkeleton,
} from "@/components/states";
import { ThreadList } from "@/components/thread-list";
import { useInbox } from "@/hooks/use-inbox";
import { CATEGORIES, effectiveCategory, type Category } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — FacultyInbox AI" },
      {
        name: "description",
        content:
          "An AI-triaged faculty inbox: daily digest, urgency ranking, deadlines and unanswered threads in one calm dashboard.",
      },
      { property: "og:title", content: "Dashboard — FacultyInbox AI" },
      {
        property: "og:description",
        content:
          "See what matters first: critical threads, deadlines and follow-ups, explained by AI.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { threads, isLoading, error, reload, byCategory } = useInbox();
  const [category, setCategory] = useState<Category | "All">("All");

  const counts = useMemo(() => {
    const result: Record<string, number> = {
      All: threads.filter((t) => effectiveCategory(t) !== "Other").length,
    };
    for (const c of CATEGORIES) {
      result[c] = threads.filter((t) => effectiveCategory(t) === c).length;
    }
    return result;
  }, [threads]);

  const visible = byCategory(category);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Today's priorities"
        description="Threads ranked by urgency, with the AI's reasoning shown on every row."
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {isLoading ? <DigestSkeleton /> : error ? null : <DigestCard />}
        </div>
        <div className="lg:col-span-4">{!error && <StatStrip />}</div>
      </div>

      <section className="space-y-4">
        <CategoryFilter active={category} onChange={setCategory} counts={counts} />

        <div className="mb-1 flex items-center justify-between px-1">
          <h2 className="font-serif text-xl font-bold">Priority inbox</h2>
          <span className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Sorted by urgency
          </span>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : isLoading ? (
          <ThreadListSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            title="Nothing in this category"
            description="No threads have been triaged into this category yet."
          />
        ) : (
          <ThreadList threads={visible} muted={category === "Other"} />
        )}
      </section>
    </div>
  );
}
