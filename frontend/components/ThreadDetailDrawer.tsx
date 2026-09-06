"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  ClockAlert,
  Calendar,
  CheckCircle,
  Circle,
  Tag,
  ChevronDown,
  User,
  GraduationCap,
  Scale,
  FileCheck2,
  AlertCircle,
  Users,
  CalendarDays,
  Building2,
  FolderMinus,
} from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import {
  ThreadCategory,
  THREAD_CATEGORIES,
} from "@/types/threads";
import {
  getUrgencyBadge,
  formatDeadline,
} from "./ThreadRow";

export function ThreadDetailDrawer() {
  const {
    selectedThread,
    selectThread,
    markAsRead,
    reclassifyThread,
  } = useThreads();

  const [isReclassifyOpen, setIsReclassifyOpen] = useState(false);

  if (!selectedThread) return null;

  const effectiveCategory =
    selectedThread.correctedCategory ?? selectedThread.category;

  const handleReclassify = (newCat: ThreadCategory) => {
    reclassifyThread(selectedThread.id, newCat);
    setIsReclassifyOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getUrgencyBadge(
                  selectedThread.urgency
                )}`}
              >
                {selectedThread.urgency} Urgency
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                {effectiveCategory}
                {selectedThread.correctedCategory && (
                  <span className="text-[10px] text-indigo-600 font-bold dark:text-indigo-400">
                    (Manual Override)
                  </span>
                )}
              </span>

              {selectedThread.deadline && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDeadline(selectedThread.deadline)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mark Read Toggle */}
              <button
                onClick={() => markAsRead(selectedThread.id, !selectedThread.isRead)}
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                {selectedThread.isRead ? (
                  <>
                    <Circle className="h-3.5 w-3.5" />
                    Mark Unread
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    Mark Read
                  </>
                )}
              </button>

              {/* Close Drawer Button */}
              <button
                onClick={() => selectThread(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {selectedThread.subject}
          </h2>

          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Participants:
            </span>
            {selectedThread.participants.join(", ")}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* AI Explanation Callout */}
          <div className="rounded-xl border border-indigo-200/90 bg-indigo-50/60 p-4 space-y-1.5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 dark:text-indigo-300">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              AI Priority Reasoning
            </div>
            <p className="text-sm font-medium text-indigo-950 leading-relaxed dark:text-indigo-100">
              {selectedThread.aiExplanation}
            </p>
          </div>

          {/* Needs Follow-Up Banner */}
          {selectedThread.needsFollowUp && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 flex items-start gap-3 dark:border-rose-900 dark:bg-rose-950/40">
              <ClockAlert className="h-5 w-5 text-rose-600 mt-0.5 shrink-0 dark:text-rose-400" />
              <div className="text-xs text-rose-900 dark:text-rose-200">
                <span className="font-bold">Follow-Up Required:</span>{" "}
                {selectedThread.waitingReason ||
                  "This thread appears to expect a faculty response and has remained unanswered past the response threshold."}
              </div>
            </div>
          )}

          {/* Action Bar: Reclassify Category */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/70 dark:bg-slate-800/50 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Category:
              </span>
              <span className="text-xs text-slate-600 font-medium dark:text-slate-400">
                {effectiveCategory}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsReclassifyOpen(!isReclassifyOpen)}
                className="flex items-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 shadow-2xs dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                <span>Reclassify</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {isReclassifyOpen && (
                <div className="absolute right-0 mt-1 w-52 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-30 dark:bg-slate-800 dark:border-slate-700">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Correct Category
                  </div>
                  {THREAD_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleReclassify(cat)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-indigo-50 hover:text-indigo-900 transition-colors dark:hover:bg-slate-700 ${
                        effectiveCategory === cat
                          ? "font-bold text-indigo-600 dark:text-indigo-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span>{cat}</span>
                      {effectiveCategory === cat && (
                        <CheckCircle className="h-3.5 w-3.5" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message History Chronology */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Message History ({selectedThread.messages?.length || 1})
            </h4>

            <div className="space-y-3">
              {(selectedThread.messages || []).map((msg, index) => (
                <div
                  key={index}
                  className={`rounded-xl border p-4 space-y-2 text-xs transition-all ${
                    msg.isFaculty
                      ? "border-indigo-200 bg-indigo-50/40 ml-4 dark:border-indigo-900 dark:bg-indigo-950/20"
                      : "border-slate-200 bg-white mr-4 dark:border-slate-800 dark:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          msg.isFaculty
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {msg.isFaculty ? (
                          <GraduationCap className="h-3.5 w-3.5" />
                        ) : (
                          <User className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {msg.sender}
                        </span>
                        {msg.isFaculty && (
                          <span className="ml-1.5 text-[10px] font-bold text-indigo-600 uppercase tracking-wider dark:text-indigo-400">
                            (Faculty)
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {new Date(msg.sentAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-slate-800 leading-relaxed dark:text-slate-200 whitespace-pre-wrap">
                    {msg.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
