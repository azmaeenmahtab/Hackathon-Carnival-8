"use client";

import React from "react";
import {
  CheckCheck,
  RotateCcw,
  Clock,
  Sparkles,
  Inbox,
  CheckCircle2,
} from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import { getCategoryIcon, getCategoryStyles, formatTimeAgo } from "./ThreadRow";

export function ResolvedThreadsView() {
  const { resolvedThreads, restoreResolvedThread, selectThread } = useThreads();

  return (
    <div className="space-y-5 select-none">
      {/* Top Banner */}
      <div className="bg-[#121214] text-white rounded-[32px] p-6 shadow-sm flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-white tracking-tight">
                Resolved Threads Archive
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {resolvedThreads.length} Stored in Database
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Completed student consultations, finalized grade reviews, and resolved administrative tasks transferred to your database collection.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Resolved Thread Cards */}
      {resolvedThreads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resolvedThreads.map((thread) => {
            const effectiveCategory = thread.correctedCategory ?? thread.category;
            const CategoryIcon = getCategoryIcon(effectiveCategory);
            const catStyles = getCategoryStyles(effectiveCategory);

            const resolvedDate = thread.resolvedAt
              ? new Date(thread.resolvedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Recently";

            return (
              <div
                key={thread.id}
                onClick={() => selectThread(thread)}
                className="group relative bg-white rounded-[28px] p-5 border border-emerald-200/50 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  {/* Top Row: Category Icon + Resolved Pill */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-10 w-10 rounded-2xl ${catStyles.iconBg} flex items-center justify-center`}>
                        <CategoryIcon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Resolved
                      </span>
                    </div>

                    {/* Restore Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        restoreResolvedThread(thread.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-black hover:bg-slate-100 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                      title="Restore to Active Inbox"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span className="hidden group-hover:inline text-[10px]">Restore</span>
                    </button>
                  </div>

                  {/* Subject */}
                  <h4 className="font-bold text-sm text-slate-950 tracking-tight leading-snug line-clamp-2 mb-2">
                    {thread.subject}
                  </h4>

                  {/* AI Explanation / Notes */}
                  <div className="bg-slate-50 border border-slate-150/60 rounded-2xl p-2.5 mb-3 text-[11px] text-slate-600 font-medium leading-relaxed italic flex items-start gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{thread.aiExplanation}</span>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catStyles.badge}`}>
                    {effectiveCategory}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    Resolved {resolvedDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-[32px] p-12 text-center border border-black/[0.04] shadow-xs flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
            <Inbox className="h-6 w-6" />
          </div>
          <h4 className="text-base font-extrabold text-slate-950 font-sans">
            No Resolved Threads Yet
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
            When you finish dealing with a student inquiry or administrative email, click &ldquo;Resolve&rdquo; to transfer it into this dedicated database collection.
          </p>
        </div>
      )}
    </div>
  );
}
