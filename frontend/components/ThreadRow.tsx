"use client";

import React, { useState } from "react";
import {
  MoreHorizontal,
  Bell,
  CheckCircle2,
  CheckCheck,
  Sparkles,
  Scale,
  Building2,
  Users,
  CalendarDays,
  FileCheck2,
  Archive,
  AlertCircle,
  Clock,
  Mail,
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
    default:
      return Archive;
  }
}

/**
 * Faded, tasteful colors for academic categories
 * Harmonizes with modern monochrome theme without being loud
 */
export function getCategoryStyles(cat: ThreadCategory) {
  switch (cat) {
    case "Re-evaluation":
      return {
        iconBg: "bg-rose-50 text-rose-700 border border-rose-200/60",
        badge: "bg-rose-50/80 text-rose-700 border border-rose-200/60",
      };
    case "Examination":
      return {
        iconBg: "bg-amber-50 text-amber-700 border border-amber-200/60",
        badge: "bg-amber-50/80 text-amber-700 border border-amber-200/60",
      };
    case "Student Issue":
      return {
        iconBg: "bg-purple-50 text-purple-700 border border-purple-200/60",
        badge: "bg-purple-50/80 text-purple-700 border border-purple-200/60",
      };
    case "Meeting":
      return {
        iconBg: "bg-blue-50 text-blue-700 border border-blue-200/60",
        badge: "bg-blue-50/80 text-blue-700 border border-blue-200/60",
      };
    case "Class/Schedule":
      return {
        iconBg: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
        badge: "bg-emerald-50/80 text-emerald-700 border border-emerald-200/60",
      };
    case "Committee/Admin":
      return {
        iconBg: "bg-slate-100 text-slate-800 border border-slate-200",
        badge: "bg-slate-100 text-slate-700 border border-slate-200",
      };
    case "Other":
    default:
      return {
        iconBg: "bg-zinc-100 text-zinc-600 border border-zinc-200",
        badge: "bg-zinc-100 text-zinc-600 border border-zinc-200",
      };
  }
}

/**
 * Faded pastel urgency indicators
 */
export function getUrgencyStyles(urgency: ThreadUrgency) {
  switch (urgency) {
    case "Critical":
      return {
        cardBorder: "border-rose-200/90 shadow-2xs hover:border-rose-300 ring-1 ring-rose-100/50",
        badge: "bg-rose-50 text-rose-700 border border-rose-200 font-bold",
        dot: "bg-rose-500 shadow-xs",
        dotPulse: true,
      };
    case "High":
      return {
        cardBorder: "border-amber-200/70 shadow-2xs hover:border-amber-300",
        badge: "bg-amber-50 text-amber-700 border border-amber-200/70 font-semibold",
        dot: "bg-amber-500",
        dotPulse: false,
      };
    case "Medium":
      return {
        cardBorder: "border-black/[0.05] hover:border-slate-300",
        badge: "bg-sky-50 text-sky-700 border border-sky-200/60 font-medium",
        dot: "bg-sky-400",
        dotPulse: false,
      };
    case "Low":
    default:
      return {
        cardBorder: "border-black/[0.04] opacity-90 hover:opacity-100",
        badge: "bg-slate-100 text-slate-600 border border-slate-200 font-medium",
        dot: "bg-slate-300",
        dotPulse: false,
      };
  }
}

