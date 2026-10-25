"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  ArrowLeft,
  Inbox,
  CheckCircle2,
} from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import { ThreadCard } from "./ThreadRow";
import { CategoryFilterTabs } from "./CategoryFilterTabs";
import { matchThreadSearch } from "@/lib/searchUtils";

export function PriorityFilteredView({
  urgency,
  onOpenSimulate,
}: {
  urgency?: string;
  onOpenSimulate?: () => void;
}) {
  const {
    threads,
    selectedUrgency,
    selectedCategory,
    searchQuery,
    batchResolveCriticalThreads,
  } = useThreads();

  const effectiveUrgency = urgency || selectedUrgency || "Critical";

  // Filter threads by urgency, category, and search
  const filteredThreads = threads.filter((t) => {
    const matchesUrgency = t.urgency === effectiveUrgency;
    const effectiveCat = t.correctedCategory ?? t.category;
    const matchesCategory =
      selectedCategory === "All" ? true : effectiveCat === selectedCategory;
    const matchesSearch = matchThreadSearch(t, searchQuery);

    return matchesUrgency && matchesCategory && matchesSearch;
  });

  const getUrgencyConfig = (urg: string) => {
    switch (urg) {
      case "Critical":
        return {
          title: "Critical Priority Queue",
          description:
            "High-stakes correspondence requiring immediate faculty action: formal student grade disputes, registrar cutoffs, and urgent dean inquiries.",
          badgeBg: "bg-red-50 text-red-700 border-red-200",
          icon: ShieldAlert,
          iconBg: "bg-red-50 text-red-600",
        };
      case "High":
        return {
          title: "High Urgency Queue",
          description:
            "Time-sensitive academic accommodations, sponsored research grant deadlines, and committee obligations requiring resolution within 24-48 hours.",
          badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: AlertTriangle,
          iconBg: "bg-amber-50 text-amber-600",
        };
      case "Medium":
        return {
          title: "Medium Priority Correspondence",
          description:
            "Routine student advising questions, lecture scheduling adjustments, and departmental discussions.",
          badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: Clock,
          iconBg: "bg-blue-50 text-blue-600",
        };
      case "Low":
      default:
        return {
          title: "Low Priority & Informational Bulletins",
          description:
            "General campus newsletters, library operation announcements, and IT maintenance blasts safely deprioritized.",
          badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
          icon: Info,
          iconBg: "bg-slate-100 text-slate-600",
        };
    }
  };

  const config = getUrgencyConfig(effectiveUrgency);
  const IconComponent = config.icon;

  return (
    <div className="space-y-6 select-none">
      {/* ── Top Header Banner (Clean White Card) ── */}
      <div className="bg-white rounded-[28px] p-4 sm:p-6 shadow-2xs border border-black/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`h-11 w-11 rounded-2xl ${config.iconBg} flex items-center justify-center shrink-0`}>
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-950 tracking-tight">
                {config.title}
              </h1>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${config.badgeBg}`}>
                {filteredThreads.length} Active Items
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              {config.description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap">
          {effectiveUrgency === "Critical" && filteredThreads.length > 0 && (
            <button
              onClick={batchResolveCriticalThreads}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-red-700" />
              <span>Clear Critical Queue</span>
            </button>
          )}

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
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
        <div className="bg-white rounded-[28px] p-12 text-center border border-black/[0.06] shadow-2xs flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
            <Inbox className="h-6 w-6" />
          </div>
          <h2 className="text-base font-extrabold text-slate-950 font-sans">
            No {effectiveUrgency} Priority Threads
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
            There are currently no active email threads matching the {effectiveUrgency} urgency tier in your faculty inbox.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 px-4 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
