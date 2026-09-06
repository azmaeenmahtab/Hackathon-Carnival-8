"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  ClockAlert,
  Archive,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Server,
  ShieldCheck,
  LogOut,
  LogIn,
} from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import { ActiveView } from "@/types/threads";

export function Sidebar() {
  const router = useRouter();
  const {
    activeView,
    setActiveView,
    stats,
    isBackendConnected,
    isSyncing,
    syncWithBackend,
    currentUser,
    signOutUser,
  } = useThreads();

  const navItems: {
    view: ActiveView;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
    isDeEmphasized?: boolean;
  }[] = [
    {
      view: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      view: "all",
      label: "All Threads",
      icon: Inbox,
      badge: stats.totalThreads,
    },
    {
      view: "follow-up",
      label: "Needs Follow-Up",
      icon: ClockAlert,
      badge: stats.needsFollowUp,
      badgeColor: "bg-rose-500 text-white font-semibold",
    },
    {
      view: "other",
      label: "Other / Low Priority",
      icon: Archive,
      isDeEmphasized: true,
    },
  ];

  const getInitials = (name?: string) => {
    if (!name) return "FA";
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
    <aside className="w-64 border-r border-slate-200 bg-slate-50/80 flex flex-col justify-between shrink-0 dark:border-slate-800 dark:bg-slate-950/60 min-h-screen">
      {/* Top Brand Section */}
      <div>
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200 dark:shadow-none">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-900 tracking-tight text-base dark:text-slate-50">
                  FacultyInbox
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.5 rounded-md dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                  <Sparkles className="h-2.5 w-2.5" /> AI
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium dark:text-slate-400">
                Academic Triage System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.view;

            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-950 shadow-sm border border-indigo-200/70 dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-900/60"
                    : item.isDeEmphasized
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/40"
                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : item.isDeEmphasized
                        ? "text-slate-400 dark:text-slate-600"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  />
                  <span className={item.isDeEmphasized ? "opacity-90" : ""}>
                    {item.label}
                  </span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      item.badgeColor
                        ? item.badgeColor
                        : "bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Sync & Faculty User Card */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
        {/* Backend status & sync button */}
        <div className="rounded-lg bg-white p-3 border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-600 font-medium flex items-center gap-1.5 dark:text-slate-400">
              <Server className="h-3.5 w-3.5" />
              API Connection
            </span>
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                isBackendConnected
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isBackendConnected ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {isBackendConnected ? "Live API" : "Mock Mode"}
            </span>
          </div>

          <button
            onClick={syncWithBackend}
            disabled={isSyncing}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 px-2.5 rounded bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors disabled:opacity-60 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200"
          >
            <RefreshCw
              className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Sync Backend (Phase 1)"}
          </button>
        </div>

        {/* Faculty User Badge or Login Link */}
        {currentUser ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/70 border border-slate-200/70 dark:bg-slate-900/60 dark:border-slate-800/60">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="h-9 w-9 rounded-full bg-linear-to-tr from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-xs">
                {getInitials(currentUser.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold text-slate-900 truncate dark:text-slate-100">
                    {currentUser.name}
                  </p>
                  <ShieldCheck className="h-3 w-3 text-indigo-600 shrink-0 dark:text-indigo-400" />
                </div>
                <p className="text-[10px] text-slate-500 truncate dark:text-slate-400">
                  {currentUser.department || currentUser.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors dark:hover:bg-rose-950/40"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Faculty Sign In</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
