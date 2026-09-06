"use client";

import React from "react";
import { ClockAlert, CheckCircle2, ShieldAlert } from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import { ThreadCard } from "./ThreadRow";

export function NeedsFollowUpView() {
  const { threads } = useThreads();

  // Filter only needsFollowUp threads and sort by longest waiting first
  const followUpThreads = threads
    .filter((t) => t.needsFollowUp)
    .sort((a, b) => (b.waitingHours || 0) - (a.waitingHours || 0));

  return (
    <div className="space-y-5 select-none">
      {/* Top Banner */}
      <div className="bg-[#121214] text-white rounded-[32px] p-6 shadow-sm flex items-start gap-4">
        <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
          <ClockAlert className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-white tracking-tight">
              Unanswered Follow-Up Safety Net
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white text-black font-bold">
              {followUpThreads.length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Inquiries awaiting your reply past the 48-hour threshold, sorted by longest waiting time so critical student issues and administrative obligations are resolved on schedule.
          </p>
        </div>
      </div>

      {/* Grid of Follow Up Thread Cards */}
      {followUpThreads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followUpThreads.map((thread) => (
            <div key={thread.id} className="relative flex flex-col">
              <div className="px-4 py-1.5 bg-black text-white text-[10px] font-bold rounded-t-[20px] flex items-center justify-between mx-3 -mb-2 z-10 shadow-2xs">
                <span>Waiting {thread.waitingHours}h</span>
                <span className="opacity-75 truncate max-w-[150px]">
                  {thread.waitingReason || "Awaiting reply"}
                </span>
              </div>
              <ThreadCard thread={thread} />
            </div>
          ))}
        </div>
      ) : (
        /* Positive Empty State */
        <div className="bg-white rounded-[32px] p-12 text-center border border-black/[0.04] shadow-xs flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-black mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h4 className="text-base font-extrabold text-slate-950 font-sans">
            You&apos;re all caught up! 🎉
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
            No emails currently exceed the 48-hour unanswered threshold. All priority items and department syncs are up to date.
          </p>
        </div>
      )}
    </div>
  );
}
