"use client";

import React from "react";
import Link from "next/link";
import { ClockAlert, CheckCircle2, ArrowLeft } from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import { ThreadCard } from "./ThreadRow";

export function NeedsFollowUpView() {
  const { threads } = useThreads();

  // Filter only needsFollowUp threads and sort by longest waiting first
  const followUpThreads = threads
    .filter((t) => t.needsFollowUp)
    .sort((a, b) => (b.waitingHours || 0) - (a.waitingHours || 0));

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner (Clean White Card) */}
      <div className="bg-white rounded-[28px] p-4 sm:p-6 shadow-2xs border border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
            <ClockAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-950 tracking-tight">
                Unanswered Follow-Up Safety Net
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-900 font-bold border border-slate-200">
                {followUpThreads.length} Pending
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              Student and committee correspondence awaiting your reply past 48 hours, sorted by longest waiting time to prevent unaddressed academic disputes.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all self-start sm:self-center shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </Link>
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
        <div className="bg-white rounded-[28px] p-12 text-center border border-black/[0.06] shadow-2xs flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="text-base font-extrabold text-slate-950 font-sans">
            You&apos;re all caught up!
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
            No emails currently exceed the 48-hour unanswered threshold. All priority items and department syncs are up to date.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 px-4 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
