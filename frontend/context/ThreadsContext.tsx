"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Thread, ThreadCategory, ActiveView, PriorityStats } from "@/types/threads";
import { INITIAL_MOCK_THREADS } from "@/data/mockThreads";
import { apiClient } from "@/lib/apiClient";
import { authClient } from "@/lib/auth-client";
import { ToastMessage, ToastContainer } from "@/components/Toast";

export interface FacultyUser {
  id: string;
  name: string;
  email: string;
  department?: string;
}

interface ThreadsContextType {
  threads: Thread[];
  selectedThread: Thread | null;
  activeView: ActiveView;
  selectedCategory: string;
  selectedUrgency: string;
  searchQuery: string;
  stats: PriorityStats;
  digest: string;
  digestGeneratedAt: string | null;
  isBackendConnected: boolean;
  isSyncing: boolean;
  currentUser: FacultyUser | null;
  setCurrentUser: (user: FacultyUser | null) => void;
  signOutUser: () => Promise<void>;
  setActiveView: (view: ActiveView) => void;
  setSelectedCategory: (cat: string) => void;
  setSelectedUrgency: (urgency: string) => void;
  setSearchQuery: (q: string) => void;
  selectThread: (thread: Thread | null) => void;
  markAsRead: (id: string, isRead: boolean) => Promise<void>;
  reclassifyThread: (id: string, newCategory: ThreadCategory) => Promise<void>;
  syncWithBackend: () => Promise<void>;
  refreshThreads: () => Promise<void>;
  addThread: (thread: Thread) => void;
  resolvedThreads: Thread[];
  resolvingIds: string[];
  resolveThread: (id: string, note?: string) => Promise<void>;
  restoreResolvedThread: (id: string) => Promise<void>;
  fetchResolvedThreads: () => Promise<void>;
  purgeDemoThreads: () => Promise<void>;
  clearAllThreads: () => Promise<void>;
  showToast: (
    title: string,
    description?: string,
    type?: "success" | "info" | "warning"
  ) => void;
}

const ThreadsContext = createContext<ThreadsContextType | undefined>(undefined);

