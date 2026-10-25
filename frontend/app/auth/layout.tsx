import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Zap,
  ClockAlert,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0B0F17]">
      {/* ── Left Column: Academic Intelligence Showcase (Desktop Only) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0B0F17] via-[#111827] to-[#0D1526] p-12 flex-col justify-between border-r border-slate-800/80">
        {/* Ambient background glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-white text-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                MailMind
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-200 bg-white/10 border border-white/10 px-2 py-0.5 rounded-md">
                <Sparkles className="h-2.5 w-2.5 text-indigo-400" /> Academic AI
              </span>
            </div>
          </Link>
        </div>

        {/* Center Showcase Content */}
        <div className="relative z-10 max-w-lg space-y-8 my-auto py-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Zap className="h-3.5 w-3.5 text-indigo-400" />
              <span>Prioritize what matters. De-prioritize the noise.</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              AI Priority Triage for University Faculty.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Automatically categorize student disputes, grant deadlines, ABET accreditation memos, and office hours with Gemini-powered urgency intelligence.
            </p>
          </div>

          {/* Interactive Feature Preview Cards */}
          <div className="space-y-3">
            {/* Critical Alert Card Preview */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/30 backdrop-blur-md shadow-xl shadow-rose-950/20 flex items-start gap-3.5 transform hover:-translate-y-0.5 transition-all">
              <div className="h-9 w-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <ClockAlert className="h-5 w-5 text-rose-400" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-100 truncate">
                    Re-evaluation Request: CS301 Grade Appeal
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Critical
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">
                  AI Action Item: Student registrar appeal deadline tomorrow at 5:00 PM.
                </p>
              </div>
            </div>

            {/* Daily Digest Card Preview */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg flex items-start gap-3.5 transform hover:-translate-y-0.5 transition-all">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-100">
                    Automated Executive Morning Digest
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">
                  Daily briefing synthesized from live academic inbox and committee updates.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>FERPA-Ready Architecture</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-indigo-400" />
              <span>AES-256-GCM Encryption</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} MailMind Academic Portal</span>
          <span>Department of Computer Science & Academic Affairs</span>
        </div>
      </div>

      {/* ── Right Column: Form Canvas (Login / Signup) ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen">
        {/* Mobile Header Brand */}
        <div className="lg:hidden w-full max-w-md text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center shadow-md">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-sans">
              MailMind
            </span>
          </Link>
          <p className="text-xs text-slate-500 mt-1">
            Academic Email Intelligence & Priority Triage Portal
          </p>
        </div>

        {/* Active Auth Page Canvas */}
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
