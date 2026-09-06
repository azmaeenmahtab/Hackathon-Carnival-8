"use client";

import React from "react";
import { ClockAlert, CheckCircle2, ShieldAlert } from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import { ThreadRow } from "./ThreadRow";

export function NeedsFollowUpView() {
  const { threads } = useThreads();

  // Filter only needsFollowUp threads and sort by longest waiting first
  const followUpThreads = threads
    .filter((t) => t.needsFollowUp)
    .sort((a, b) => (b.waitingHours || 0) - (a.waitingHours || 0));

  return (
    <div className="space-y-4">
      {/* Top Banner explaining the safety-net role */}
      <div className="rounded-xl border border-rose-200/80 bg-linear-to-r from-rose-50/80 via-white to-amber-50/40 p-5 dark:border-rose-900/60 dark:from-rose-950/30 dark:via-slate-900/40 dark:to-slate-900/20">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-200 dark:shadow-none">
            <ClockAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight dark:text-slate-100 flex items-center gap-2">
              Unanswered Follow-Up Safety Net
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                {followUpThreads.length} Pending
              </span>
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed dark:text-slate-300">
              Threads automatically flagged where someone sent an inquiry and faculty has not yet replied within the 48-hour threshold. Sorted by longest waiting time so critical items don&apos;t slip through the cracks.
            </p>
          </div>
        </div>
      </div>

      {/* Follow Up Thread Rows */}
      {followUpThreads.length > 0 ? (
        <div className="space-y-3">
          {followUpThreads.map((thread) => (
            <div key={thread.id} className="relative">
              {/* Extra waiting badge on top */}
              <div className="flex items-center justify-between px-3 py-1 bg-rose-50/90 rounded-t-lg border-t border-x border-rose-200 text-xs text-rose-800 font-medium dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-300">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                  Waiting {thread.waitingHours ? `${thread.waitingHours} hours` : "for response"}
                </span>
                <span className="italic text-[11px]">
                  {thread.waitingReason || "Awaiting faculty response"}
                </span>
              </div>
              <div className="-mt-1">
                <ThreadRow thread={thread} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Positive Empty State */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3 dark:bg-emerald-900/60 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
            You&apos;re all caught up! 🎉
          </h4>
          <p className="text-xs text-slate-600 max-w-sm mt-1 leading-relaxed dark:text-slate-400">
            No emails currently exceed the 48-hour unanswered threshold. All priority student questions, chair syncs, and administrative deadlines have been handled.
          </p>
        </div>
      )}
    </div>
  );
}
