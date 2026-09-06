"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import { THREAD_CATEGORIES } from "@/types/threads";

export function CategoryFilterTabs() {
  const { selectedCategory, setSelectedCategory, threads } = useThreads();

  const countForCategory = (cat: string) => {
    if (cat === "All") return threads.length;
    return threads.filter(
      (t) => (t.correctedCategory ?? t.category) === cat
    ).length;
  };

  const categories = ["All", ...THREAD_CATEGORIES];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none select-none">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        const count = countForCategory(cat);

        return (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              isSelected
                ? "bg-black text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-2xs"
            }`}
          >
            {cat === "All" && <Sparkles className="h-3 w-3" />}
            {cat !== "All" && (
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isSelected ? "bg-white" : "bg-slate-400"
                }`}
              />
            )}
            <span>{cat}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
