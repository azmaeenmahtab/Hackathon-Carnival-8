"use client";

import React, { useMemo } from "react";
import { ThreadRow } from "./ThreadRow";
import { useThreads } from "@/context/ThreadsContext";
import { Inbox, Search } from "lucide-react";

export function ThreadList() {
  const {
    threads,
    selectedCategory,
    selectedUrgency,
    searchQuery,
    setSearchQuery,
  } = useThreads();

  const filteredThreads = useMemo(() => {
    let list = [...threads];

    // Filter by Category
    if (selectedCategory && selectedCategory !== "All") {
      list = list.filter(
        (t) => (t.correctedCategory ?? t.category) === selectedCategory
      );
    }

    // Filter by Urgency
    if (selectedUrgency && selectedUrgency !== "All") {
      list = list.filter((t) => t.urgency === selectedUrgency);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.aiExplanation.toLowerCase().includes(q) ||
          t.participants.some((p) => p.toLowerCase().includes(q))
      );
    }

    // Sort: Urgency first (Critical -> High -> Medium -> Low), then recency
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

  return (
    <div className="space-y-3">
      {/* Search & Counter header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects, reasoning, participants..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium dark:text-slate-400">
          Showing <span className="font-bold text-slate-900 dark:text-slate-100">{filteredThreads.length}</span> threads
        </div>
      </div>

      {/* List items */}
      {filteredThreads.length > 0 ? (
        <div className="space-y-2">
          {filteredThreads.map((thread) => (
            <ThreadRow key={thread.id} thread={thread} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 dark:bg-slate-800">
            <Inbox className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            No threads match criteria
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mt-1 dark:text-slate-400">
            Try adjusting your category tabs or clearing the search query to view other threads.
          </p>
        </div>
      )}
    </div>
  );
}
