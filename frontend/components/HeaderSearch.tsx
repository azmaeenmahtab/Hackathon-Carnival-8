"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, Mail, Sparkles, ArrowRight, CornerDownLeft } from "lucide-react";
import { useThreads } from "@/context/ThreadsContext";
import { matchThreadSearch } from "@/lib/searchUtils";
import { Thread } from "@/types/threads";
import { getUrgencyStyles, getCategoryStyles } from "./ThreadRow";

export function HeaderSearch() {
  const {
    threads,
    searchQuery,
    setSearchQuery,
    selectThread,
    activeView,
    setActiveView,
  } = useThreads();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter threads matching search query
  const matchingThreads = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return threads.filter((t) => matchThreadSearch(t, searchQuery));
  }, [threads, searchQuery]);

  // Expand when search query is present
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsExpanded(true);
    }
  }, [searchQuery]);

  // Global shortcut: Ctrl+K or Cmd+K or "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in another input / textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        if (e.key === "Escape" && target === inputRef.current) {
          setShowDropdown(false);
          inputRef.current?.blur();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsExpanded(true);
        setShowDropdown(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsExpanded(true);
        setShowDropdown(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        if (!searchQuery.trim()) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchQuery]);

  const handleOpen = () => {
    setIsExpanded(true);
    setShowDropdown(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleClear = () => {
    setSearchQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleSelect = (thread: Thread) => {
    selectThread(thread);
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    // If not in dashboard or all, switch to dashboard to view results
    if (activeView !== "dashboard" && activeView !== "all") {
      setActiveView("dashboard");
    }
  };

  return (
    <div ref={containerRef} className="relative select-none">
      {/* Search Input / Button */}
      {!isExpanded && !searchQuery ? (
        <button
          onClick={handleOpen}
          title="Search mail or subject (Ctrl + K)"
          className="h-10 w-10 rounded-full bg-white border border-black/[0.06] shadow-2xs flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-all cursor-pointer group"
        >
          <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={`flex items-center bg-white border border-black/10 rounded-full px-3.5 py-1.5 shadow-sm transition-all duration-200 ${
            isExpanded
              ? "w-64 sm:w-80 md:w-96 ring-2 ring-black/5"
              : "w-64"
          }`}
        >
          <Search className="h-4 w-4 text-slate-400 shrink-0 mr-2" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
              if (
                e.target.value.trim() &&
                activeView !== "dashboard" &&
                activeView !== "all" &&
                activeView !== "priority"
              ) {
                setActiveView("dashboard");
              }
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search mail or subject line…"
            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
          />

          {searchQuery ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-slate-400 bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 rounded font-mono">
              <span>⌘</span>K
            </kbd>
          )}
        </form>
      )}

      {/* Floating Results Dropdown Popover */}
      {showDropdown && searchQuery.trim().length > 0 && (
        <div className="absolute right-0 top-12 w-[340px] sm:w-[420px] bg-white border border-black/10 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header summary */}
          <div className="px-4 py-2.5 bg-slate-50/80 border-b border-black/[0.05] flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600">
              {matchingThreads.length > 0
                ? `${matchingThreads.length} Thread${matchingThreads.length === 1 ? "" : "s"} Found`
                : "No matching threads"}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              for &quot;{searchQuery}&quot;
            </span>
          </div>

          {/* Results list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {matchingThreads.length > 0 ? (
              matchingThreads.slice(0, 5).map((thread) => {
                const effectiveCategory =
                  thread.correctedCategory ?? thread.category;
                const urgencyStyle = getUrgencyStyles(thread.urgency);
                const catStyle = getCategoryStyles(effectiveCategory);

                // Primary participant or email
                const senderDisplay =
                  thread.participants?.[0] ||
                  thread.messages?.[0]?.senderEmail ||
                  thread.messages?.[0]?.sender ||
                  "Inbound Email";

                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelect(thread)}
                    className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-start justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      {/* Sender Email / Name with Mail Icon */}
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-slate-600 truncate">
                        <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{senderDisplay}</span>
                      </div>

                      {/* Subject */}
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-black">
                        {thread.subject}
                      </h4>

                      {/* AI explanation snippet */}
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {thread.aiExplanation}
                      </p>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-col items-end gap-1 shrink-0 pt-0.5">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${urgencyStyle.badge}`}
                      >
                        {thread.urgency}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${catStyle.badge}`}
                      >
                        {effectiveCategory}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-slate-500">
                <Search className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  No matching mail found
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Try searching with student ID, sender email domain, or key topic words.
                </p>
              </div>
            )}
          </div>

          {/* Footer action */}
          {matchingThreads.length > 0 && (
            <div
              onClick={() => {
                setShowDropdown(false);
                if (activeView !== "dashboard" && activeView !== "all") {
                  setActiveView("dashboard");
                }
              }}
              className="px-4 py-2 bg-slate-50 border-t border-black/[0.05] flex items-center justify-between text-[11px] text-slate-600 font-semibold hover:bg-slate-100/80 cursor-pointer"
            >
              <span>View all {matchingThreads.length} threads in inbox canvas</span>
              <CornerDownLeft className="h-3 w-3 text-slate-400" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
