"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { DailyDigestCard } from "@/components/DailyDigestCard";
import { PriorityStatStrip } from "@/components/PriorityStatStrip";
import { CategoryFilterTabs } from "@/components/CategoryFilterTabs";
import { ThreadList } from "@/components/ThreadList";
import { ThreadDetailDrawer } from "@/components/ThreadDetailDrawer";
import { NeedsFollowUpView } from "@/components/NeedsFollowUpView";
import { OtherPriorityView } from "@/components/OtherPriorityView";
import { ResolvedThreadsView } from "@/components/ResolvedThreadsView";
import { SimulateEmailModal } from "@/components/SimulateEmailModal";
import { useThreads } from "@/context/ThreadsContext";
import { authClient } from "@/lib/auth-client";
import { Search, Bell, Plus } from "lucide-react";

export default function Home() {
  const { activeView, currentUser, stats, setCurrentUser, syncWithBackend } =
    useThreads();
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // ── Route guard: redirect to /login if no active session ──
  useEffect(() => {
    async function checkSession() {
      try {
        const session = await authClient.getSession();
        if (!session?.data?.user) {
          router.replace("/login");
          return;
        }
        // Sync user into context if not already set
        if (!currentUser || currentUser.id === "user-vance") {
          setCurrentUser({
            id: session.data.user.id,
            name: session.data.user.name,
            email: session.data.user.email,
            department: "Department of Computer Science",
          });
        }
        setAuthChecked(true);
      } catch {
        router.replace("/login");
      }
    }
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-sync: trigger backend sync after auth is confirmed ──
  useEffect(() => {
    if (authChecked) {
      syncWithBackend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked]);

  // Show loading state while auth is being verified
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e9edef]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-black border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500 tracking-wide">
            Verifying session…
          </p>
        </div>
      </div>
    );
  }

  // Extract first name
  const firstName = currentUser?.name
    ? currentUser.name.replace(/^Dr\.\s*/, "").split(" ")[0]
    : "Professor";

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .filter((w) => w.match(/^[A-Z]/))
        .slice(-2)
        .map((w) => w[0])
        .join("")
    : "FI";

  return (
    <div className="min-h-screen flex font-sans antialiased text-slate-900 bg-[#e9edef] select-none">
      {/* Floating White Sidebar */}
      <Sidebar />

      {/* Main Dashboard Canvas */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto pr-6 py-4">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between pb-6 pt-2 shrink-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 font-sans">
              Hi, {firstName}!
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {currentUser?.email}
            </p>
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

            {/* User Avatar */}
            <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-2xs">
              {initials}
            </div>
          </div>
        </header>

        {/* Dynamic Views Content */}
        <div className="space-y-6 flex-1 pb-10">
          {activeView === "dashboard" && (
            <>
              <DailyDigestCard />
              <PriorityStatStrip />
              <CategoryFilterTabs />
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
          {activeView === "resolved" && <ResolvedThreadsView />}
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
