"use client";

import React, { useMemo, useState } from "react";
import { ThreadCard } from "./ThreadRow";
import { useThreads } from "@/context/ThreadsContext";
import {
  Inbox,
  Search,
  Plus,
  Edit2,
  CheckCircle2,
  Circle,
  LayoutGrid,
  List,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

export function ThreadList({ onOpenSimulate }: { onOpenSimulate?: () => void }) {
  const {
    threads,
    selectedCategory,
    selectedUrgency,
    searchQuery,
    setSearchQuery,
    selectThread,
  } = useThreads();

  const [checklist, setChecklist] = useState([
    { id: 1, text: "Review CS301 grade re-evaluations", done: true },
    { id: 2, text: "Confirm ABET curriculum outcome sync", done: false },
    { id: 3, text: "Upload CS410 final exam rubric", done: false },
    { id: 4, text: "Approve TA timesheet hours", done: false },
  ]);

  const toggleCheck = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const doneCount = checklist.filter((c) => c.done).length;

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
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.aiExplanation.toLowerCase().includes(q) ||
          t.participants.some((p) => p.toLowerCase().includes(q))
      );
    }

    // Urgency order
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

  // Priority threads for the bottom matte black cards (matches "Last Projects")
  const topProjects = useMemo(() => {
    return threads.slice(0, 3);
  }, [threads]);

  return (
    <div className="space-y-8 select-none">
      {/* Search Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects, reasoning, sender..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-black/[0.06] bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black/10 shadow-2xs"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-950">{filteredThreads.length}</span> active items
        </div>
      </div>

      {/* Middle Section: "Month goals" (Left) + "Task In process" (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Month Goals Card (matches "Month goals:" in reference) */}
        <div className="lg:col-span-4 bg-white rounded-[32px] p-6 border border-black/[0.04] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-sm text-slate-950">
                Priority goals:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400">
                  {doneCount}/{checklist.length}
                </span>
                <Edit2 className="h-3.5 w-3.5 text-slate-400 hover:text-black cursor-pointer" />
              </div>
            </div>

            <div className="space-y-3.5">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="flex items-center gap-3 text-xs font-medium text-slate-700 cursor-pointer hover:text-black"
                >
                  <button className="text-black shrink-0">
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 fill-black text-white" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-300" />
                    )}
                  </button>
                  <span className={item.done ? "line-through text-slate-400" : ""}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Deadlines synced with Registrar</span>
            <span className="font-bold text-black">Updated Today</span>
          </div>
        </div>

        {/* Right Column: "Task In process (X)" Grid with cards + "+ Add task" */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-sm text-slate-950">
              Task in process ({filteredThreads.length})
            </h3>
            <span className="text-xs font-semibold text-slate-400 hover:text-black cursor-pointer flex items-center gap-1">
              Open archive <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Show top 3 filtered threads */}
            {filteredThreads.slice(0, 3).map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))}

            {/* Dashed "+ Ingest New Email" Card matching reference "+ Add task" */}
            <div
              onClick={onOpenSimulate}
              className="border-2 border-dashed border-slate-300 hover:border-black rounded-[28px] p-6 flex flex-col items-center justify-center text-slate-500 hover:text-black cursor-pointer transition-all bg-white/40 hover:bg-white min-h-[220px]"
            >
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 mb-2">
                <Plus className="h-5 w-5" />
              </div>
              <span className="font-bold text-xs">+ Test Inbound Email</span>
              <p className="text-[10px] text-slate-400 text-center mt-1 max-w-[160px]">
                Simulate a real incoming email & run live AI triage
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Remaining Threads (if more than 3) */}
      {filteredThreads.length > 3 && (
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-950 px-1">
            All Triaged Threads
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredThreads.slice(3).map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))}
          </div>
        </div>
      )}

      {/* Bottom Section: "Last Projects" (3 Matte Black Cards in reference image) */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-sm text-slate-950">
            Last Projects / Focus Areas
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <span>Sort by</span>
            <div className="flex items-center gap-1 text-black">
              <LayoutGrid className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topProjects.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => selectThread(item)}
              className="bg-[#121214] text-white rounded-[28px] p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-sm tracking-tight text-white line-clamp-1">
                    {item.subject}
                  </h4>
                  <span className="h-6 w-6 rounded-full border border-white/20 text-white/80 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx === 0 ? "3/4" : idx === 1 ? "1/1" : "2/8"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-3">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      item.urgency === "Critical" ? "bg-white" : "bg-slate-400"
                    }`}
                  />
                  <span>
                    {item.urgency === "Critical" ? "Immediate Action" : "In Progress"}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] text-slate-300 font-medium line-clamp-2">
                {item.aiExplanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
