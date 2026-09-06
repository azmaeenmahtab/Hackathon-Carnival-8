"use client";

import React from "react";
import {
  ClockAlert,
  Calendar,
  Sparkles,
  CheckCircle,
  Circle,
  MessageSquare,
  Scale,
  Building2,
  Users,
  CalendarDays,
  AlertCircle,
  FileCheck2,
  FolderMinus,
} from "lucide-react";
import { Thread, ThreadUrgency, ThreadCategory } from "@/types/threads";
import { useThreads } from "@/context/ThreadsContext";

export function formatTimeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function formatDeadline(isoString: string): string {
  const d = new Date(isoString);
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const day = d.getDate();
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  return `Due: ${weekday}, ${month} ${day}`;
}

export function getUrgencyBadge(urgency: ThreadUrgency) {
  switch (urgency) {
    case "Critical":
      return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
    case "High":
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
    case "Medium":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800";
    case "Low":
      return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  }
}

export function getCategoryIcon(cat: ThreadCategory) {
  switch (cat) {
    case "Re-evaluation":
      return Scale;
    case "Examination":
      return FileCheck2;
    case "Student Issue":
      return AlertCircle;
    case "Meeting":
      return Users;
    case "Class/Schedule":
      return CalendarDays;
    case "Committee/Admin":
      return Building2;
    case "Other":
      return FolderMinus;
  }
}

export function ThreadRow({ thread }: { thread: Thread }) {
  const { selectThread, markAsRead } = useThreads();
  const effectiveCategory = thread.correctedCategory ?? thread.category;
  const CategoryIcon = getCategoryIcon(effectiveCategory);

  return (
    <div
      onClick={() => selectThread(thread)}
      className={`group relative rounded-xl border p-4 transition-all cursor-pointer hover:shadow-md ${
        !thread.isRead
          ? "border-indigo-200/90 bg-white ring-1 ring-indigo-500/10 dark:border-indigo-900/60 dark:bg-slate-900"
          : "border-slate-200 bg-white/70 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Unread dot + Subject + Metadata */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              markAsRead(thread.id, !thread.isRead);
            }}
            title={thread.isRead ? "Mark unread" : "Mark read"}
            className="mt-1 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            {thread.isRead ? (
              <CheckCircle className="h-4 w-4 text-slate-300 dark:text-slate-600" />
            ) : (
              <Circle className="h-4 w-4 fill-indigo-600 text-indigo-600 animate-pulse" />
            )}
          </button>

          <div className="min-w-0 flex-1 space-y-1.5">
            {/* Header badges & participants */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getUrgencyBadge(
                  thread.urgency
                )}`}
              >
                {thread.urgency}
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                <CategoryIcon className="h-3 w-3 text-slate-500" />
                {effectiveCategory}
                {thread.correctedCategory && (
                  <span className="text-[9px] text-indigo-600 font-bold dark:text-indigo-400">
                    (Corrected)
                  </span>
                )}
              </span>

              {thread.needsFollowUp && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                  <ClockAlert className="h-3 w-3" />
                  Needs Follow-Up
                </span>
              )}

              {thread.deadline && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                  <Calendar className="h-3 w-3" />
                  {formatDeadline(thread.deadline)}
                </span>
              )}

              <span className="text-xs text-slate-500 truncate dark:text-slate-400 max-w-[280px]">
                {thread.participants.join(" • ")}
              </span>
            </div>

            {/* Subject */}
            <h3
              className={`text-sm tracking-tight text-slate-900 line-clamp-1 dark:text-slate-100 ${
                !thread.isRead ? "font-bold" : "font-semibold"
              }`}
            >
              {thread.subject}
            </h3>

            {/* Core AI Explanation - Visually Prominent */}
            <div className="flex items-center gap-2 rounded-lg bg-indigo-50/70 px-3 py-1.5 border border-indigo-100 text-xs text-indigo-950 dark:bg-indigo-950/30 dark:border-indigo-900/40 dark:text-indigo-200">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-medium italic line-clamp-1">
                {thread.aiExplanation}
              </span>
            </div>

            {/* Last message preview */}
            <p className="text-xs text-slate-600 line-clamp-1 dark:text-slate-400">
              {thread.lastMessagePreview}
            </p>
          </div>
        </div>

        {/* Right: Timestamp & Message Count */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
          <span className="text-xs text-slate-500 font-medium dark:text-slate-400">
            {formatTimeAgo(thread.lastMessageAt)}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <MessageSquare className="h-3 w-3" />
            {thread.messageCount}
          </span>
        </div>
      </div>
    </div>
  );
}
