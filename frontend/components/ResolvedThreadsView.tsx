"use client";

import React from "react";
import {
  CheckCheck,
  RotateCcw,
  Clock,
  Sparkles,
  Inbox,
  CheckCircle2,
  Trash2,
  Timer,
} from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import { getCategoryIcon, getCategoryStyles } from "./ThreadRow";
import { matchThreadSearch } from "@/lib/searchUtils";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Returns a human-friendly expiry label for a resolved thread.
 * e.g. "Expires in 6d 4h", "Expires tomorrow", "Expiring soon", "Expired"
 */
function getExpiryInfo(resolvedAt?: string): {
  label: string;
  isUrgent: boolean;
  isExpired: boolean;
} {
  if (!resolvedAt) return { label: "Expires in 7 days", isUrgent: false, isExpired: false };

  const resolvedMs = new Date(resolvedAt).getTime();
  const expiryMs = resolvedMs + SEVEN_DAYS_MS;
  const remainingMs = expiryMs - Date.now();

  if (remainingMs <= 0) {
    return { label: "Expired (pending sweep)", isUrgent: true, isExpired: true };
  }

  const remainingDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  const remainingHrs = Math.floor(
    (remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
  );

  if (remainingDays === 0 && remainingHrs <= 12) {
    return { label: "Expiring very soon", isUrgent: true, isExpired: false };
  }
  if (remainingDays === 0) {
    return { label: `Expires in ${remainingHrs}h`, isUrgent: true, isExpired: false };
  }
  if (remainingDays === 1) {
    return { label: "Expires tomorrow", isUrgent: true, isExpired: false };
  }
  return {
    label: `Expires in ${remainingDays}d ${remainingHrs}h`,
    isUrgent: false,
    isExpired: false,
  };
}

export function ResolvedThreadsView() {
  const { resolvedThreads, restoreResolvedThread, selectThread, searchQuery } =
    useThreads();

  const filteredResolved = resolvedThreads.filter((t) =>
    matchThreadSearch(t, searchQuery)
  );

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
                {resolvedThreads.length} Stored
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Completed consultations, grade reviews, and resolved tasks.
              Threads are{" "}
              <span className="font-bold text-amber-300">
                automatically deleted after 7 days
              </span>{" "}
              to keep the archive clean.
            </p>
          </div>
        </div>

        {/* TTL Notice */}
        <div className="shrink-0 flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5">
          <Trash2 className="h-3 w-3 text-slate-500" />
          <span>Auto-purge: 7 days</span>
        </div>
      </div>

      {/* Grid of Resolved Thread Cards */}
      {filteredResolved.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResolved.map((thread) => {
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

            const expiry = getExpiryInfo(thread.resolvedAt);

            return (
              <div
                key={thread.id}
                onClick={() => selectThread(thread)}
                className={`group relative bg-white rounded-[28px] p-5 border shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[220px] ${
                  expiry.isExpired
                    ? "border-red-200/60 opacity-60"
                    : expiry.isUrgent
                    ? "border-amber-200/70"
                    : "border-emerald-200/50"
                }`}
              >
                <div>
                  {/* Top Row: Category Icon + Resolved Pill */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-10 w-10 rounded-2xl ${catStyles.iconBg} flex items-center justify-center`}
                      >
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
                      <span className="hidden group-hover:inline text-[10px]">
                        Restore
                      </span>
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
                  <div className="space-y-0.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catStyles.badge}`}
                    >
                      {effectiveCategory}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      Resolved {resolvedDate}
                    </span>
                  </div>

                  {/* Expiry Countdown */}
                  <span
                    className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${
                      expiry.isExpired
                        ? "bg-red-50 text-red-600 border-red-200"
                        : expiry.isUrgent
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                    title="Auto-deleted 7 days after resolve date"
                  >
                    <Timer className="h-3 w-3 shrink-0" />
                    {expiry.label}
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
            When you finish handling a student inquiry or admin task, click{" "}
            &ldquo;Resolve&rdquo; to archive it here. Threads auto-delete after{" "}
            <strong>7 days</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
