"use client";

import React from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  ArrowLeft,
  Plus,
  Inbox,
} from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import { ThreadCard } from "./ThreadRow";
import { CategoryFilterTabs } from "./CategoryFilterTabs";
import { matchThreadSearch } from "@/lib/searchUtils";

export function PriorityFilteredView({
  onOpenSimulate,
}: {
  onOpenSimulate?: () => void;
}) {
  const {
    threads,
    selectedUrgency,
    setSelectedUrgency,
    selectedCategory,
    searchQuery,
    setActiveView,
  } = useThreads();

  // Filter threads by urgency, category, and search
  const filteredThreads = threads.filter((t) => {
    const matchesUrgency =
      selectedUrgency === "All" ? true : t.urgency === selectedUrgency;

    const effectiveCat = t.correctedCategory ?? t.category;
    const matchesCategory =
      selectedCategory === "All" ? true : effectiveCat === selectedCategory;

    const matchesSearch = matchThreadSearch(t, searchQuery);

    return matchesUrgency && matchesCategory && matchesSearch;
  });

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case "Critical":
        return {
          title: "Critical Priority Threads",
          description:
            "High-stakes emails with strict deadlines (within 24-48 hours), formal grade disputes, and emergencies requiring immediate faculty action.",
          badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          icon: ShieldAlert,
          iconBg: "bg-rose-500/20 text-rose-400",
        };
      case "High":
        return {
          title: "High Urgency Threads",
          description:
            "Time-sensitive academic accommodations, student welfare issues, and examination logistics that require resolution this week.",
          badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          icon: AlertTriangle,
          iconBg: "bg-amber-500/20 text-amber-400",
        };
      case "Medium":
        return {
          title: "Medium Priority Threads",
          description:
            "Office-hours sync requests, routine student advising questions, and committee scheduling.",
          badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/40",
          icon: Clock,
          iconBg: "bg-sky-500/20 text-sky-400",
        };
      case "Low":
      default:
        return {
          title: "Low Priority & Informational Threads",
          description:
            "General university-wide bulletins, library announcements, and low-priority informational emails.",
          badgeBg: "bg-slate-500/20 text-slate-300 border-slate-500/40",
          icon: Info,
          iconBg: "bg-slate-500/20 text-slate-400",
        };
    }
  };

  const config = getUrgencyConfig(selectedUrgency);
  const IconComponent = config.icon;

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner */}
      <div className="bg-[#121214] text-white rounded-[32px] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`h-11 w-11 rounded-2xl ${config.iconBg} flex items-center justify-center shrink-0`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-base font-bold text-white tracking-tight">
                {config.title}
              </h2>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${config.badgeBg}`}>
                {filteredThreads.length} Threads
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              {config.description}
            </p>
          </div>
        </div>

        {/* Back and Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <button
            onClick={() => {
              setSelectedUrgency("All");
              setActiveView("dashboard");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </button>

          {onOpenSimulate && (
            <button
              onClick={onOpenSimulate}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Simulate Email</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <CategoryFilterTabs />

      {/* Threads Grid */}
      {filteredThreads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredThreads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[32px] p-12 text-center border border-black/[0.04] shadow-xs flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
            <Inbox className="h-6 w-6" />
          </div>
          <h4 className="text-base font-extrabold text-slate-950 font-sans">
            No {selectedUrgency} Priority Threads
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
            There are currently no active email threads matching the {selectedUrgency} urgency level and selected category filter.
          </p>
          <button
            onClick={() => setSelectedUrgency("All")}
            className="mt-4 px-4 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
}
