"use client";

import React from "react";
import { AlertOctagon, Flame, ClockAlert, Mail } from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";

export function PriorityStatStrip() {
  const { stats, selectedUrgency, setSelectedUrgency, setActiveView } =
    useThreads();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Critical */}
      <button
        onClick={() => {
          setSelectedUrgency(selectedUrgency === "Critical" ? "All" : "Critical");
        }}
        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
          selectedUrgency === "Critical"
            ? "border-rose-300 bg-rose-50 ring-2 ring-rose-400/30 dark:border-rose-800 dark:bg-rose-950/40"
            : "border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/30 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-900/60"
        }`}
      >
        <div className="h-10 w-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 dark:bg-rose-950/60 dark:text-rose-400">
          <AlertOctagon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
            {stats.critical}
          </div>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Critical
          </div>
        </div>
      </button>

      {/* High */}
      <button
        onClick={() => {
          setSelectedUrgency(selectedUrgency === "High" ? "All" : "High");
        }}
        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
          selectedUrgency === "High"
            ? "border-amber-300 bg-amber-50 ring-2 ring-amber-400/30 dark:border-amber-800 dark:bg-amber-950/40"
            : "border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/30 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-900/60"
        }`}
      >
        <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 dark:bg-amber-950/60 dark:text-amber-400">
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {stats.high}
          </div>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            High Urgency
          </div>
        </div>
      </button>

      {/* Needs Follow-Up */}
      <button
        onClick={() => {
          setActiveView("follow-up");
        }}
        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 text-left transition-all dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900/60"
      >
        <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 dark:bg-indigo-950/60 dark:text-indigo-400">
          <ClockAlert className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
            {stats.needsFollowUp}
          </div>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Needs Follow-Up
          </div>
        </div>
      </button>

      {/* Unread */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white text-left dark:border-slate-800 dark:bg-slate-900">
        <div className="h-10 w-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 dark:bg-sky-950/60 dark:text-sky-400">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400">
            {stats.unread}
          </div>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Unread Threads
          </div>
        </div>
      </div>
    </div>
  );
}
