"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  CheckCheck,
  BarChart2,
  FileText,
  ClockAlert,
  Archive,
  GraduationCap,
  Sparkles,
  Settings,
  Plus,
  LogOut,
  LogIn,
  Layers,
  Cpu,
} from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import { ActiveView } from "@/types/threads";

export function Sidebar() {
  const router = useRouter();
  const {
    activeView,
    setActiveView,
    stats,
    threads,
    resolvedThreads,
    selectedUrgency,
    setSelectedUrgency,
    currentUser,
    signOutUser,
  } = useThreads();

  const getInitials = (name?: string) => {
    if (!name) return "EV";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    await signOutUser();
    router.push("/login");
  };

  return (
    <aside className="w-60 bg-white rounded-[32px] p-5 shadow-sm border border-black/[0.04] flex flex-col justify-between shrink-0 m-4 select-none">
      <div>
        {/* Brand Logo - iDraft style */}
        <div className="flex items-center gap-2.5 px-2 py-3 mb-6">
          <div className="h-8 w-8 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-950 tracking-tight text-lg font-sans">
              MailMind
            </span>
          </div>
        </div>

        {/* Main Navigation - Black Pill for Active Item */}
        <nav className="space-y-1">
          <button
            onClick={() => setActiveView("dashboard")}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
              activeView === "dashboard"
                ? "bg-[#111113] text-white shadow-sm"
                : "text-slate-600 hover:text-black hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </div>
          </button>

          <button
            onClick={() => setActiveView("all")}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
              activeView === "all"
                ? "bg-[#111113] text-white shadow-sm"
                : "text-slate-600 hover:text-black hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckSquare className="h-4 w-4" />
              <span>All Threads</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeView === "all" ? "bg-white/20 text-white" : "bg-slate-150 text-slate-700"
            }`}>
              {stats.totalThreads}
            </span>
          </button>

          <button
            onClick={() => setActiveView("follow-up")}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
              activeView === "follow-up"
                ? "bg-[#111113] text-white shadow-sm"
                : "text-slate-600 hover:text-black hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <ClockAlert className="h-4 w-4" />
              <span>Follow-Up</span>
            </div>
            {stats.needsFollowUp > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeView === "follow-up" ? "bg-white text-black" : "bg-black text-white"
              }`}>
                {stats.needsFollowUp}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView("other")}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
              activeView === "other"
                ? "bg-[#111113] text-white shadow-sm"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Archive className="h-4 w-4" />
              <span>Low Priority</span>
            </div>
          </button>

          <button
            onClick={() => setActiveView("resolved")}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              activeView === "resolved"
                ? "bg-[#111113] text-white shadow-sm"
                : "text-slate-600 hover:text-black hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckCheck className="h-4 w-4 text-emerald-500" />
              <span>Resolved</span>
            </div>
            {resolvedThreads.length > 0 && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeView === "resolved"
                    ? "bg-emerald-500 text-white"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                }`}
              >
                {resolvedThreads.length}
              </span>
            )}
          </button>
        </nav>

        {/* Priority Filter Section with Faded Tones */}
        <div className="mt-8 px-2 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
            <span>Priority Filter</span>
            {selectedUrgency !== "All" && (
              <button
                onClick={() => setSelectedUrgency("All")}
                className="text-[10px] text-slate-500 hover:text-black font-semibold lowercase cursor-pointer"
              >
                clear
              </button>
            )}
          </div>
          <div className="space-y-1">
            {/* Critical */}
            <button
              onClick={() =>
                setSelectedUrgency(selectedUrgency === "Critical" ? "All" : "Critical")
              }
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedUrgency === "Critical"
                  ? "bg-rose-50 text-rose-900 ring-1 ring-rose-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-black"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 shadow-xs" />
                <span>Critical</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 font-bold">
                {stats.critical}
              </span>
            </button>

            {/* High */}
            <button
              onClick={() =>
                setSelectedUrgency(selectedUrgency === "High" ? "All" : "High")
              }
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedUrgency === "High"
                  ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-black"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>High Urgency</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 font-bold">
                {stats.high}
              </span>
            </button>

            {/* Medium */}
            <button
              onClick={() =>
                setSelectedUrgency(selectedUrgency === "Medium" ? "All" : "Medium")
              }
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedUrgency === "Medium"
                  ? "bg-sky-50 text-sky-900 ring-1 ring-sky-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-black"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <span>Medium</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-700 font-medium">
                {threads.filter((t) => t.urgency === "Medium").length}
              </span>
            </button>

            {/* Low */}
            <button
              onClick={() =>
                setSelectedUrgency(selectedUrgency === "Low" ? "All" : "Low")
              }
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedUrgency === "Low"
                  ? "bg-slate-100 text-slate-900 ring-1 ring-slate-300"
                  : "text-slate-500 hover:bg-slate-50 hover:text-black"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Low / Info</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                {threads.filter((t) => t.urgency === "Low").length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Profile / Settings */}
      <div className="pt-4 border-t border-slate-100 space-y-2 px-1">
        {currentUser ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {getInitials(currentUser.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentUser.department || "Faculty CS"}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-black rounded-lg transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-black hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Faculty Sign In</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
