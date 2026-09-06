"use client";

import React, { useMemo, useEffect, useRef } from "react";
import {
  Bell,
  X,
  Mail,
  Clock,
  Zap,
  CheckCircle2,
  Inbox,
} from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import { getUrgencyStyles } from "./ThreadRow";

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

function formatTimeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

export function NotificationModal({ isOpen, onClose, anchorRef }: Props) {
  const { threads, selectThread, markAsRead } = useThreads();
  const modalRef = useRef<HTMLDivElement>(null);

  // Threads from the last 6 hours — newest first
  const newMails = useMemo(() => {
    const cutoff = Date.now() - SIX_HOURS_MS;
    return threads
      .filter((t) => new Date(t.lastMessageAt).getTime() > cutoff)
      .sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
      );
  }, [threads]);

  const unreadCount = newMails.filter((t) => !t.isRead).length;

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isOpen, onClose, anchorRef]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="absolute right-0 top-14 w-[340px] sm:w-[400px] bg-white border border-black/10 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200"
      style={{ maxHeight: "80vh" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-black flex items-center justify-center">
            <Bell className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-extrabold text-sm text-slate-950">
            New Mail
          </span>
          {newMails.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black text-white">
              {newMails.length}
            </span>
          )}
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {unreadCount} unread
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="h-7 w-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Sub-header label */}
      <div className="flex items-center gap-1.5 px-5 py-2 bg-slate-50/70 border-b border-slate-100">
        <Zap className="h-3 w-3 text-slate-400" />
        <span className="text-[11px] font-semibold text-slate-500">
          Last 6 hours
        </span>
      </div>

      {/* List */}
      <div className="overflow-y-auto" style={{ maxHeight: "calc(80vh - 100px)" }}>
        {newMails.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-14 text-center px-6">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Inbox className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">
              All caught up!
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              No new mail in the last 6 hours.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {newMails.map((thread) => {
              const urgStyle = getUrgencyStyles(thread.urgency);
              const senderDisplay =
                thread.participants?.[0] ||
                thread.messages?.[0]?.senderEmail ||
                thread.messages?.[0]?.sender ||
                "Inbound Mail";

              return (
                <div
                  key={thread.id}
                  onClick={() => {
                    selectThread(thread);
                    if (!thread.isRead) markAsRead(thread.id, true);
                    onClose();
                  }}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  {/* Unread indicator */}
                  <div className="mt-1 shrink-0">
                    {thread.isRead ? (
                      <CheckCircle2 className="h-4 w-4 text-slate-300" />
                    ) : (
                      <span className="block h-2.5 w-2.5 rounded-full bg-black mt-0.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Sender */}
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-600 truncate">
                        {senderDisplay}
                      </span>
                    </div>

                    {/* Subject */}
                    <h4
                      className={`text-xs leading-snug line-clamp-1 ${
                        thread.isRead
                          ? "font-medium text-slate-600"
                          : "font-extrabold text-slate-950"
                      }`}
                    >
                      {thread.subject}
                    </h4>

                    {/* Preview */}
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {thread.lastMessagePreview}
                    </p>
                  </div>

                  {/* Right: time + urgency badge */}
                  <div className="flex flex-col items-end gap-1 shrink-0 pt-0.5">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(thread.lastMessageAt)}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${urgStyle.badge}`}
                    >
                      {thread.urgency}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {newMails.length > 0 && (
        <div className="border-t border-slate-100 px-5 py-2.5 bg-slate-50/60 text-[11px] text-slate-400 font-medium text-center">
          Click a mail to open it · Bell shows last 6 h only
        </div>
      )}
    </div>
  );
}
