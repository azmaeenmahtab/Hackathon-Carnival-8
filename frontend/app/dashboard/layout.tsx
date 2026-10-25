"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ThreadDetailDrawer } from "@/components/ThreadDetailDrawer";
import { SimulateEmailModal } from "@/components/SimulateEmailModal";
import { HeaderSearch } from "@/components/HeaderSearch";
import { NotificationModal } from "@/components/NotificationModal";
import { useThreads } from "@/context/ThreadsContext";
import { authClient } from "@/lib/auth-client";
import { Bell, Plus, Menu, GraduationCap } from "lucide-react";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, stats, threads, setCurrentUser, syncWithBackend, showToast } =
    useThreads();
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const mobileBellRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ── Handle OAuth Redirect Parameters ──
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("gmail_connected") === "true") {
        showToast(
          "Gmail Connected",
          "Your real Gmail account is now linked. Click 'Sync Live Inbox' in the sidebar to triage live emails!",
          "success"
        );
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (params.get("gmail_error")) {
        showToast(
          "Gmail Connection Notice",
          decodeURIComponent(params.get("gmail_error") || "Could not complete Google OAuth connection."),
          "warning"
        );
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [showToast]);

  // Count new mails (last 6 h) for the badge dot
  const newMailCount = useMemo(() => {
    const cutoff = Date.now() - SIX_HOURS_MS;
    return threads.filter(
      (t) => new Date(t.lastMessageAt).getTime() > cutoff && !t.isRead
    ).length;
  }, [threads]);

  // ── Route guard: redirect to /auth/login if no active session ──
  useEffect(() => {
    async function checkSession() {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          if (!currentUser || currentUser.id === "user-vance") {
            setCurrentUser({
              id: session.data.user.id,
              name: session.data.user.name,
              email: session.data.user.email,
              department: "Department of Computer Science",
            });
          }
          if (typeof window !== "undefined") {
            localStorage.setItem("faculty_user", JSON.stringify(session.data.user));
          }
          setAuthChecked(true);
          return;
        }

        // Fallback: Check localStorage if cookie is partitioned/blocked across Vercel subdomains
        if (typeof window !== "undefined") {
          const storedToken = localStorage.getItem("faculty_session_token");
          const storedUserRaw = localStorage.getItem("faculty_user");
          if (storedToken && storedUserRaw) {
            try {
              const parsedUser = JSON.parse(storedUserRaw);
              if (parsedUser && parsedUser.id) {
                setCurrentUser({
                  id: parsedUser.id,
                  name: parsedUser.name || "Professor",
                  email: parsedUser.email || "",
                  department: parsedUser.department || "Department of Computer Science",
                });
                setAuthChecked(true);
                return;
              }
            } catch {
              // ignore json parse error
            }
          }
        }

        router.replace("/auth/login");
      } catch {
        // Fallback on network error: check localStorage
        if (typeof window !== "undefined") {
          const storedToken = localStorage.getItem("faculty_session_token");
          const storedUserRaw = localStorage.getItem("faculty_user");
          if (storedToken && storedUserRaw) {
            try {
              const parsedUser = JSON.parse(storedUserRaw);
              if (parsedUser && parsedUser.id) {
                setCurrentUser({
                  id: parsedUser.id,
                  name: parsedUser.name || "Professor",
                  email: parsedUser.email || "",
                  department: parsedUser.department || "Department of Computer Science",
                });
                setAuthChecked(true);
                return;
              }
            } catch {
              // ignore
            }
          }
        }
        router.replace("/auth/login");
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
            Verifying faculty session…
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
    <div className="h-screen max-h-screen w-full overflow-hidden flex font-sans antialiased text-slate-900 bg-[#e9edef] select-none">
      {/* Persistent Floating White Sidebar (Desktop Only: sticky & stationary) */}
      <Sidebar />

      {/* Main Content Area - Only this area scrolls */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
        {/* Mobile Top Navigation Bar (< lg) */}
        <div className="lg:hidden flex items-center justify-between pb-3 pt-1 shrink-0 border-b border-black/[0.06] mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="h-9 w-9 rounded-xl bg-white border border-black/[0.08] shadow-2xs flex items-center justify-center text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-950 font-sans">
                MailMind
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Inbound Mail trigger */}
            <button
              onClick={() => setIsSimulateOpen(true)}
              className="h-8 px-2.5 rounded-full bg-black text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span className="hidden sm:inline">Inbound</span>
            </button>

            {/* Notification Bell */}
            <div ref={mobileBellRef} className="relative">
              <button
                title="New Mail Notifications"
                onClick={() => setIsNotifOpen((v) => !v)}
                className={`h-8 w-8 rounded-full border shadow-2xs flex items-center justify-center transition-all cursor-pointer ${
                  isNotifOpen
                    ? "bg-black text-white border-black"
                    : "bg-white border-black/[0.08] text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Bell className="h-3.5 w-3.5" />
              </button>

              {/* Unread badge */}
              {newMailCount > 0 ? (
                <span className="absolute -top-1 -right-1 h-3.5 min-w-3.5 px-0.5 rounded-full bg-black text-white text-[8px] font-extrabold flex items-center justify-center ring-2 ring-[#e9edef]">
                  {newMailCount > 9 ? "9+" : newMailCount}
                </span>
              ) : stats.critical > 0 ? (
                <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-black ring-1 ring-white" />
              ) : null}

              {/* Mobile Notification popover */}
              <NotificationModal
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                anchorRef={mobileBellRef}
              />
            </div>

            {/* User Avatar */}
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-2xs">
              {initials}
            </div>
          </div>
        </div>

        {/* Mobile Greeting & Search Sub-bar (< lg) */}
        <div className="lg:hidden pb-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-950 font-sans">
              Hi, {firstName}!
            </h1>
            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[170px]">
              {currentUser?.email}
            </p>
          </div>
          <HeaderSearch />
        </div>

        {/* Desktop Top Header Bar (>= lg) */}
        <header className="hidden lg:flex items-center justify-between pb-6 pt-2 shrink-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 font-sans">
              Hi, {firstName}!
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {currentUser?.email}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Inbound Mail Simulator Trigger */}
            <button
              onClick={() => setIsSimulateOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Inbound Mail</span>
            </button>

            {/* Header Search with Mail and Subject matching */}
            <HeaderSearch />

            {/* Circular Notification Bell */}
            <div ref={bellRef} className="relative">
              <button
                title="New Mail Notifications"
                onClick={() => setIsNotifOpen((v) => !v)}
                className={`h-10 w-10 rounded-full border shadow-2xs flex items-center justify-center transition-all cursor-pointer ${
                  isNotifOpen
                    ? "bg-black text-white border-black"
                    : "bg-white border-black/[0.06] text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Bell className="h-4 w-4" />
              </button>

              {/* Unread badge — shows count if > 0, else critical dot */}
              {newMailCount > 0 ? (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-black text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-[#e9edef]">
                  {newMailCount > 9 ? "9+" : newMailCount}
                </span>
              ) : stats.critical > 0 ? (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-black ring-2 ring-white" />
              ) : null}

              {/* Desktop Notification popover */}
              <NotificationModal
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                anchorRef={bellRef}
              />
            </div>

            {/* User Avatar */}
            <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-2xs">
              {initials}
            </div>
          </div>
        </header>

        {/* Dynamic Route View */}
        <div className="flex-1 pb-10">
          {children}
        </div>
      </main>

      {/* Slide-over Detail Drawer */}
      <ThreadDetailDrawer />

      {/* Inbound Email Triage Simulator Modal */}
      <SimulateEmailModal
        isOpen={isSimulateOpen}
        onClose={() => setIsSimulateOpen(false)}
      />

      {/* Mobile Drawer Sheet (< lg) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex select-none">
          {/* Semi-transparent dark backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative w-72 sm:w-80 max-w-[85vw] h-full z-10 p-3 sm:p-4 flex flex-col animate-in slide-in-from-left duration-200">
            <Sidebar isMobile onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
