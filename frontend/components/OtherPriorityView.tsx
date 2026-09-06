"use client";

import React from "react";
import { Archive, ShieldCheck, Filter } from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import { ThreadRow } from "./ThreadRow";

export function OtherPriorityView() {
  const { threads } = useThreads();

  const otherThreads = threads.filter(
    (t) => (t.correctedCategory ?? t.category) === "Other"
  );

  const percent =
    threads.length > 0
      ? Math.round((otherThreads.length / threads.length) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Filtering value card */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 dark:bg-slate-800 dark:text-slate-300">
            <Archive className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight dark:text-slate-100 flex items-center gap-2">
              Filtered Low-Priority & Non-Academic Queue
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold dark:bg-slate-800 dark:text-slate-300">
                {otherThreads.length} items ({percent}% of inbox)
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed dark:text-slate-400">
              Campus bulletins, IT advisories, and external calls for papers are automatically triaged here so they don&apos;t crowd out urgent student issues or grading deadlines.
            </p>
          </div>
        </div>
      </div>

      {/* Other Threads */}
      <div className="space-y-2 opacity-90">
        {otherThreads.map((thread) => (
          <ThreadRow key={thread.id} thread={thread} />
        ))}
      </div>
    </div>
  );
}
