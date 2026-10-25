"use client";

import React from "react";
import { Sparkles, X } from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import { THREAD_CATEGORIES } from "@/types/threads";

export function CategoryFilterTabs() {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedUrgency,
    setSelectedUrgency,
    threads,
  } = useThreads();

  const countForCategory = (cat: string) => {
    let list = threads;
    if (selectedUrgency !== "All") {
      list = list.filter((t) => t.urgency === selectedUrgency);
    }
    if (cat === "All") return list.length;
    return list.filter(
      (t) => (t.correctedCategory ?? t.category) === cat
    ).length;
  };

  const categories = ["All", ...THREAD_CATEGORIES];

  return (
    <div className="space-y-2 select-none pt-1">
      {/* Active Urgency Filter Notice (if filtered) */}
      {selectedUrgency !== "All" && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Active Filter:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-[11px] font-bold shadow-xs">
            <span>{selectedUrgency} Urgency Only</span>
            <button
              onClick={() => setSelectedUrgency("All")}
              className="p-0.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              title="Clear urgency filter"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = countForCategory(cat);

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? "bg-black text-white shadow-xs"
                  : count > 0
                  ? "bg-white text-slate-800 hover:bg-slate-100 border border-slate-200/80 shadow-2xs"
                  : "bg-white/60 text-slate-400 hover:bg-white border border-slate-200/50 shadow-2xs"
              }`}
            >
              {cat === "All" && <Sparkles className="h-3 w-3" />}
              {cat !== "All" && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isSelected
                      ? "bg-white"
                      : cat === "Re-evaluation"
                      ? "bg-rose-500"
                      : cat === "Examination"
                      ? "bg-amber-500"
                      : cat === "Student Issue"
                      ? "bg-purple-500"
                      : cat === "Meeting"
                      ? "bg-blue-500"
                      : cat === "Class/Schedule"
                      ? "bg-emerald-500"
                      : cat === "Committee/Admin"
                      ? "bg-slate-600"
                      : "bg-zinc-400"
                  }`}
                />
              )}
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : count > 0
                    ? "bg-slate-100 text-slate-700"
                    : "bg-slate-100/50 text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
