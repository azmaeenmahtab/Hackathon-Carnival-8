"use client";

import React from "react";
import { CategoryFilterTabs } from "@/components/CategoryFilterTabs";
import { ThreadList } from "@/components/ThreadList";
import { useThreads } from "@/context/ThreadsContext";
import { CheckSquare } from "lucide-react";

export default function AllThreadsPage() {
  const { stats } = useThreads();

  return (
    <div className="space-y-6 select-none">
      <div className="bg-white rounded-[28px] p-4 sm:p-6 shadow-2xs border border-black/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-extrabold text-slate-950 tracking-tight">
                All Triaged Threads
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800">
                {stats.totalThreads} Total
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Complete overview of incoming faculty correspondence across all urgency tiers and academic categories.
            </p>
          </div>
        </div>
      </div>

      <CategoryFilterTabs />
      <ThreadList />
    </div>
  );
}
