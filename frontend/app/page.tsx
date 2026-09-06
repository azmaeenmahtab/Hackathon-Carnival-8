"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PriorityStatStrip } from "@/components/PriorityStatStrip";
import { CategoryFilterTabs } from "@/components/CategoryFilterTabs";
import { ThreadList } from "@/components/ThreadList";
import { ThreadDetailDrawer } from "@/components/ThreadDetailDrawer";
import { NeedsFollowUpView } from "@/components/NeedsFollowUpView";
import { OtherPriorityView } from "@/components/OtherPriorityView";
import { SimulateEmailModal } from "@/components/SimulateEmailModal";
import { useThreads } from "@/context/ThreadsContext";
import {
  Search,
  Bell,
  Plus,
} from "lucide-react";

export default function Home() {
  const { activeView, currentUser, stats } = useThreads();
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);

  // Extract first name for friendly greeting (matches "Hi, Dilan!" in reference)
  const firstName = currentUser?.name
    ? currentUser.name.replace(/^Dr\.\s*/, "").split(" ")[0]
    : "Eleanor";

  return (
    <div className="min-h-screen flex font-sans antialiased text-slate-900 bg-[#e9edef] select-none">
      {/* Floating White Sidebar */}
      <Sidebar />

      {/* Main Dashboard Canvas */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto pr-6 py-4">
        {/* Top Header Bar matching reference image ("Hi, Dilan!" + action pills) */}
        <header className="flex items-center justify-between pb-6 pt-2 shrink-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 font-sans">
              Hi, {firstName}!
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Black Action Pill: "+ Inbound Mail" */}
            <button
              onClick={() => setIsSimulateOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Inbound Mail</span>
            </button>

            {/* Circular Search Button */}
            <button
              title="Quick Search"
              className="h-10 w-10 rounded-full bg-white border border-black/[0.06] shadow-2xs flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Circular Notification Bell */}
            <div className="relative">
              <button
                title="Notifications"
                className="h-10 w-10 rounded-full bg-white border border-black/[0.06] shadow-2xs flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Bell className="h-4 w-4" />
              </button>
              {stats.critical > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-black ring-2 ring-white" />
              )}
            </div>

            {/* User Portrait Avatar */}
            <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-2xs">
              {firstName.slice(0, 1)}V
            </div>
          </div>
        </header>

        {/* Dynamic Views Content */}
        <div className="space-y-6 flex-1 pb-10">
          {activeView === "dashboard" && (
            <>
              {/* Top 3 Hero Cards (Overall Information, Weekly Progress, Month Progress) */}
              <PriorityStatStrip />

              {/* Category Filter Pills */}
              <CategoryFilterTabs />

              {/* Middle (Month goals + Task in process) and Bottom (Last Projects) */}
              <ThreadList onOpenSimulate={() => setIsSimulateOpen(true)} />
            </>
          )}

          {activeView === "all" && (
            <>
              <CategoryFilterTabs />
              <ThreadList onOpenSimulate={() => setIsSimulateOpen(true)} />
            </>
          )}

          {activeView === "follow-up" && <NeedsFollowUpView />}

          {activeView === "other" && <OtherPriorityView />}
        </div>
      </main>

      {/* Slide-over Detail Drawer */}
      <ThreadDetailDrawer />

      {/* Inbound Email Triage Simulator Modal */}
      <SimulateEmailModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
      />
    </div>
  );
}
