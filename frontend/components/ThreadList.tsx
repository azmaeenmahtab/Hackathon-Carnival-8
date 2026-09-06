"use client";

import React, { useMemo } from "react";
import { ThreadCard } from "./ThreadRow";
import { useThreads } from "@/context/ThreadsContext";
import {
  Inbox,
  Search,
  Plus,
  ChevronRight,
  LayoutGrid,
  Sparkles,
  Mail,
  Clock,
  X,
  Zap,
} from "lucide-react";
import { matchThreadSearch } from "@/lib/searchUtils";

export function ThreadList({ onOpenSimulate }: { onOpenSimulate?: () => void }) {
  const {
    threads,
    selectedCategory,
    selectedUrgency,
    searchQuery,
    setSearchQuery,
    selectThread,
  } = useThreads();

  // ── "New" = arrived in last 6 hours, unread ─────────────────────────────
  const recentThreads = useMemo(() => {
    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
    return threads
      .filter((t) => new Date(t.lastMessageAt).getTime() > sixHoursAgo)
      .sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
      )
      .slice(0, 5);
  }, [threads]);

  // ── Filtered + sorted thread list ────────────────────────────────────────
  const filteredThreads = useMemo(() => {
    let list = [...threads];

    if (selectedCategory && selectedCategory !== "All") {
      list = list.filter(
        (t) => (t.correctedCategory ?? t.category) === selectedCategory
      );
    }

    if (selectedUrgency && selectedUrgency !== "All") {
      list = list.filter((t) => t.urgency === selectedUrgency);
    }

    if (searchQuery.trim()) {
      list = list.filter((t) => matchThreadSearch(t, searchQuery));
    }

    const urgencyOrder: Record<string, number> = {
      Critical: 1,
      High: 2,
      Medium: 3,
      Low: 4,
    };

    list.sort((a, b) => {
      const uA = urgencyOrder[a.urgency] || 5;
      const uB = urgencyOrder[b.urgency] || 5;
      if (uA !== uB) return uA - uB;
      return (
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
    });

    return list;
  }, [threads, selectedCategory, selectedUrgency, searchQuery]);

  const isSearchActive = searchQuery.trim().length > 0;

  function formatMinutesAgo(iso: string) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  }

  return (
    <div className="space-y-8 select-none">
      {/* ── Search Bar ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email address or subject line…"
            className="w-full pl-10 pr-9 py-2 rounded-full border border-black/[0.06] bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black/10 shadow-2xs font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing{" "}
          <span className="font-bold text-slate-950">{filteredThreads.length}</span>{" "}
          active items
        </div>
      </div>

      {/* ── Recent / New Mails ────────────────────────────────────────── */}
      {!isSearchActive && recentThreads.length > 0 && (
        <div className="space-y-3">
          {/* Section Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-black flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <h3 className="font-bold text-sm text-slate-950">
                New Mail{" "}
                <span className="text-xs font-semibold text-slate-400">
                  — last 6 hours
                </span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black text-white">
                {recentThreads.length}
              </span>
            </div>
          </div>

          {/* Horizontal scroll strip of recent mails */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentThreads.map((thread) => {
              const isUnread = !thread.isRead;
              const senderDisplay =
                thread.participants?.[0] ||
                thread.messages?.[0]?.senderEmail ||
                thread.messages?.[0]?.sender ||
                "Inbound Mail";

              const urgencyColors: Record<string, string> = {
                Critical: "border-rose-300 bg-rose-50/40",
                High: "border-amber-200 bg-amber-50/30",
                Medium: "border-sky-200 bg-sky-50/20",
                Low: "border-slate-200 bg-white",
              };

              return (
                <div
                  key={thread.id}
                  onClick={() => selectThread(thread)}
                  className={`relative rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-md group ${
                    urgencyColors[thread.urgency] || "border-slate-200 bg-white"
                  }`}
                >
                  {/* Unread dot */}
                  {isUnread && (
                    <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-black ring-2 ring-white" />
                  )}

                  {/* Sender */}
                  <div className="flex items-center gap-1.5 mb-1.5 pr-4">
                    <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="text-[11px] font-bold text-slate-600 truncate">
                      {senderDisplay}
                    </span>
                  </div>

                  {/* Subject */}
                  <h4 className="text-xs font-extrabold text-slate-950 line-clamp-2 leading-snug mb-2">
                    {thread.subject}
                  </h4>

                  {/* Preview */}
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                    {thread.lastMessagePreview}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Clock className="h-3 w-3" />
                      {formatMinutesAgo(thread.lastMessageAt)}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        thread.urgency === "Critical"
                          ? "bg-rose-100 text-rose-700"
                          : thread.urgency === "High"
                          ? "bg-amber-100 text-amber-700"
                          : thread.urgency === "Medium"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {thread.urgency}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── All Active Threads ────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Section header */}
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm text-slate-950">
            {isSearchActive
              ? `Search Results (${filteredThreads.length})`
              : `All Triaged Threads (${filteredThreads.length})`}
          </h3>
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <LayoutGrid className="h-3.5 w-3.5" />
          </span>
        </div>

        {filteredThreads.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredThreads.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-[32px] p-12 text-center border border-black/[0.04] shadow-xs flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
              <Inbox className="h-6 w-6" />
            </div>
            <h4 className="text-base font-extrabold text-slate-950 font-sans">
              {isSearchActive ? "No Matches Found" : "Inbox is Clear"}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
              {isSearchActive
                ? `No threads match "${searchQuery}". Try searching by sender email or a keyword in the subject line.`
                : "No active threads. Ingest a new email to begin AI triage."}
            </p>
            {isSearchActive ? (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 rounded-full bg-black text-white text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={onOpenSimulate}
                className="mt-4 px-4 py-2 rounded-full bg-black text-white text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Test Inbound Email
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── + Ingest Card at the bottom if results exist ──────────────── */}
      {filteredThreads.length > 0 && (
        <div
          onClick={onOpenSimulate}
          className="border-2 border-dashed border-slate-200 hover:border-black rounded-[28px] p-6 flex items-center justify-center gap-3 text-slate-500 hover:text-black cursor-pointer transition-all bg-white/40 hover:bg-white"
        >
          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-900">
            <Plus className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-xs block">+ Test Inbound Email</span>
            <p className="text-[10px] text-slate-400">
              Simulate a real incoming email &amp; run live AI triage
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
