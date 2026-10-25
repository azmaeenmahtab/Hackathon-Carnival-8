"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  Mail,
  RefreshCw,
  Unlink,
  Trash2,
  X,
} from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import { apiClient } from "@/lib/apiClient";
import { ActiveView } from "@/types/threads";

interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ onClose, isMobile }: SidebarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
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
    showToast,
    refreshThreads,
    purgeDemoThreads,
  } = useThreads();

  const [gmailStatus, setGmailStatus] = React.useState<{
    connected: boolean;
    connectedEmail?: string | null;
    lastSyncedAt?: string | null;
  } | null>(null);
  const [isConnectingGmail, setIsConnectingGmail] = React.useState(false);
  const [isSyncingGmail, setIsSyncingGmail] = React.useState(false);

  React.useEffect(() => {
    async function loadGmailStatus() {
      if (currentUser) {
        const status = await apiClient.getGmailStatus();
        if (status) {
          setGmailStatus(status);
        }
      }
    }
    loadGmailStatus();
  }, [currentUser]);

  const handleConnectGmail = async () => {
    setIsConnectingGmail(true);
    try {
      const url = await apiClient.getGoogleConnectUrl();
      if (url) {
        window.location.href = url;
      } else {
        showToast("Error", "Could not start Google OAuth. Check backend credentials.", "warning");
      }
    } catch {
      showToast("Error", "Could not connect to backend OAuth endpoint.", "warning");
    } finally {
      setIsConnectingGmail(false);
    }
  };

  const handleSyncGmail = async () => {
    setIsSyncingGmail(true);
    showToast("Syncing Live Gmail…", "Fetching recent inbox threads and running AI triage.", "info");
    try {
      const res = await apiClient.triggerGmailSync();
      if (res) {
        showToast("Gmail Sync Complete", `Ingested & classified ${res.ingested} live email threads!`, "success");
        await refreshThreads();
        const updatedStatus = await apiClient.getGmailStatus();
        if (updatedStatus) setGmailStatus(updatedStatus);
      } else {
        showToast("Sync Notice", "No new emails found or sync could not complete.", "warning");
      }
    } catch {
      showToast("Sync Failed", "An error occurred during Gmail sync.", "warning");
    } finally {
      setIsSyncingGmail(false);
    }
  };

  const handleDisconnectGmail = async () => {
    const ok = confirm("Disconnect linked Gmail account?");
    if (!ok) return;
    await apiClient.disconnectGmail();
    setGmailStatus({ connected: false });
    showToast("Gmail Disconnected", "Your Google account has been unlinked.", "info");
  };

  const getInitials = (name?: string) => {
    if (!name) return "EV";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleNav = () => {
    if (onClose) onClose();
  };

  const handleSignOut = async () => {
    if (onClose) onClose();
    await signOutUser();
    router.push("/auth/login");
  };

  const Container = isMobile ? "div" : "aside";
  const containerClasses = isMobile
    ? "w-full h-full bg-white rounded-[28px] p-5 shadow-xl border border-black/[0.06] flex flex-col justify-between overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] select-none"
    : "hidden lg:flex w-60 bg-white rounded-[32px] p-5 shadow-sm border border-black/[0.04] flex flex-col justify-between shrink-0 m-4 select-none sticky top-4 self-start h-[calc(100vh-2rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] z-30";

  return (
    <Container className={containerClasses}>
      <div>
        {/* Brand Logo & Mobile Close */}
        <div className="flex items-center justify-between mb-6 px-1">
          <Link
            href="/dashboard"
            onClick={handleNav}
            className="flex items-center gap-2.5 group"
          >
            <div className="h-8 w-8 rounded-xl bg-black text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-950 tracking-tight text-lg font-sans">
                MailMind
              </span>
            </div>
          </Link>

          {isMobile && (
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-black hover:bg-slate-50 transition-colors cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Main Navigation - Black Pill for Active Item */}
        <nav className="space-y-1">
          <Link
            href="/dashboard"
            onClick={handleNav}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
              pathname === "/dashboard"
                ? "bg-[#111113] text-white shadow-sm"
                : "text-slate-600 hover:text-black hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </div>
          </Link>

          <Link
            href="/dashboard/all"
            onClick={handleNav}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
              pathname === "/dashboard/all"
                ? "bg-[#111113] text-white shadow-sm"
                : "text-slate-600 hover:text-black hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckSquare className="h-4 w-4" />
              <span>All Threads</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                pathname === "/dashboard/all"
                  ? "bg-white/20 text-white"
                  : "bg-slate-150 text-slate-700"
              }`}
            >
              {stats.totalThreads}
            </span>
          </Link>

          <Link
            href="/dashboard/follow-up"
            onClick={handleNav}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
              pathname === "/dashboard/follow-up"
                ? "bg-[#111113] text-white shadow-sm"
                : "text-slate-600 hover:text-black hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <ClockAlert className="h-4 w-4" />
              <span>Follow-Up</span>
            </div>
            {stats.needsFollowUp > 0 && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  pathname === "/dashboard/follow-up"
                    ? "bg-white text-black"
                    : "bg-black text-white"
                }`}
              >
                {stats.needsFollowUp}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/priority/low"
            onClick={handleNav}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
              pathname === "/dashboard/priority/low"
                ? "bg-[#111113] text-white shadow-sm"
                : "text-slate-600 hover:text-black hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Archive className="h-4 w-4" />
              <span>Low Priority</span>
            </div>
          </Link>

          <Link
            href="/dashboard/resolved"
            onClick={handleNav}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
              pathname === "/dashboard/resolved"
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
                  pathname === "/dashboard/resolved"
                    ? "bg-emerald-500 text-white"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                }`}
              >
                {resolvedThreads.length}
              </span>
            )}
          </Link>
        </nav>

        {/* Priority Filter Section with Dedicated URL Pages */}
        <div className="mt-8 px-2 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
            <span>Priority Filter</span>
            {pathname.startsWith("/dashboard/priority") && (
              <Link
                href="/dashboard"
                onClick={handleNav}
                className="text-[10px] text-slate-500 hover:text-black font-semibold lowercase cursor-pointer"
              >
                dashboard
              </Link>
            )}
          </div>
          <div className="space-y-1">
            {/* Critical */}
            <Link
              href="/dashboard/priority/critical"
              onClick={handleNav}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                pathname === "/dashboard/priority/critical"
                  ? "bg-rose-50 text-rose-900 ring-1 ring-rose-300 font-bold"
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
            </Link>

            {/* High */}
            <Link
              href="/dashboard/priority/high"
              onClick={handleNav}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                pathname === "/dashboard/priority/high"
                  ? "bg-amber-50 text-amber-900 ring-1 ring-amber-300 font-bold"
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
            </Link>

            {/* Medium */}
            <Link
              href="/dashboard/priority/medium"
              onClick={handleNav}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                pathname === "/dashboard/priority/medium"
                  ? "bg-sky-50 text-sky-900 ring-1 ring-sky-300 font-bold"
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
            </Link>

            {/* Low */}
            <Link
              href="/dashboard/priority/low"
              onClick={handleNav}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                pathname === "/dashboard/priority/low"
                  ? "bg-slate-100 text-slate-900 ring-1 ring-slate-300 font-bold"
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
            </Link>
          </div>
        </div>

        {/* Live Gmail Integration Box */}
        <div className="mt-5 px-1">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-red-500" />
                <span className="text-[11px] font-bold text-slate-900 tracking-tight">Live Gmail</span>
              </div>
              {gmailStatus?.connected ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              ) : (
                <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                  Not Linked
                </span>
              )}
            </div>

            {gmailStatus?.connected ? (
              <div className="space-y-2">
                <p className="text-[10px] text-slate-600 truncate font-mono">
                  {gmailStatus.connectedEmail || "Connected"}
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleSyncGmail}
                    disabled={isSyncingGmail}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-[10px] font-bold transition-all disabled:opacity-60 cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className={`h-3 w-3 ${isSyncingGmail ? "animate-spin" : ""}`} />
                    <span>{isSyncingGmail ? "Syncing..." : "Sync Live Inbox"}</span>
                  </button>

                  <button
                    onClick={handleDisconnectGmail}
                    title="Disconnect Gmail"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Unlink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-[10px] text-slate-500 leading-tight">
                  Link your real Gmail to triage actual inbox threads with AI.
                </p>
                <button
                  onClick={handleConnectGmail}
                  disabled={isConnectingGmail}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold transition-all disabled:opacity-60 cursor-pointer shadow-xs"
                >
                  <Mail className="h-3 w-3" />
                  <span>{isConnectingGmail ? "Connecting…" : "Connect Gmail"}</span>
                </button>
              </div>
            )}

            {threads.some((t) => t.id.startsWith("th-mock-") || t.id.startsWith("th-0") || t.id.startsWith("mock-")) && (
              <button
                onClick={() => purgeDemoThreads()}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold transition-colors border border-rose-200/60 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                <span>Remove Demo Emails</span>
              </button>
            )}
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
              className="p-1.5 text-slate-400 hover:text-black rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Link
            href="/auth/login"
            onClick={handleNav}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-black hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Faculty Sign In</span>
          </Link>
        )}
      </div>
    </Container>
  );
}
