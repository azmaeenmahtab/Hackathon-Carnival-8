"use client";

import React, { useState } from "react";
import {
  MoreHorizontal,
  Bell,
  CheckCircle2,
  Circle,
  Sparkles,
  ClockAlert,
  Calendar,
  Scale,
  Building2,
  Users,
  CalendarDays,
  FileCheck2,
  Archive,
  AlertCircle,
} from "lucide-react";
import { Thread, ThreadUrgency, ThreadCategory } from "@/types/threads";
import { useThreads } from "@/context/ThreadsContext";

export function formatTimeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Today";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function formatDeadline(isoString: string): string {
  const d = new Date(isoString);
  const month = d.toLocaleDateString("en-US", { month: "short" });
  const day = d.getDate();
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  return `${weekday}, ${month} ${day}`;
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
      return Archive;
  }
}

export function ThreadCard({ thread }: { thread: Thread }) {
  const { selectThread, markAsRead, reclassifyThread } = useThreads();
  const [showMenu, setShowMenu] = useState(false);

  const effectiveCategory = thread.correctedCategory ?? thread.category;
  const CategoryIcon = getCategoryIcon(effectiveCategory);

  return (
    <div
      onClick={() => selectThread(thread)}
      className="group relative bg-white rounded-[28px] p-5 border border-black/[0.04] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[220px]"
    >
      {/* Top row: Icon & 3-dots Menu */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-black group-hover:text-white transition-colors">
            <CategoryIcon className="h-5 w-5" />
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 text-slate-400 hover:text-black rounded-lg transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-7 w-36 bg-[#18181b] text-white rounded-2xl p-1.5 shadow-xl z-20 text-xs font-semibold space-y-0.5 animate-in fade-in"
              >
                <button
                  onClick={() => {
                    markAsRead(thread.id, !thread.isRead);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 flex items-center justify-between"
                >
                  <span>{thread.isRead ? "Mark unread" : "Mark read"}</span>
                </button>
                <button
                  onClick={() => {
                    reclassifyThread(thread.id, "Committee/Admin");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10"
                >
                  Reclassify
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Subject */}
        <h4 className="font-bold text-sm text-slate-950 tracking-tight leading-snug line-clamp-2 mb-2">
          {thread.subject}
        </h4>

        {/* AI Explanation in Clean Gray Pill Box */}
        <div className="bg-slate-100/90 rounded-2xl p-2.5 mb-3 text-[11px] text-slate-700 font-medium leading-relaxed italic flex items-start gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-black shrink-0 mt-0.5" />
          <span className="line-clamp-2">{thread.aiExplanation}</span>
        </div>
      </div>

      {/* Bottom row: Meta & Black Action Pill */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                thread.urgency === "Critical"
                  ? "bg-black"
                  : thread.urgency === "High"
                  ? "bg-slate-600"
                  : "bg-slate-300"
              }`}
            />
            <span className="font-bold text-[11px] text-slate-900">
              {effectiveCategory}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            {thread.deadline ? formatDeadline(thread.deadline) : formatTimeAgo(thread.lastMessageAt)}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            markAsRead(thread.id, !thread.isRead);
          }}
          className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
            thread.isRead
              ? "bg-slate-100 text-slate-400 hover:bg-slate-200"
              : "bg-black text-white hover:bg-slate-800 shadow-xs"
          }`}
          title={thread.isRead ? "Mark Unread" : "Mark Read"}
        >
          {thread.isRead ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <Bell className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

export function ThreadRow({ thread }: { thread: Thread }) {
  return <ThreadCard thread={thread} />;
}
