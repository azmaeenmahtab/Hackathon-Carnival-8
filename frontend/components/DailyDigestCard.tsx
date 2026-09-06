"use client";

import React from "react";
import { Sparkles, Clock, ShieldAlert } from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";

export function DailyDigestCard() {
  const { digest, stats } = useThreads();

  return (
    <div className="relative overflow-hidden rounded-xl border border-indigo-200/80 bg-linear-to-r from-indigo-50/70 via-white to-indigo-50/40 p-5 shadow-xs transition-all dark:border-indigo-900/60 dark:from-indigo-950/30 dark:via-slate-900/50 dark:to-indigo-950/20">
      {/* Decorative accent element */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-indigo-200/30 blur-xl pointer-events-none dark:bg-indigo-700/10" />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 max-w-4xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-xs">
              <Sparkles className="h-3 w-3 animate-pulse" />
              AI Daily Priority Digest
            </span>
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 dark:text-slate-400">
              <Clock className="h-3 w-3" />
              Generated for Dr. Vance today
            </span>
          </div>

          <p className="text-sm leading-relaxed text-slate-800 font-normal dark:text-slate-200">
            {digest}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 font-medium text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              {stats.critical} Critical item{stats.critical === 1 ? "" : "s"}
            </span>
            <span>•</span>
            <span>{stats.needsFollowUp} awaiting your reply</span>
            <span>•</span>
            <span>Grade re-evaluations & ABET accreditation pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
