"use client";

import React from "react";
import { Sparkles, Clock, ShieldAlert, RefreshCw, Zap } from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";

export function DailyDigestCard() {
  const { digest, digestGeneratedAt, stats, isBackendConnected, isSyncing, syncWithBackend } =
    useThreads();

  const formattedTime = digestGeneratedAt
    ? new Date(digestGeneratedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm transition-all">
      {/* Subtle decorative gradient blob */}
      <div className="absolute top-0 right-0 -mt-6 -mr-6 h-28 w-28 rounded-full bg-slate-100 blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2.5 flex-1 max-w-4xl">
          {/* Header row */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
              <Sparkles className="h-3 w-3" />
              AI Priority Digest
            </span>

            {isBackendConnected ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <Zap className="h-3 w-3" />
                Gemini Flash
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-400">
                Local mode
              </span>
            )}

            {formattedTime && (
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Generated at {formattedTime}
              </span>
            )}
          </div>

          {/* Digest text */}
          <p className="text-sm leading-relaxed text-slate-800 font-normal">
            {isSyncing ? (
              <span className="flex items-center gap-2 text-slate-500">
                <span className="h-3 w-3 rounded-full border border-slate-400 border-t-transparent animate-spin inline-block" />
                Generating AI digest…
              </span>
            ) : (
              digest
            )}
          </p>

          {/* Stats footer */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-xs text-slate-500">
            {stats.critical > 0 && (
              <span className="inline-flex items-center gap-1 font-semibold text-red-600">
                <ShieldAlert className="h-3.5 w-3.5" />
                {stats.critical} Critical
              </span>
            )}
            {stats.high > 0 && (
              <span className="font-medium text-orange-600">
                {stats.high} High
              </span>
            )}
            {stats.needsFollowUp > 0 && (
              <span>{stats.needsFollowUp} awaiting reply</span>
            )}
            {stats.unread > 0 && (
              <span>{stats.unread} unread</span>
            )}
          </div>
        </div>

        {/* Re-sync button */}
        <button
          onClick={syncWithBackend}
          disabled={isSyncing}
          title="Refresh inbox from backend"
          className="shrink-0 h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-black hover:text-white hover:border-black transition-all disabled:opacity-40"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
}
