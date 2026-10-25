import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  SlidersHorizontal,
  FileText,
  Inbox,
  ArrowLeft,
} from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#e9edef] flex flex-col justify-between font-sans antialiased text-slate-900">
      {/* ── Top Navigation Bar ── */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-black text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-950 font-sans">
            MailMind
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </header>

      {/* ── Main Content Grid ── */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Service Demonstration (Clean White Cards) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                Intelligent Email Triage for Academic Faculty.
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                MailMind prioritizes incoming correspondence by urgency, automatically distinguishing time-sensitive student grade appeals and grant deadlines from routine university memos.
              </p>
            </div>

            {/* Clean Service Cards */}
            <div className="space-y-3.5">
              {/* Card 1: Priority Classification */}
              <div className="p-5 rounded-2xl bg-white border border-black/[0.06] shadow-2xs flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-slate-950 tracking-tight">
                    Urgency-Based Priority Triage
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Incoming messages are analyzed and classified into Critical, High, Normal, and Low queues, ensuring urgent registrar deadlines and grade disputes are addressed immediately.
                  </p>
                </div>
              </div>

              {/* Card 2: Executive Daily Briefing */}
              <div className="p-5 rounded-2xl bg-white border border-black/[0.06] shadow-2xs flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-slate-950 tracking-tight">
                    Automated Daily Briefing
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Synthesizes pending faculty queries, committee memos, and unreplied threads into a concise morning briefing delivered prior to lecture hours.
                  </p>
                </div>
              </div>

              {/* Card 3: Live Inbox Synchronization */}
              <div className="p-5 rounded-2xl bg-white border border-black/[0.06] shadow-2xs flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                  <Inbox className="h-5 w-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h2 className="text-sm font-bold text-slate-950 tracking-tight">
                    Direct Email Synchronization
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Connects with university Gmail or custom inbound triage to track response times and generate context-aware draft replies without altering original inboxes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Form Canvas */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="w-full max-w-md">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <span>© {new Date().getFullYear()} MailMind Academic Portal</span>
        <span>Department of Computer Science & Academic Affairs</span>
      </footer>
    </div>
  );
}
