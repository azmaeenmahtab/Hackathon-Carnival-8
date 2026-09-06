"use client";

import React from "react";
import {
  Share2,
  MoreVertical,
  TrendingUp,
  Download,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  ClockAlert,
  Mail,
  AlertOctagon,
} from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";

export function PriorityStatStrip() {
  const {
    stats,
    digest,
    syncWithBackend,
    isSyncing,
    setActiveView,
    selectedUrgency,
    setSelectedUrgency,
  } = useThreads();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Matte Black Card - "Overall Information" */}
      <div className="bg-[#121214] text-white rounded-[32px] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-5">
            <span className="font-semibold tracking-wide text-white">
              Overall Information
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedUrgency(selectedUrgency === "Critical" ? "All" : "Critical")}
                className="p-1.5 hover:text-white transition-colors"
                title="Filter Critical"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
              <button className="p-1.5 hover:text-white transition-colors">
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Large Stat Numbers */}
          <div className="flex items-baseline gap-6 mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-white font-sans">
                {stats.totalThreads}
              </span>
              <span className="text-[11px] text-slate-400 font-medium leading-tight max-w-[70px]">
                Threads triaged
              </span>
            </div>

            <div className="flex items-baseline gap-2 border-l border-white/10 pl-5">
              <span className="text-4xl font-extrabold tracking-tight text-white font-sans">
                {stats.critical}
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
              <span className="h-2 w-2 rounded-full bg-black" />
            </div>
            <div className="text-lg font-extrabold tracking-tight">
              {stats.totalThreads - stats.needsFollowUp}
            </div>
            <div className="text-[10px] font-semibold text-slate-500">
              Resolved
            </div>
          </div>

          {/* In Progress / Follow-Up */}
          <button
            onClick={() => setActiveView("follow-up")}
            className="bg-white text-slate-900 rounded-2xl p-3 text-center shadow-xs flex flex-col items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <div className="h-5 w-5 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center mb-1">
              <ClockAlert className="h-2.5 w-2.5 text-slate-900" />
            </div>
            <div className="text-lg font-extrabold tracking-tight">
              {stats.needsFollowUp}
            </div>
            <div className="text-[10px] font-semibold text-slate-500">
              Follow-Up
            </div>
          </button>

          {/* Unread */}
          <div className="bg-white text-slate-900 rounded-2xl p-3 text-center shadow-xs flex flex-col items-center justify-center">
            <div className="h-5 w-5 rounded-full border border-slate-300 flex items-center justify-center mb-1">
              <Mail className="h-2.5 w-2.5 text-slate-900" />
            </div>
            <div className="text-lg font-extrabold tracking-tight">
              {stats.unread}
            </div>
            <div className="text-[10px] font-semibold text-slate-500">
              Unread
            </div>
          </div>
        </div>
      </div>

      {/* 2. White Card - "Weekly progress & AI Digest" */}
      <div className="bg-white text-slate-900 rounded-[32px] p-6 shadow-sm border border-black/[0.04] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-bold tracking-tight text-sm text-slate-950">
              Weekly progress
            </span>
            <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              +24%
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mb-3">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-black" />
              Student
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              Exam / Admin
            </span>
          </div>

          {/* Smooth SVG wave graph (like the reference image) */}
          <div className="my-2">
            <svg
              viewBox="0 0 300 75"
              className="w-full h-16 stroke-slate-900 fill-none"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M 10 48 C 40 48, 60 25, 90 35 C 120 45, 140 18, 170 18 C 200 18, 220 52, 250 30 C 270 16, 285 24, 295 24"
              />
              <path
                d="M 10 60 C 50 60, 70 42, 105 48 C 140 55, 165 40, 195 40 C 230 40, 255 58, 295 50"
                stroke="#cbd5e1"
                strokeWidth="1.8"
              />
            </svg>

            {/* Days of week axis */}
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-2">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span className="bg-black text-white rounded-full h-4 w-4 flex items-center justify-center text-[9px]">
                S
              </span>
              <span>S</span>
            </div>
          </div>
        </div>

        {/* AI Brief Summary */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-600 leading-snug">
          <Sparkles className="h-3.5 w-3.5 text-black shrink-0 mt-0.5" />
          <p className="line-clamp-2">
            {digest}
          </p>
        </div>
      </div>

      {/* 3. White Card - "Month progress & Triage Health" */}
      <div className="bg-white text-slate-900 rounded-[32px] p-6 shadow-sm border border-black/[0.04] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold tracking-tight text-sm text-slate-950">
              Month progress
            </span>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-[10px] text-slate-400 font-medium mb-4">
            +20% compared to last month*
          </p>

          <div className="flex items-center justify-between gap-4 my-1">
            {/* Legend */}
            <div className="space-y-1.5 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-black" />
                <span>Re-evaluation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                <span>Examinations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                <span>Committees</span>
              </div>
            </div>

            {/* Concentric Progress Gauge */}
            <div className="relative h-24 w-24 flex items-center justify-center shrink-0">
              <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                {/* Outer ring background */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-150 fill-none"
                  strokeWidth="5"
                />
                {/* Outer ring active */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-black fill-none"
                  strokeWidth="5"
                  strokeDasharray="264"
                  strokeDashoffset="60"
                  strokeLinecap="round"
                />
                {/* Inner ring background */}
                <circle
                  cx="50"
                  cy="50"
                  r="32"
                  className="stroke-slate-100 fill-none"
                  strokeWidth="4"
                />
                {/* Inner ring active */}
                <circle
                  cx="50"
                  cy="50"
                  r="32"
                  className="stroke-slate-400 fill-none"
                  strokeWidth="4"
                  strokeDasharray="201"
                  strokeDashoffset="75"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-sm font-extrabold tracking-tight text-slate-950 font-sans">
                  88%
                </span>
                <span className="block text-[8px] text-slate-400 uppercase font-bold tracking-wider">
                  Health
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={syncWithBackend}
            disabled={isSyncing}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync Live Inbox"}</span>
          </button>
          <button
            title="Download Summary Report"
            onClick={() => alert("Faculty Weekly Triage Report generated and downloaded as PDF.")}
            className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
