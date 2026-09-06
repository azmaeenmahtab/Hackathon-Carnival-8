"use client";

import React, { useState } from "react";
import {
  X,
  MailPlus,
  Sparkles,
  Send,
  Zap,
} from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import { apiClient } from "@/lib/apiClient";
import { Thread } from "@/types/threads";

const PRESETS = [
  {
    label: "Grade Regrade Dispute",
    tag: "Critical",
    subject: "URGENT: Request for Midterm Grade Re-evaluation (CS301)",
    sender: "michael.chang@student.univ.edu",
    body: "Dear Dr. Vance,\n\nI believe problem 3b on my CS301 midterm was evaluated incorrectly against the rubric key. The deadline to lodge an official grade re-evaluation with the department is tomorrow at 5:00 PM.\n\nCould you please look over my solution? I have attached my scanned exam booklet.\n\nThank you,\nMichael Chang",
  },
  {
    label: "Emergency Chair Sync",
    tag: "High",
    subject: "Emergency ABET Accreditation Curriculum Meeting",
    sender: "prof.williams.chair@univ.edu",
    body: "Eleanor,\n\nThe ABET accreditation liaison requested updated learning assessment rubrics for CS202 and CS301 before Friday. Are you available for a 20-minute emergency sync today at 3:30 PM in the department conference room?\n\nBest,\nProf. Williams",
  },
  {
    label: "Student Disability Notice",
    tag: "Medium",
    subject: "DRC Testing Accommodation: Extra Time for Midterm 2",
    sender: "disability.services@univ.edu",
    body: "Notice to Faculty:\n\nStudent Maya Patel (ID #49921) is approved for 1.5x testing duration and a low-distraction environment for the upcoming examination in CS301. Please confirm exam paper delivery.\n\nDisability Resource Center",
  },
  {
    label: "Campus Bulletin",
    tag: "Low",
    subject: "University Library Fall Extended Hours & Research Workshops",
    sender: "library.announcements@univ.edu",
    body: "All faculty and students:\n\nThe main campus library will begin 24-hour reading room access starting next Monday. Also, research data management workshops will be held every Wednesday afternoon.\n\nUniversity Library Services",
  },
];

export function SimulateEmailModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState(PRESETS[0].subject);
  const [sender, setSender] = useState(PRESETS[0].sender);
  const [body, setBody] = useState(PRESETS[0].body);
  const [isProcessing, setIsProcessing] = useState(false);

  const { threads, selectThread, showToast, isBackendConnected } = useThreads();

  if (!isOpen) return null;

  const handleApplyPreset = (preset: (typeof PRESETS)[number]) => {
    setSubject(preset.subject);
    setSender(preset.sender);
    setBody(preset.body);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;

    setIsProcessing(true);

    try {
      let createdThread: Thread | null = null;

      if (isBackendConnected) {
        createdThread = await apiClient.simulateIncomingEmail({
          subject,
          sender,
          body,
          isFaculty: false,
        });
      }

      if (!createdThread) {
        const sub = subject.toLowerCase();
        let cat: any = "Other";
        let urgency: any = "Low";
        let aiExplanation = "Classified email thread based on subject and message content.";

        if (sub.includes("regrade") || sub.includes("re-eval") || sub.includes("grade")) {
          cat = "Re-evaluation";
          urgency = "Critical";
          aiExplanation = "Student requesting urgent grade re-evaluation before deadline.";
        } else if (sub.includes("meeting") || sub.includes("sync") || sub.includes("chair")) {
          cat = "Meeting";
          urgency = "High";
          aiExplanation = "Department administrative meeting request requiring confirmation.";
        } else if (sub.includes("disability") || sub.includes("student") || sub.includes("accommodation")) {
          cat = "Student Issue";
          urgency = "Medium";
          aiExplanation = "Official student academic testing accommodation notice.";
        }

        createdThread = {
          id: `th-sim-${Date.now()}`,
          subject,
          participants: [sender],
          lastMessagePreview: body.length > 100 ? `${body.substring(0, 100)}...` : body,
          lastMessageAt: new Date().toISOString(),
          messageCount: 1,
          messages: [
            {
              sender,
              senderEmail: sender,
              isFaculty: false,
              sentAt: new Date().toISOString(),
              body,
            },
          ],
          category: cat,
          correctedCategory: null,
          urgency,
          actionNeeded: true,
          deadline: null,
          aiExplanation,
          isRead: false,
          needsFollowUp: cat !== "Other",
          waitingHours: 0,
          waitingReason: "Unread — arrived in your priority queue.",
        };
      }

      threads.unshift(createdThread);

      showToast(
        "Email Triaged by AI",
        `Classified as "${createdThread.category}" (${createdThread.urgency})`,
        "success"
      );

      selectThread(createdThread);
      onClose();
    } catch (err: any) {
      showToast("Error", err.message || "Failed to triage email.", "warning");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in select-none">
      <div
        className="w-full max-w-xl bg-white rounded-[32px] shadow-2xl border border-black/[0.04] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950 tracking-tight">
                Simulate Inbound Email & Triage
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Live test categorization, urgency scoring, and AI reasoning.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-black hover:bg-slate-50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="p-6 pb-2 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Zap className="h-3 w-3 text-black" />
            Quick Scenarios
          </span>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-left p-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-black hover:text-white group transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate group-hover:text-white">
                    {p.label}
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 group-hover:bg-white/20 group-hover:text-white border border-slate-200/60">
                    {p.tag}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Inbound Form */}
        <form onSubmit={handleSendEmail} className="p-6 pt-2 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Subject Line
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 rounded-2xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sender Email
            </label>
            <input
              type="text"
              required
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              className="w-full px-4 py-2 rounded-2xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Message Content
            </label>
            <textarea
              rows={4}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black font-medium leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full text-white bg-black hover:bg-slate-800 shadow-sm transition-colors disabled:opacity-60"
            >
              {isProcessing ? (
                <span>Running AI Triage...</span>
              ) : (
                <>
                  <Send className="h-3 w-3" />
                  <span>Send & Run AI Triage</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
