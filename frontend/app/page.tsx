"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ClockAlert,
  Mail,
  Inbox,
  SlidersHorizontal,
  Lock,
  Zap,
  Check,
  ChevronDown,
  Building2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useThreads } from "@/context/ThreadsContext";

export default function LandingPage() {
  const router = useRouter();
  const { setCurrentUser } = useThreads();

  const [hasSession, setHasSession] = useState(false);
  const [activeTab, setActiveTab] = useState<"urgent" | "briefing" | "noise">("urgent");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("faculty_session_token");
      const storedUser = localStorage.getItem("faculty_user");
      if (storedToken && storedUser) {
        setHasSession(true);
      }
    }
  }, []);

  const handleLaunchDemo = () => {
    // Instant demo login as Dr. Vance
    if (typeof window !== "undefined") {
      const demoUser = {
        id: "user-vance",
        name: "Dr. Eleanor Vance",
        email: "dr.vance@university.edu",
        department: "Department of Computer Science",
      };
      localStorage.setItem("faculty_session_token", "demo_session_token_dr_vance");
      localStorage.setItem("faculty_user", JSON.stringify(demoUser));
      setCurrentUser(demoUser);
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#e9edef] text-slate-900 font-sans antialiased selection:bg-black selection:text-white">
      {/* ── 1. Top Navigation Bar (Fixed / Frosted Glass) ── */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#e9edef]/80 border-b border-black/[0.06] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-black text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-950">
              MailMind
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-black transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-black transition-colors">
              How It Works
            </a>
            <a href="#metrics" className="hover:text-black transition-colors">
              Impact
            </a>
            <a href="#security" className="hover:text-black transition-colors">
              FERPA & Security
            </a>
            <a href="#faq" className="hover:text-black transition-colors">
              FAQ
            </a>
          </nav>

          {/* Auth Action CTAs */}
          <div className="flex items-center gap-3">
            {hasSession ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-xs"
              >
                <span>Open Inbox</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hidden sm:inline-flex text-xs font-bold text-slate-700 hover:text-black px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-xs"
                >
                  <span>Start Free</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. Hero Section ── */}
      <section className="pt-16 pb-14 sm:pt-20 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-black/[0.08] shadow-2xs text-[11px] font-bold text-slate-800">
          <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
          <span>Intelligent Email Triage for University Faculty</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12] max-w-4xl mx-auto">
          The academic inbox built for faculty who hate email.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          MailMind automatically separates urgent student grade appeals and grant deadlines from campus newsletters and routine committee memos—so you never miss what matters.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-black text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition-all shadow-sm group"
          >
            <span>Launch Free Faculty Inbox</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <button
            onClick={handleLaunchDemo}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-slate-900 border border-black/[0.08] hover:border-black text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-black" />
            <span>Explore Interactive Demo</span>
          </button>
        </div>

        {/* Micro-trust indicators */}
        <div className="pt-3 flex items-center justify-center gap-6 text-[11px] font-semibold text-slate-500 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-black" /> Zero IT setup required
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-black" /> Links with University Gmail
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-black" /> FERPA-ready data privacy
          </span>
        </div>
      </section>

      {/* ── 3. Interactive Product Demo Preview ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-20">
        <div className="bg-white rounded-[32px] border border-black/[0.06] shadow-md overflow-hidden">
          {/* Mock Window Top Bar */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-slate-300" />
              <span className="h-3 w-3 rounded-full bg-slate-300" />
              <span className="h-3 w-3 rounded-full bg-slate-300" />
              <span className="ml-3 text-xs font-bold text-slate-500">
                mailmind.university.edu/dashboard
              </span>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
              <button
                onClick={() => setActiveTab("urgent")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "urgent"
                    ? "bg-black text-white"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                Emergency Triage
              </button>
              <button
                onClick={() => setActiveTab("briefing")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "briefing"
                    ? "bg-black text-white"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                Executive Digest
              </button>
              <button
                onClick={() => setActiveTab("noise")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "noise"
                    ? "bg-black text-white"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                Noise Filtered
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="p-6 sm:p-8 space-y-4">
            {activeTab === "urgent" && (
              <div className="space-y-3.5">
                {/* Emergency banner */}
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                    <span className="font-bold">
                      2 time-sensitive student grade disputes require your attention today.
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-200 font-extrabold text-[10px]">
                    Critical Priority
                  </span>
                </div>

                {/* Simulated Emergency Card 1 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-red-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold">
                        CRITICAL
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        michael.chang@student.univ.edu
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-950">
                      URGENT: Request for Midterm Grade Re-evaluation (CS301)
                    </h3>
                    <p className="text-xs text-slate-500 italic">
                      AI Reasoning: Registrar graduation grade appeal deadline tomorrow at 5:00 PM.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleLaunchDemo}
                      className="px-3 py-1.5 rounded-full bg-black text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Resolve in 1-Click
                    </button>
                  </div>
                </div>

                {/* Simulated Emergency Card 2 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-extrabold">
                        HIGH PRIORITY
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        dept.chair@univ.edu
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-950">
                      NSF Cyber-Physical Systems Grant: Co-PI Signature Required
                    </h3>
                    <p className="text-xs text-slate-500 italic">
                      AI Reasoning: Sponsored research office deadline in 4 hours.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleLaunchDemo}
                      className="px-3 py-1.5 rounded-full bg-black text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Resolve in 1-Click
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "briefing" && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-black" />
                    <span className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
                      Automated Morning Faculty Digest · Gemini Live
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    Generated at 7:00 AM
                  </span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <p>
                    <strong>1. Immediate Grade Disputes:</strong> 2 students submitted formal re-evaluation requests for CS301. Academic registrar cutoff is today at 5:00 PM.
                  </p>
                  <p>
                    <strong>2. Research Approvals:</strong> Department Chair sent the final NSF budget revision awaiting your co-signature.
                  </p>
                  <p>
                    <strong>3. Routine Notices Filtered:</strong> 9 campus broadcasts and IT system maintenance bulletins safely deprioritized into background review.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "noise" && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span>
                    65% of your incoming email volume is deprioritized so you focus on student inquiries.
                  </span>
                  <span className="font-bold text-slate-900">
                    9 Bulletins Muted
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                  <span>Campus Library Spring Intersession Operating Hours</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                    Deprioritized
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                  <span>IT Services: Routine Campus Wi-Fi Firmware Upgrade Sunday</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                    Deprioritized
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. Key Metrics & Impact Numbers ── */}
      <section id="metrics" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-black/[0.06]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-2xs space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              12.4 hrs
            </div>
            <p className="text-xs font-semibold text-slate-800">
              Weekly Time Saved
            </p>
            <p className="text-[11px] text-slate-500 leading-snug">
              On manual inbox sorting and routine administrative replies.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-2xs space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              &lt; 3 mins
            </div>
            <p className="text-xs font-semibold text-slate-800">
              Emergency Response Time
            </p>
            <p className="text-[11px] text-slate-500 leading-snug">
              To review, assign, or acknowledge critical grade appeals.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-2xs space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              100%
            </div>
            <p className="text-xs font-semibold text-slate-800">
              Zero Missed Deadlines
            </p>
            <p className="text-[11px] text-slate-500 leading-snug">
              Automated safety net for ABET, grant, and registrar cutoffs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-2xs space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              65%
            </div>
            <p className="text-xs font-semibold text-slate-800">
              Noise Deprioritized
            </p>
            <p className="text-[11px] text-slate-500 leading-snug">
              Campus blasts and committee newsletters safely muted.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Core Feature Grid (Bento Style) ── */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-black/[0.06] space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            Engineered exclusively for academic workflows.
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Generic email clients treat all incoming messages identically. MailMind understands university hierarchies, academic calendars, and student dynamics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-7 rounded-3xl bg-white border border-black/[0.06] shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-950 tracking-tight">
                Urgency Intelligence Engine
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Trained to recognize time-critical academic language: grade re-evaluation requests, registrar cutoffs, and grant deadlines are routed to your emergency queue.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-7 rounded-3xl bg-white border border-black/[0.06] shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-950 tracking-tight">
                Executive Morning Briefing
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Start your lecture day with a 3-minute executive synthesis of pending inquiries, meetings, and upcoming deadlines delivered at 7:00 AM.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-7 rounded-3xl bg-white border border-black/[0.06] shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                <ClockAlert className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-950 tracking-tight">
                Unanswered Thread Safety Net
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automatically tracks conversations where a student or committee member is awaiting your reply past 48 hours, eliminating accidental omissions.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-7 rounded-3xl bg-white border border-black/[0.06] shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                <Inbox className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-950 tracking-tight">
                Live Gmail Synchronization
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect your institutional Google Workspace account in 1 click. MailMind synchronizes read states and triage tags without altering your original inbox folders.
              </p>
            </div>
          </div>

          {/* Card 5 */}
          <div className="p-7 rounded-3xl bg-white border border-black/[0.06] shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-950 tracking-tight">
                1-Click Queue Clearance
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Resolve and archive threads directly from the triage queue with a single keystroke or click, keeping your critical count at zero with zero friction.
              </p>
            </div>
          </div>

          {/* Card 6 */}
          <div className="p-7 rounded-3xl bg-white border border-black/[0.06] shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base text-slate-950 tracking-tight">
                Institutional Data Isolation
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Zero training on student records. Built for strict FERPA compliance and department data privacy standards with end-to-end credential encryption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. How It Works: 3 Steps ── */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-black/[0.06] space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            How MailMind Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Three simple steps to transform your academic communication workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-2xs space-y-2.5">
            <span className="text-xs font-bold text-slate-400">Step 01</span>
            <h3 className="text-base font-bold text-slate-950">
              Connect University Email
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Authenticate securely with university Google Workspace via OAuth. No desktop software or IT approval required.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-2xs space-y-2.5">
            <span className="text-xs font-bold text-slate-400">Step 02</span>
            <h3 className="text-base font-bold text-slate-950">
              Automated AI Classification
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Gemini extracts urgency, deadlines, and key student asks into 4 actionable priority tiers and mutes bulletin noise.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-2xs space-y-2.5">
            <span className="text-xs font-bold text-slate-400">Step 03</span>
            <h3 className="text-base font-bold text-slate-950">
              Act in 1-Click
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review your morning brief, resolve urgent queries with single-click clearance, and protect your research hours.
            </p>
          </div>
        </div>
      </section>

      {/* ── 7. FERPA & Security Section ── */}
      <section id="security" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-black/[0.06]">
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-black/[0.06] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-800">
              <Lock className="h-3 w-3" />
              Academic Privacy Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Built to meet university compliance and FERPA standards.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Student privacy is non-negotiable. MailMind never trains AI models on student correspondence, never sells academic telemetry, and enforces client-isolated encryption.
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700 font-semibold shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Zero model training on email records</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>AES-256 encrypted token vault</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Self-hosted or department deployment</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Complete data purge on request</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Frequently Asked Questions (FAQ) ── */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto border-t border-black/[0.06] space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Everything faculty ask about integrating MailMind with their academic accounts.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Does MailMind delete or alter my original Gmail emails?",
              a: "Never. MailMind operates non-destructively via Google OAuth APIs. Your original folders, labels, and sent items remain intact in your official university inbox.",
            },
            {
              q: "Can I use MailMind with my university credentials?",
              a: "Yes. Simply register with your university email or use the built-in Google OAuth sync to connect your official mailbox.",
            },
            {
              q: "How does the AI determine email urgency?",
              a: "MailMind evaluates explicit academic deadlines (e.g. registrar grade appeals, grant submission cutoffs), sender seniority (e.g. Dean, Department Chair), and unresolved student inquiries past 48 hours.",
            },
            {
              q: "Can I test the platform before connecting my real mailbox?",
              a: "Absolutely. Click 'Explore Interactive Demo' at the top to access the fully functional faculty dashboard with simulated academic threads.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-black/[0.06] shadow-2xs overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-slate-950 flex items-center justify-between gap-4 cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    openFaq === idx ? "rotate-180 text-black" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. Final Call to Action ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-black/[0.06] text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight max-w-2xl mx-auto">
          Reclaim your research and teaching hours today.
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Join faculty members across Computer Science and Engineering using MailMind to automate their inbox priority.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-black text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition-all shadow-sm"
          >
            <span>Get Started with MailMind Free</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            onClick={handleLaunchDemo}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-slate-900 border border-black/[0.08] hover:border-black text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
          >
            <span>Launch Instant Demo</span>
          </button>
        </div>
      </section>

      {/* ── 10. Clean Footer ── */}
      <footer className="w-full border-t border-black/[0.06] bg-white py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-black text-white flex items-center justify-center">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-sm text-slate-950 tracking-tight">
              MailMind
            </span>
            <span className="text-slate-400 ml-2">
              · Academic Email Intelligence Platform
            </span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/auth/login" className="hover:text-black transition-colors">
              Faculty Login
            </Link>
            <Link href="/auth/signup" className="hover:text-black transition-colors">
              Create Account
            </Link>
            <a href="#security" className="hover:text-black transition-colors">
              Privacy & FERPA
            </a>
            <a href="#faq" className="hover:text-black transition-colors">
              Documentation
            </a>
          </div>

          <div>
            <span>© {new Date().getFullYear()} MailMind Academic Portal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
