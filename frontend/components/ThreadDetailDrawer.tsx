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
} from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import {
  ThreadCategory,
  THREAD_CATEGORIES,
} from "@/types/threads";
import { formatDeadline } from "./ThreadRow";

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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in select-none">
      <div
        className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-black text-white shadow-2xs">
                {selectedThread.urgency} Urgency
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200/80">
                {effectiveCategory}
                {selectedThread.correctedCategory && (
                  <span className="text-[9px] text-slate-500 font-bold ml-1">
                    (Manual)
                  </span>
                )}
              </span>

              {selectedThread.deadline && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200/80">
                  <Calendar className="h-3 w-3 text-slate-500" />
                  {formatDeadline(selectedThread.deadline)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => markAsRead(selectedThread.id, !selectedThread.isRead)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-800 transition-colors"
              >
                {selectedThread.isRead ? (
                  <>
                    <Circle className="h-3.5 w-3.5 text-slate-400" />
                    Mark Unread
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 text-black" />
                    Mark Read
                  </>
                )}
              </button>

              <button
                onClick={() => selectThread(null)}
                className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-black hover:bg-slate-50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-slate-950 font-sans leading-tight">
            {selectedThread.subject}
          </h2>

          <div className="text-xs text-slate-400 font-medium">
            <span className="font-bold text-slate-600 mr-1">Participants:</span>
            {selectedThread.participants.join(", ")}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* AI Explanation Callout in Clean Card */}
          <div className="rounded-[24px] border border-black/[0.06] bg-slate-50 p-5 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Sparkles className="h-4 w-4 text-black" />
              AI Priority Reasoning
            </div>
            <p className="text-xs font-semibold text-slate-800 leading-relaxed italic">
              {selectedThread.aiExplanation}
            </p>
          </div>

          {/* Follow-Up Alert if pending */}
          {selectedThread.needsFollowUp && (
            <div className="rounded-[24px] border border-black/10 bg-[#121214] text-white p-4 flex items-start gap-3 shadow-xs">
              <ClockAlert className="h-5 w-5 text-white mt-0.5 shrink-0" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold block text-white mb-0.5">
                  Action Required:
                </span>
                <span className="text-slate-300">
                  {selectedThread.waitingReason ||
                    "This inquiry expects a faculty reply and has remained unanswered past the 48-hour threshold."}
                </span>
              </div>
            </div>
          )}

          {/* Category Override Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Category:</span>
              <span className="text-xs text-slate-600 font-semibold">
                {effectiveCategory}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsReclassifyOpen(!isReclassifyOpen)}
                className="flex items-center gap-1.5 text-xs font-bold py-1.5 px-3.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 shadow-2xs transition-colors"
              >
                <span>Reclassify</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {isReclassifyOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-30">
                  <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Category
                  </div>
                  {THREAD_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleReclassify(cat)}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-100 transition-colors ${
                        effectiveCategory === cat
                          ? "font-bold text-black bg-slate-50"
                          : "text-slate-700"
                      }`}
                    >
                      <span>{cat}</span>
                      {effectiveCategory === cat && (
                        <CheckCircle className="h-3.5 w-3.5 text-black" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message History */}
          <div className="space-y-3 pt-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Message History ({selectedThread.messages?.length || 1})
            </h4>

            <div className="space-y-3">
              {(selectedThread.messages || []).map((msg, index) => (
                <div
                  key={index}
                  className={`rounded-[24px] p-5 space-y-2 text-xs border ${
                    msg.isFaculty
                      ? "border-black/10 bg-[#18181b] text-white ml-6"
                      : "border-slate-200 bg-white text-slate-900 mr-6 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          msg.isFaculty
                            ? "bg-white text-black"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {msg.isFaculty ? (
                          <GraduationCap className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                      </div>
                      <span className="font-bold">
                        {msg.sender}
                      </span>
                    </div>

                    <span className={`text-[10px] ${msg.isFaculty ? "text-slate-400" : "text-slate-400"}`}>
                      {new Date(msg.sentAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className={`leading-relaxed whitespace-pre-wrap font-sans ${msg.isFaculty ? "text-slate-200" : "text-slate-700"}`}>
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