export function ThreadsProvider({ children }: { children: React.ReactNode }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [digest, setDigest] = useState<string>(
    "Checking your inbox status…"
  );
  const [digestGeneratedAt, setDigestGeneratedAt] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<FacultyUser | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("faculty_user");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [resolvedThreads, setResolvedThreads] = useState<Thread[]>([]);
  const [resolvingIds, setResolvingIds] = useState<string[]>([]);

  const showToast = useCallback(
    (
      title: string,
      description?: string,
      type: "success" | "info" | "warning" = "info"
    ) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchResolvedThreads = useCallback(async () => {
    const res = await apiClient.getResolvedThreads();
    if (res && res.items) {
      setResolvedThreads(res.items);
    }
  }, []);

  // ── Refresh threads + digest from backend ──────────────────────────────────
  const refreshThreads = useCallback(async () => {
    const [threadsRes, digestRes, resolvedRes] = await Promise.all([
      apiClient.getThreads({ limit: 100, sort: "urgency" }),
      apiClient.getDigest(),
      apiClient.getResolvedThreads(),
    ]);

    if (threadsRes && Array.isArray(threadsRes.items)) {
      setThreads(threadsRes.items);
    }

    if (digestRes) {
      setDigest(digestRes.digestText);
      setDigestGeneratedAt(digestRes.generatedAt);
    }

    if (resolvedRes && resolvedRes.items) {
      setResolvedThreads(resolvedRes.items);
    }
  }, []);

  // ── Check backend health on mount ─────────────────────────────────────────
  useEffect(() => {
    async function checkBackend() {
      const healthy = await apiClient.checkHealth();
      setIsBackendConnected(healthy);
    }
    checkBackend();
  }, []);

  const signOutUser = async () => {
    try {
      await authClient.signOut();
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("faculty_session_token");
      localStorage.removeItem("faculty_user");
    }
    setCurrentUser(null);
    setThreads([]);
    setDigest("Sign in to load your AI-triaged inbox.");
    showToast("Signed Out", "You have been logged out of FacultyInbox AI.", "info");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  // ── Live stats computed from current thread list ───────────────────────────
  const stats: PriorityStats = useMemo(() => {
    let critical = 0;
    let high = 0;
    let needsFollowUp = 0;
    let unread = 0;

    for (const t of threads) {
      if (t.urgency === "Critical") critical++;
      if (t.urgency === "High") high++;
      if (!t.isRead) unread++;
      if (t.needsFollowUp) needsFollowUp++;
    }

    return {
      critical,
      high,
      needsFollowUp,
      unread,
      totalThreads: threads.length,
    };
  }, [threads]);

  const selectThread = (thread: Thread | null) => {
    setSelectedThread(thread);
  };

  const markAsRead = async (id: string, isRead: boolean) => {
    // Optimistic local update
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRead } : t))
    );
    if (selectedThread?.id === id) {
      setSelectedThread((prev) => (prev ? { ...prev, isRead } : null));
    }
    if (isBackendConnected) {
      await apiClient.markRead(id, isRead);
    }
  };

  const reclassifyThread = async (id: string, newCategory: ThreadCategory) => {
    const targetThread = threads.find((t) => t.id === id);
    const oldCategory =
      targetThread?.correctedCategory ?? targetThread?.category;

    // Optimistic local update
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            correctedCategory: newCategory,
            needsFollowUp: newCategory === "Other" ? false : t.needsFollowUp,
          };
        }
        return t;
      })
    );

    if (selectedThread?.id === id) {
      setSelectedThread((prev) =>
        prev
          ? {
              ...prev,
              correctedCategory: newCategory,
              needsFollowUp:
                newCategory === "Other" ? false : prev.needsFollowUp,
            }
          : null
      );
    }

    showToast(
      `Thread Reclassified`,
      `Changed from "${oldCategory}" → "${newCategory}"`,
      "success"
    );

    if (isBackendConnected) {
      await apiClient.reclassify(id, newCategory);
    }
  };

  // ── Full sync: trigger backend ingestion then refresh ─────────────────────
  const syncWithBackend = useCallback(async () => {
    setIsSyncing(true);
    try {
      const healthy = await apiClient.checkHealth();
      if (!healthy) {
        showToast(
          "Backend Unreachable",
          "Using local mock data — start the Express server to enable AI triage.",
          "warning"
        );
        setIsSyncing(false);
        return;
      }
      setIsBackendConnected(true);

      // Automatically purge any mock demo threads from MongoDB
      await apiClient.purgeDemoThreads();

      // Load all real threads + digest from backend
      await refreshThreads();
    } catch {
      showToast("Sync Notice", "Connected to inbox.", "info");
    } finally {
      setIsSyncing(false);
    }
  }, [refreshThreads, showToast]);

  const purgeDemoThreads = async () => {
    setIsSyncing(true);
    try {
      await apiClient.purgeDemoThreads();
      await refreshThreads();
      showToast("Demo Mails Cleared", "All demo emails have been removed from your inbox.", "success");
    } catch {
      showToast("Error", "Could not purge demo threads.", "warning");
    } finally {
      setIsSyncing(false);
    }
  };

  const clearAllThreads = async () => {
    const ok = confirm("Are you sure you want to clear all emails from your inbox?");
    if (!ok) return;
    setIsSyncing(true);
    try {
      await apiClient.clearAllThreads();
      setThreads([]);
      showToast("Inbox Cleared", "All threads removed from your inbox.", "info");
    } catch {
      showToast("Error", "Could not clear inbox.", "warning");
    } finally {
      setIsSyncing(false);
    }
  };

  const addThread = useCallback((thread: Thread) => {
    setThreads((prev) => [thread, ...prev.filter((t) => t.id !== thread.id)]);
  }, []);

  const resolveThread = async (id: string, note?: string) => {
    const target = threads.find((t) => t.id === id);
    if (!target) return;

    // Trigger smooth fade-out state first
    setResolvingIds((prev) => [...prev, id]);

    showToast(
      "Thread Resolved",
      `"${target.subject.substring(0, 35)}..." moved to resolved collection.`,
      "success"
    );

    // Wait 500ms for smooth exit animation to finish
    await new Promise((r) => setTimeout(r, 500));

    // Remove from active threads after animation
    setThreads((prev) => prev.filter((t) => t.id !== id));
    setResolvingIds((prev) => prev.filter((x) => x !== id));
    if (selectedThread?.id === id) {
      setSelectedThread(null);
    }

    const resolvedItem: Thread = {
      ...target,
      isRead: true,
      needsFollowUp: false,
      resolvedAt: new Date().toISOString(),
      resolutionNote: note || "Marked resolved by faculty",
    };

    setResolvedThreads((prev) => [resolvedItem, ...prev]);

    if (isBackendConnected) {
      await apiClient.resolveThread(id, note);
      await refreshThreads();
    }
  };

  const restoreResolvedThread = async (id: string) => {
    const target = resolvedThreads.find((t) => t.id === id);
    if (!target) return;

    // Optimistically remove from resolved
    setResolvedThreads((prev) => prev.filter((t) => t.id !== id));

    const restoredItem: Thread = {
      ...target,
      resolvedAt: undefined,
    };

    setThreads((prev) => [restoredItem, ...prev]);

    showToast(
      "Thread Restored",
      `Returned to active inbox queue.`,
      "info"
    );

    if (isBackendConnected) {
      await apiClient.restoreResolvedThread(id);
      await refreshThreads();
    }
  };

  return (
    <ThreadsContext.Provider
      value={{
        threads,
        selectedThread,
        activeView,
        selectedCategory,
        selectedUrgency,
        searchQuery,
        stats,
        digest,
        digestGeneratedAt,
        isBackendConnected,
        isSyncing,
        currentUser,
        setCurrentUser,
        signOutUser,
        setActiveView,
        setSelectedCategory,
        setSelectedUrgency,
        setSearchQuery,
        selectThread,
        markAsRead,
        reclassifyThread,
        syncWithBackend,
        refreshThreads,
        addThread,
        resolvedThreads,
        resolvingIds,
        resolveThread,
        restoreResolvedThread,
        fetchResolvedThreads,
        purgeDemoThreads,
        clearAllThreads,
        showToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ThreadsContext.Provider>
  );
}

export function useThreads() {
  const context = useContext(ThreadsContext);
  if (!context) {
    throw new Error("useThreads must be used within a ThreadsProvider");
  }
  return context;
}
