"use client";

import React from "react";
import {
  Users,
  CalendarDays,
  AlertCircle,
  FileCheck2,
  Scale,
  Building2,
  FolderMinus,
  Sparkles,
} from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import { ThreadCategory, THREAD_CATEGORIES } from "@/types/threads";

export function getCategoryBadge(category: ThreadCategory) {
  switch (category) {
    case "Re-evaluation":
      return {
        icon: Scale,
        color: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900",
      };
    case "Examination":
      return {
        icon: FileCheck2,
        color: "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900",
      };
    case "Student Issue":
      return {
        icon: AlertCircle,
        color: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
      };
    case "Meeting":
      return {
        icon: Users,
        color: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
      };
    case "Class/Schedule":
      return {
        icon: CalendarDays,
        color: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
      };
    case "Committee/Admin":
      return {
        icon: Building2,
        color: "bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900",
      };
    case "Other":
      return {
        icon: FolderMinus,
        color: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700",
      };
  }
}

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
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        const isOther = cat === "Other";
        const count = countForCategory(cat);

        return (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
              isSelected
                ? isOther
                  ? "bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-700 dark:text-slate-100"
                  : "bg-slate-900 text-white border-slate-900 shadow-xs dark:bg-white dark:text-slate-900"
                : isOther
                ? "text-slate-600 bg-slate-50/80 border-slate-200 hover:bg-slate-100 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800"
                : "text-slate-700 bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
            }`}
          >
            {cat === "All" && <Sparkles className="h-3.5 w-3.5" />}
            {cat !== "All" && (
              <span
                className={`h-2 w-2 rounded-full ${
                  cat === "Re-evaluation"
                    ? "bg-rose-500"
                    : cat === "Examination"
                    ? "bg-purple-500"
                    : cat === "Student Issue"
                    ? "bg-amber-500"
                    : cat === "Meeting"
                    ? "bg-blue-500"
                    : cat === "Class/Schedule"
                    ? "bg-emerald-500"
                    : cat === "Committee/Admin"
                    ? "bg-indigo-500"
                    : "bg-slate-400"
                }`}
              />
            )}
            <span>{cat}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected
                  ? isOther
                    ? "bg-slate-300 text-slate-700 dark:bg-slate-600 dark:text-slate-200"
                    : "bg-slate-800 text-slate-200 dark:bg-slate-200 dark:text-slate-800"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
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
