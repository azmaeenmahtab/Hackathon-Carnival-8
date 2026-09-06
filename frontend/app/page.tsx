"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { DailyDigestCard } from "@/components/DailyDigestCard";
import { PriorityStatStrip } from "@/components/PriorityStatStrip";
import { CategoryFilterTabs } from "@/components/CategoryFilterTabs";
import { ThreadList } from "@/components/ThreadList";
import { ThreadDetailDrawer } from "@/components/ThreadDetailDrawer";
import { NeedsFollowUpView } from "@/components/NeedsFollowUpView";
import { OtherPriorityView } from "@/components/OtherPriorityView";
import { useThreads } from "@/context/ThreadsContext";
import { RefreshCw, Bell, Search } from "lucide-react";

export default function Home() {
  const { activeView, isSyncing, syncWithBackend } = useThreads();

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 flex font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main App Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 h-16 border-b border-slate-200/80 bg-white/85 backdrop-blur-md px-6 flex items-center justify-between shrink-0 dark:border-slate-800 dark:bg-slate-900/80">
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 capitalize dark:text-slate-50">
              {activeView === "dashboard" && "Faculty Email Intelligence Dashboard"}
              {activeView === "all" && "All Synced Email Threads"}
              {activeView === "follow-up" && "Unanswered Threads Requiring Follow-Up"}
              {activeView === "other" && "Filtered Low-Priority & Non-Academic"}
            </h1>
            <p className="text-[11px] text-slate-600 font-medium dark:text-slate-400">
              University Faculty Triaged Inbox • Department of Computer Science
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={syncWithBackend}
              disabled={isSyncing}
              title="Refresh / Sync with backend"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Refresh Inbox"}</span>
            </button>
          </div>
        </header>

        {/* Scrollable View Container */}
        <div className="flex-1 p-6 space-y-5 max-w-6xl w-full mx-auto">
          {activeView === "dashboard" && (
            <>
              {/* AI Daily Digest Card */}
              <DailyDigestCard />

              {/* Priority Stat Strip */}
              <PriorityStatStrip />

              {/* Category Filter Pills */}
              <CategoryFilterTabs />

              {/* Thread List */}
              <ThreadList />
            </>
          )}

          {activeView === "all" && (
            <>
              <CategoryFilterTabs />
              <ThreadList />
            </>
          )}

          {activeView === "follow-up" && <NeedsFollowUpView />}

          {activeView === "other" && <OtherPriorityView />}
        </div>
      </main>

      {/* Slide-over Detail Drawer */}
      <ThreadDetailDrawer />
    </div>
  );
}
