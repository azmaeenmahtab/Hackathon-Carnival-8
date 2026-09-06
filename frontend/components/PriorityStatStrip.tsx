"use client";

import React from "react";
import {
  ClockAlert,
  Mail,
  CheckCircle2,
  ShieldAlert,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Archive,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";

export function PriorityStatStrip() {
  const {
    threads,
    stats,
    syncWithBackend,
    isSyncing,
    setActiveView,
    selectedUrgency,
    setSelectedUrgency,
    setSelectedCategory,
  } = useThreads();

  // Noise filtered count (Other category)
  const noiseThreads = threads.filter(
    (t) => (t.correctedCategory ?? t.category) === "Other"
  );
  const noisePercent =
    threads.length > 0
      ? Math.round((noiseThreads.length / threads.length) * 100)
      : 0;

  // Student & academic core threads
  const academicThreads = threads.filter(
    (t) => (t.correctedCategory ?? t.category) !== "Other"
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Matte Black Card - "Overall Priority Queue" */}
      <div className="bg-[#121214] text-white rounded-[32px] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-5">
            <span className="font-semibold tracking-wide text-white flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Overall Triage Queue
            </span>
            <button
              onClick={() =>
                setSelectedUrgency(
                  selectedUrgency === "Critical" ? "All" : "Critical"
                )
              }
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                selectedUrgency === "Critical"
                  ? "bg-white text-black"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
              title="Toggle Critical Filter"
            >
              Filter Critical
            </button>
          </div>

          {/* Large Stat Numbers */}
          <div className="flex items-baseline gap-6 mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-white font-sans">
                {stats.totalThreads}
              </span>
              <span className="text-[11px] text-slate-400 font-medium leading-tight max-w-[70px]">
                Total triaged
              </span>
            </div>

            <div className="flex items-baseline gap-2 border-l border-white/10 pl-5">
              <span className="text-4xl font-extrabold tracking-tight text-white font-sans flex items-center gap-1.5">
                {stats.critical}
                {stats.critical > 0 && (
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                )}
              </span>
              <span className="text-[11px] text-slate-400 font-medium leading-tight max-w-[75px]">
                Critical deadlines
              </span>
            </div>
          </div>
        </div>

        {/* 3 White Mini Cards inside the Black Card */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          {/* Resolved */}
          <div className="bg-white text-slate-900 rounded-2xl p-3 text-center shadow-xs flex flex-col items-center justify-center">
            <div className="h-5 w-5 rounded-full border border-slate-300 flex items-center justify-center mb-1">
              <CheckCircle2 className="h-3 w-3 text-black" />
            </div>
            <div className="text-lg font-extrabold tracking-tight font-sans">
              {Math.max(0, stats.totalThreads - stats.needsFollowUp)}
            </div>
            <div className="text-[10px] font-semibold text-slate-500">
              Resolved
            </div>
          </div>

          {/* Follow-Up button */}
          <button
            onClick={() => setActiveView("follow-up")}
            className="bg-white text-slate-900 rounded-2xl p-3 text-center shadow-xs flex flex-col items-center justify-center hover:bg-slate-100 transition-all cursor-pointer"
            title="View Follow-Up safety net"
          >
            <div className="h-5 w-5 rounded-full border-2 border-dashed border-black flex items-center justify-center mb-1">
              <ClockAlert className="h-2.5 w-2.5 text-black" />
            </div>
            <div className="text-lg font-extrabold tracking-tight font-sans text-black">
              {stats.needsFollowUp}
            </div>
            <div className="text-[10px] font-bold text-black">
              Follow-Up
            </div>
          </button>

          {/* Unread */}
          <div className="bg-white text-slate-900 rounded-2xl p-3 text-center shadow-xs flex flex-col items-center justify-center">
            <div className="h-5 w-5 rounded-full border border-slate-300 flex items-center justify-center mb-1">
              <Mail className="h-2.5 w-2.5 text-slate-900" />
            </div>
            <div className="text-lg font-extrabold tracking-tight font-sans">
              {stats.unread}
            </div>
            <div className="text-[10px] font-semibold text-slate-500">
              Unread
            </div>
          </div>
        </div>
      </div>

      {/* 2. White Card - "Action Needed & Urgency Breakdown" */}
      <div className="bg-white text-slate-900 rounded-[32px] p-6 shadow-sm border border-black/[0.04] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs mb-4">
            <span className="font-bold tracking-tight text-sm text-slate-950 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-black" />
              Action & Urgency Safety Net
            </span>
            <span className="bg-black text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              {stats.critical + stats.high} Pending Action
            </span>
          </div>

          {/* 2 Prominent Metric Badges */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-xs text-slate-500 font-medium">Critical / High</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-extrabold text-slate-950 font-sans">
                  {stats.critical + stats.high}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">threads</span>
              </div>
              <span className="text-[10px] text-red-600 font-bold mt-1">
                {stats.critical} with tight deadline
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-xs text-slate-500 font-medium">Awaiting Reply</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-extrabold text-slate-950 font-sans">
                  {stats.needsFollowUp}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">past 48h</span>
              </div>
              <span className="text-[10px] text-orange-600 font-bold mt-1">
                Needs professor reply
              </span>
            </div>
          </div>

          {/* Quick Filter Pill Buttons */}
          <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
            <button
              onClick={() => setSelectedUrgency("Critical")}
              className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-bold hover:bg-red-100 transition-colors cursor-pointer"
            >
              ● {stats.critical} Critical
            </button>
            <button
              onClick={() => setSelectedUrgency("High")}
              className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-[11px] font-bold hover:bg-orange-100 transition-colors cursor-pointer"
            >
              ● {stats.high} High
            </button>
            <button
              onClick={() => setSelectedUrgency("All")}
              className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>
        </div>

        {/* Direct Action Link */}
        <button
          onClick={() => setActiveView("follow-up")}
          className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <span>Inspect {stats.needsFollowUp} Overdue Follow-ups</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 3. White Card - "Academic Core & Noise Elimination" */}
      <div className="bg-white text-slate-900 rounded-[32px] p-6 shadow-sm border border-black/[0.04] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs mb-4">
            <span className="font-bold tracking-tight text-sm text-slate-950 flex items-center gap-1.5">
              <Archive className="h-4 w-4 text-slate-700" />
              Noise Reduction & Sync
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              {noisePercent}% Noise Filtered
            </span>
          </div>

          {/* 2 Prominent Metric Badges */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col">
              <span className="text-xs text-slate-500 font-medium">Academic Core</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-extrabold text-slate-950 font-sans">
                  {academicThreads.length}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">inbox</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-1">
                Students, exams, admin
              </span>
            </div>

            <button
              onClick={() => setActiveView("other")}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col text-left hover:bg-slate-100 transition-colors cursor-pointer"
              title="View filtered newsletters and notices"
            >
              <span className="text-xs text-slate-500 font-medium">Filtered Noise</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-extrabold text-slate-950 font-sans">
                  {noiseThreads.length}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">bulletins</span>
              </div>
              <span className="text-[10px] text-slate-600 font-bold mt-1 flex items-center gap-1">
                Review &apos;Other&apos; →
              </span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 leading-snug">
            Campus newsletters, library hours, and IT blasts are safely deprioritized so you focus on student inquiries.
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-2">
          <button
            onClick={syncWithBackend}
            disabled={isSyncing}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-full bg-black text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing Inbox..." : "Sync Live Inbox"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
