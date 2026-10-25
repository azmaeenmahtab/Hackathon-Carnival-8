"use client";

import React from "react";
import { Sparkles, Clock, RefreshCw, Zap } from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";

export function DailyDigestCard() {
  const { digest, digestGeneratedAt, isBackendConnected, isSyncing, syncWithBackend } =
    useThreads();

  const formattedTime = digestGeneratedAt
    ? new Date(digestGeneratedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-2xs transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1 ">
          {/* Header row */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
              <Sparkles className="h-3 w-3" />
              Executive AI Briefing
            </span>

            {isBackendConnected ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <Zap className="h-3 w-3 text-emerald-600" />
                Gemini Live Triage
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-400">
                Local Mode
              </span>
            )}

            {formattedTime && (
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Updated at {formattedTime}
              </span>
            )}
          </div>

          {/* Digest text */}
          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 font-normal">
            {isSyncing ? (
              <span className="flex items-center gap-2 text-slate-500">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-400 border-t-transparent animate-spin inline-block" />
                Synthesizing academic priority briefing…
              </span>
            ) : (
              digest
            )}
          </p>
        </div>

        {/* Re-sync button */}
        <button
          onClick={syncWithBackend}
          disabled={isSyncing}
          title="Refresh AI briefing from backend"
          className="shrink-0 h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-black hover:text-white hover:border-black transition-all disabled:opacity-40 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
}
