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
  Lock,
  Check,
  ChevronDown,
  AlertTriangle,
  HeartHandshake,
  CalendarCheck,
  BellOff,
  UserCheck,
} from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";

export default function LandingPage() {
  const router = useRouter();
  const { setCurrentUser } = useThreads();

  const [hasSession, setHasSession] = useState(false);
  const [activeTab, setActiveTab] = useState<"urgent" | "summary" | "clean">("urgent");
  const [openFaq, setOpenFaq] = useState<number | null>(0); // First FAQ open by default for immediate clarity

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
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#e9edef]/85 border-b border-black/[0.06] transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-black text-white flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-105">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-950">
              MailMind
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#how-it-helps" className="hover:text-black transition-colors duration-200">
              Why Teachers Use It
            </a>
            <a href="#how-it-works" className="hover:text-black transition-colors duration-200">
              How It Works
            </a>
            <a href="#privacy" className="hover:text-black transition-colors duration-200">
              Privacy & Safety
            </a>
            <a href="#faq" className="hover:text-black transition-colors duration-200">
              Questions & Answers
            </a>
          </nav>

          {/* Auth Action CTAs */}
          <div className="flex items-center gap-3">
            {hasSession ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xs"
              >
                <span>Go to Inbox</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hidden sm:inline-flex text-xs font-bold text-slate-700 hover:text-black px-3 py-2 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xs"
                >
                  <span>Try It Free</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. Hero Section ── */}
      <section className="pt-16 pb-12 sm:pt-20 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
        {/* Subtle pill tag with gentle float */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-black/[0.08] shadow-2xs text-[11px] font-bold text-slate-800 animate-float-gentle">
          <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
          <span>Made for university professors, instructors, and teaching staff</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.14] max-w-3xl mx-auto animate-fade-in-up">
          Spend less time sorting emails. Spend more time teaching.
        </h1>

        {/* Subtitle - In Plain, Friendly Words */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          MailMind highlights urgent student questions and exam deadlines first, while putting campus newsletters and routine announcements quietly in the background.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-black text-white text-xs sm:text-sm font-bold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-sm group"
          >
            <span>Start Free with School Email</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <button
            onClick={handleLaunchDemo}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-slate-900 border border-black/[0.08] hover:border-black active:scale-[0.98] text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-black" />
            <span>See 1-Minute Live Demo</span>
          </button>
        </div>

        {/* Micro-trust indicators */}
        <div className="pt-2 flex items-center justify-center gap-6 text-[11px] font-semibold text-slate-500 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-black" /> Connects to University Gmail
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-black" /> No IT permissions needed
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-black" /> 100% private & secure
          </span>
        </div>
      </section>

      {/* ── 3. Interactive Product Demo Preview ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-16">
        <div className="bg-white rounded-[32px] border border-black/[0.06] shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
          {/* Mock Window Top Bar */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="ml-2 text-xs font-bold text-slate-500">
                Your Morning Teacher View
              </span>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("urgent")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === "urgent"
                    ? "bg-black text-white shadow-2xs"
                    : "text-slate-600 hover:text-black hover:bg-slate-50"
                }`}
              >
                1. Urgent Student Asks
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === "summary"
                    ? "bg-black text-white shadow-2xs"
                    : "text-slate-600 hover:text-black hover:bg-slate-50"
                }`}
              >
                2. Morning Summary
              </button>
              <button
                onClick={() => setActiveTab("clean")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === "clean"
                    ? "bg-black text-white shadow-2xs"
                    : "text-slate-600 hover:text-black hover:bg-slate-50"
                }`}
              >
                3. Filtered Noise
              </button>
            </div>
          </div>

          {/* Tab Content Display with Smooth Transitions */}
          <div className="p-6 sm:p-8 min-h-[260px] flex flex-col justify-center">
            {activeTab === "urgent" && (
              <div className="space-y-3.5 animate-fade-in-up">
                {/* Emergency banner */}
                <div className="p-3.5 px-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                    <span className="font-bold">
                      2 students need your help today before grade submission closes.
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-200 font-extrabold text-[10px] shrink-0">
                    Needs Action
                  </span>
                </div>

                {/* Simulated Student Email Card 1 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-red-200/80 shadow-2xs hover:border-black/20 hover:shadow-xs transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold">
                        CRITICAL
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        michael.c@student.edu
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-950">
                      Midterm Grade Question — Graduation Deadline Tomorrow
                    </h3>
                    <p className="text-xs text-slate-500">
                      Why this is top priority: Student is graduating this semester and registrar cutoff is tomorrow at 5 PM.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleLaunchDemo}
                      className="px-3.5 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Open in Demo →
                    </button>
                  </div>
                </div>

                {/* Simulated Student Email Card 2 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-200/80 shadow-2xs hover:border-black/20 hover:shadow-xs transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-extrabold">
                        HIGH PRIORITY
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        chair.smith@univ.edu
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-950">
                      Course Syllabus Confirmation for Next Semester
                    </h3>
                    <p className="text-xs text-slate-500">
                      Why this is high priority: Department chair requested confirmation before the 2 PM faculty meeting.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleLaunchDemo}
                      className="px-3.5 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-slate-800 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Open in Demo →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "summary" && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-black" />
                    <span className="text-xs font-extrabold uppercase tracking-wide text-slate-900">
                      Your 7:00 AM Daily Morning Briefing
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    Delivered automatically
                  </span>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <p>
                      <strong>2 Urgent Student Questions:</strong> Michael Chang asked about his midterm grade before graduation cutoff today.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <p>
                      <strong>Department Reminder:</strong> Course syllabus needs confirmation before your 2:00 PM department meeting.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <p className="text-slate-500">
                      <strong>Noise Filtered:</strong> 14 general campus bulletins and newsletter blasts were moved to background review.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "clean" && (
              <div className="space-y-3 animate-fade-in-up">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                  <span>
                    Over 60% of emails sent to faculty are campus broadcasts. We keep them out of your main inbox.
                  </span>
                  <span className="font-bold text-slate-950 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    14 Bulletins Filtered
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                  <span>Campus Library Schedule for Next Week</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                    Safe to Read Later
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                  <span>University Dining Hall Holiday Hours Notice</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                    Safe to Read Later
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. Key Things Teachers Care About (Numbers That Matter) ── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-black/[0.06]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              5+ Hours
            </div>
            <p className="text-xs font-bold text-slate-800">
              Saved Every Week
            </p>
            <p className="text-[11px] text-slate-500 leading-snug">
              Spend less time clicking through cluttered inbox messages.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              0 Missed
            </div>
            <p className="text-xs font-bold text-slate-800">
              Student Deadlines
            </p>
            <p className="text-[11px] text-slate-500 leading-snug">
              Time-sensitive requests are always spotted right away.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              65% Less
            </div>
            <p className="text-xs font-bold text-slate-800">
              Daily Inbox Clutter
            </p>
            <p className="text-[11px] text-slate-500 leading-snug">
              General campus blasts are neatly separated.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              10 Sec
            </div>
            <p className="text-xs font-bold text-slate-800">
              Setup Time
            </p>
            <p className="text-[11px] text-slate-500 leading-snug">
              Just log in with your university Google account.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. What Makes MailMind Helpful for Teachers (Clean Bento Grid) ── */}
      <section id="how-it-helps" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-black/[0.06] space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            Built for what teachers actually need.
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Generic email apps treat a campus survey the same as an urgent email from a struggling student. MailMind knows the difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-7 rounded-3xl bg-white border border-black/[0.06] shadow-2xs hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-950 tracking-tight">
              Emergency Student Flag
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Grade disputes, sick notes before an exam, and urgent advising requests are surfaced immediately at the top so you can help students in time.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-7 rounded-3xl bg-white border border-black/[0.06] shadow-2xs hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-950 tracking-tight">
              2-Minute Morning Briefing
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every morning at 7:00 AM, read a quick summary of what needs your reply today before you head to your first lecture or office hours.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-7 rounded-3xl bg-white border border-black/[0.06] shadow-2xs hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
              <ClockAlert className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-950 tracking-tight">
              Reminds You of Waiting Students
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              If a student or colleague asked a question over 2 days ago and you haven’t had a chance to reply, MailMind quietly reminds you so nothing slips through.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-7 rounded-3xl bg-white border border-black/[0.06] shadow-2xs hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
              <BellOff className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-950 tracking-tight">
              Quiet Campus Newsletters
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Campus dining updates, library hours, and routine IT notices are grouped together so your main inbox stays clear for real human conversations.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-7 rounded-3xl bg-white border border-black/[0.06] shadow-2xs hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-950 tracking-tight">
              Keep Your Existing Gmail
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You don’t have to change your email address. MailMind connects with your current university Gmail without changing your folders or deleting emails.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-7 rounded-3xl bg-white border border-black/[0.06] shadow-2xs hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-950 tracking-tight">
              1-Click Clean Inbox
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Once you finish reviewing an urgent inquiry or student grade issue, mark it done in one click to keep your mind and screen clean.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. How It Works: 3 Simple Steps ── */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-black/[0.06] space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            How Simple Is It to Use?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            No technical knowledge or complicated setup required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-2.5">
            <span className="text-xs font-bold text-slate-400">Step 1</span>
            <h3 className="text-base font-bold text-slate-950">
              Sign In with School Email
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Click connect with your university Google account. No IT department ticket or software installation needed.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-2.5">
            <span className="text-xs font-bold text-slate-400">Step 2</span>
            <h3 className="text-base font-bold text-slate-950">
              Emails Are Sorted for You
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              MailMind immediately sorts emails into Urgent, Important, and General announcements based on actual deadlines and needs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-black/[0.06] shadow-2xs hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-2.5">
            <span className="text-xs font-bold text-slate-400">Step 3</span>
            <h3 className="text-base font-bold text-slate-950">
              Reply & Clear in Minutes
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review your morning list, respond to critical student issues first, and enjoy a stress-free teaching day.
            </p>
          </div>
        </div>
      </section>

      {/* ── 7. Privacy & Safety: Written in Plain English ── */}
      <section id="privacy" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-black/[0.06]">
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-black/[0.06] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-800">
              <Lock className="h-3 w-3" />
              Teacher & Student Privacy First
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Your student emails stay completely private and protected.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We know student conversations and grades are confidential. MailMind follows strict university privacy rules (FERPA compliant) and never shares or trains on your correspondence.
            </p>
          </div>

          <div className="space-y-2.5 text-xs text-slate-700 font-semibold shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>We never sell or share your emails</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Zero AI training on your student records</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Your original Gmail inbox stays untouched</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Disconnect your email anytime with 1 click</span>
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
            Common questions university instructors ask about MailMind.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Will MailMind delete or change anything in my regular Gmail?",
              a: "No, never. MailMind reads your inbox to organize your priorities, but it never deletes or changes your original emails. You can still use normal Gmail anytime.",
            },
            {
              q: "Do I need permission from my university's IT department?",
              a: "No special permissions are required. You can simply sign in with your university Google account just like you do with other educational tools.",
            },
            {
              q: "How does MailMind know which student email is urgent?",
              a: "It checks for time-sensitive situations—such as a student asking for grade corrections before graduation, sick notes before an exam, or messages from your department head requiring a quick reply.",
            },
            {
              q: "Can I try it out before connecting my real school email?",
              a: "Yes! Click the 'See 1-Minute Live Demo' button above. It gives you instant access to a realistic professor inbox so you can see how it works first.",
            },
            {
              q: "Is it free to use for teachers?",
              a: "Yes, you can start using MailMind for free with your academic email address today.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-black/[0.06] shadow-2xs overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-slate-950 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
                    openFaq === idx ? "rotate-180 text-black" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fade-in-up">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. Final Call to Action ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-black/[0.06] text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight max-w-2xl mx-auto">
          Take control of your university inbox today.
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Join fellow professors and lecturers who spend 5 fewer hours sorting emails every week.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-black text-white text-xs sm:text-sm font-bold hover:bg-slate-800 active:scale-[0.98] transition-all shadow-sm"
          >
            <span>Start Free with School Email</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            onClick={handleLaunchDemo}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-slate-900 border border-black/[0.08] hover:border-black active:scale-[0.98] text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
          >
            <span>See 1-Minute Live Demo</span>
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
              · Built for University Teachers & Professors
            </span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/auth/login" className="hover:text-black transition-colors">
              Teacher Login
            </Link>
            <Link href="/auth/signup" className="hover:text-black transition-colors">
              Create Free Account
            </Link>
            <a href="#privacy" className="hover:text-black transition-colors">
              Privacy & Student Safety
            </a>
            <a href="#faq" className="hover:text-black transition-colors">
              FAQ
            </a>
          </div>

          <div>
            <span>© {new Date().getFullYear()} MailMind for University Faculty</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
