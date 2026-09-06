"use client";

import React from "react";
import { Archive } from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import { ThreadCard } from "./ThreadRow";

export function OtherPriorityView() {
  const { threads } = useThreads();

  const otherThreads = threads.filter(
    (t) => (t.correctedCategory ?? t.category) === "Other"
  );

  const percent =
    threads.length > 0
      ? Math.round((otherThreads.length / threads.length) * 100)
      : 0;

  return (
    <div className="space-y-5 select-none">
      {/* Informative Card */}
      <div className="bg-white rounded-[32px] p-6 border border-black/[0.04] shadow-xs flex items-start gap-4">
        <div className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center shrink-0">
          <Archive className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-slate-950 tracking-tight">
              Filtered Noise & Campus Bulletins
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
              {otherThreads.length} items ({percent}% of inbox)
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            Campus-wide newsletters, library schedule bulletins, and external calls for papers are automatically triaged here so your primary focus remains on students and examinations.
          </p>
        </div>
      </div>

      {/* Grid of Other Threads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {otherThreads.map((thread) => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </div>
    </div>
  );
}