export function ThreadCard({ thread }: { thread: Thread }) {
  const { selectThread, markAsRead, reclassifyThread, resolveThread, resolvingIds } = useThreads();
  const [showMenu, setShowMenu] = useState(false);

  const isResolving = resolvingIds?.includes(thread.id);
  const effectiveCategory = thread.correctedCategory ?? thread.category;
  const CategoryIcon = getCategoryIcon(effectiveCategory);
  const catStyles = getCategoryStyles(effectiveCategory);
  const urgencyStyles = getUrgencyStyles(thread.urgency);

  return (
    <div
      onClick={() => {
        if (!isResolving) selectThread(thread);
      }}
      className={`group relative bg-white rounded-[28px] p-5 border ${urgencyStyles.cardBorder} transition-all duration-500 ease-out cursor-pointer flex flex-col justify-between min-h-[220px] select-none ${
        isResolving
          ? "opacity-0 scale-95 -translate-y-3 pointer-events-none ring-2 ring-emerald-400 bg-emerald-50/50"
          : "opacity-100 scale-100 translate-y-0 hover:shadow-md"
      }`}
    >
      {/* Smooth Resolving Overlay */}
      {isResolving && (
        <div className="absolute inset-0 z-30 bg-emerald-50/95 backdrop-blur-xs rounded-[28px] flex items-center justify-center gap-2 text-emerald-800 font-bold text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 animate-bounce" />
          <span>Resolved — Archiving…</span>
        </div>
      )}

      {/* Top row: Category Icon, Urgency Pill, & 3-dots Menu */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-2xl ${catStyles.iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}>
              <CategoryIcon className="h-4 w-4" />
            </div>

            {/* Urgency Badge */}
            <span className={`text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1.5 ${urgencyStyles.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${urgencyStyles.dot} ${urgencyStyles.dotPulse ? "animate-ping" : ""}`} />
              <span>{thread.urgency}</span>
            </span>
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 text-slate-400 hover:text-black rounded-lg transition-colors cursor-pointer"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-7 w-44 bg-[#18181b] text-white rounded-2xl p-1.5 shadow-xl z-20 text-xs font-semibold space-y-0.5 animate-in fade-in"
              >
                <button
                  onClick={() => {
                    resolveThread(thread.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 text-emerald-400 flex items-center gap-1.5 cursor-pointer font-bold"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Mark as Resolved</span>
                </button>
                <button
                  onClick={() => {
                    markAsRead(thread.id, !thread.isRead);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 flex items-center justify-between cursor-pointer"
                >
                  <span>{thread.isRead ? "Mark unread" : "Mark read"}</span>
                </button>
                <button
                  onClick={() => {
                    reclassifyThread(thread.id, "Committee/Admin");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  Reclassify to Admin
                </button>
                <button
                  onClick={() => {
                    reclassifyThread(thread.id, "Re-evaluation");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  Reclassify to Re-eval
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sender Email / Participant */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1 truncate">
          <Mail className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="truncate">
            {thread.participants?.[0] ||
              thread.messages?.[0]?.senderEmail ||
              thread.messages?.[0]?.sender ||
              "Inbound Mail"}
          </span>
        </div>

        {/* Subject */}
        <h4 className="font-bold text-sm text-slate-950 tracking-tight leading-snug line-clamp-2 mb-2">
          {thread.subject}
        </h4>

        {/* AI Explanation in Clean Gray Pill Box */}
        <div className="bg-slate-50 border border-slate-150/60 rounded-2xl p-2.5 mb-3 text-[11px] text-slate-700 font-medium leading-relaxed italic flex items-start gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-black shrink-0 mt-0.5" />
          <span className="line-clamp-2">{thread.aiExplanation}</span>
        </div>
      </div>

      {/* Bottom row: Meta & Read/Unread Toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="space-y-0.5">
          {/* Category Tag */}
          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${catStyles.badge}`}>
            {effectiveCategory}
          </span>
          <span className="text-[10px] text-slate-400 font-medium block">
            {thread.deadline ? (
              <span className="text-red-600 font-semibold flex items-center gap-1">
                <Clock className="h-3 w-3" /> Due {formatDeadline(thread.deadline)}
              </span>
            ) : (
              formatTimeAgo(thread.lastMessageAt)
            )}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            markAsRead(thread.id, !thread.isRead);
          }}
          className={`h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            thread.isRead
              ? "bg-slate-100 text-slate-400 hover:bg-slate-200"
              : "bg-black text-white hover:bg-slate-800 shadow-xs"
          }`}
          title={thread.isRead ? "Mark as unread" : "Mark as read"}
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
