"use client";

import React from "react";
import {
  ClockAlert,
  Mail,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";

export function PriorityStatStrip() {
  const {
    threads,
    resolvedThreads,
    stats,
    setActiveView,
    selectedUrgency,
    setSelectedUrgency,
    batchResolveCriticalThreads,
  } = useThreads();

  // Noise filtered count (Other category)
  const noiseThreads = threads.filter(
    (t) => (t.correctedCategory ?? t.category) === "Other"
  );
  const noisePercent =
    threads.length > 0
      ? Math.round((noiseThreads.length / threads.length) * 100)
      : 0;

  const hasUrgent = stats.critical > 0 || stats.high > 0;

  return (
    <div className="space-y-4">
      {/* ── 1. Emergency Triage Action Banner ── */}
      {hasUrgent ? (
        <div className="bg-red-50/90 border border-red-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold uppercase tracking-wider text-red-900">
                  Emergency Action Required
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-200 text-red-950 text-[10px] font-bold">
                  {stats.critical} Critical · {stats.high} High
                </span>
              </div>
              <p className="text-xs text-red-800 font-medium mt-0.5 leading-relaxed">
                Time-sensitive student inquiries and urgent academic deadlines require immediate faculty review.
              </p>
            </div>
          </div>

          {/* Quick Actions for Emergency Mails */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() =>
                setSelectedUrgency(
                  selectedUrgency === "Critical" ? "All" : "Critical"
                )
              }
              className="px-4 py-2 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>
                {selectedUrgency === "Critical"
                  ? "Show All Mails"
                  : "Check Emergency Mails ASAP"}
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            {stats.critical > 0 && (
              <button
                onClick={batchResolveCriticalThreads}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-red-100 text-red-900 border border-red-300/80 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                title="Mark all critical threads as resolved / handled"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-red-700" />
                <span>Clear Critical Queue</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-black/[0.06] rounded-2xl p-3.5 px-5 flex items-center justify-between text-xs shadow-2xs transition-all">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold text-slate-800">
              Emergency Queue Clear: No critical academic disputes or tight deadlines pending.
            </span>
          </div>
          <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">
            All faculty priorities stabilized
          </span>
        </div>
      )}

      {/* ── 2. Standard Industry Practice: 4 Clean Unified Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Emergency & High Priority */}
        <div
          onClick={() =>
            setSelectedUrgency(
              selectedUrgency === "Critical"
                ? "All"
                : stats.critical > 0
                ? "Critical"
                : "High"
            )
          }
          className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-xs group ${
            selectedUrgency === "Critical" || selectedUrgency === "High"
              ? "border-black ring-2 ring-black/5"
              : "border-black/[0.06] hover:border-black/20"
          }`}
          title="Click to filter urgent correspondence"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600">
              Urgent / Action
            </span>
            <div
              className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                stats.critical > 0
                  ? "bg-red-50 text-red-600"
                  : stats.high > 0
                  ? "bg-amber-50 text-amber-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {stats.critical > 0 ? (
                <ShieldAlert className="h-4 w-4" />
              ) : stats.high > 0 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-950 font-sans">
              {stats.critical + stats.high}
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center justify-between">
              <span>
                {stats.critical > 0 ? (
                  <strong className="text-red-600 font-bold">
                    {stats.critical} Critical
                  </strong>
                ) : (
                  "0 Critical"
                )}{" "}
                · {stats.high} High
              </span>
              <span className="text-[10px] font-bold text-black group-hover:underline">
                {selectedUrgency === "Critical" ? "Filtered" : "Filter →"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Needs Follow-Up */}
        <div
          onClick={() => setActiveView("follow-up")}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-black/[0.06] hover:border-black/20 transition-all cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-xs group"
          title="Click to view follow-up queue"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600">
              Needs Follow-Up
            </span>
            <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center">
              <ClockAlert className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-950 font-sans">
              {stats.needsFollowUp}
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center justify-between">
              <span>Awaiting reply past 48h</span>
              <span className="text-[10px] font-bold text-black group-hover:underline">
                View →
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Unread Messages */}
        <div
          onClick={() => {
            setSelectedUrgency("All");
            setActiveView("dashboard");
          }}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-black/[0.06] hover:border-black/20 transition-all cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-xs group"
          title="Total unread correspondence"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600">
              Unread Inbox
            </span>
            <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center">
              <Mail className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-950 font-sans">
              {stats.unread}
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center justify-between">
              <span>Of {stats.totalThreads} total triaged</span>
              <span className="text-[10px] font-bold text-black group-hover:underline">
                Inbox →
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Resolved & Noise Filtered */}
        <div
          onClick={() => setActiveView("resolved")}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-black/[0.06] hover:border-black/20 transition-all cursor-pointer flex flex-col justify-between shadow-2xs hover:shadow-xs group"
          title="Click to view resolved threads"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600">
              Resolved & Clean
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-950 font-sans text-emerald-700">
              {resolvedThreads.length}
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center justify-between">
              <span>{noisePercent}% noise deprioritized</span>
              <span className="text-[10px] font-bold text-black group-hover:underline">
                Archive →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
