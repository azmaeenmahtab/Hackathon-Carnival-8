"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
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
  showToast: (title: string, description?: string, type?: "success" | "info" | "warning") => void;
}

const ThreadsContext = createContext<ThreadsContextType | undefined>(undefined);

export function ThreadsProvider({ children }: { children: React.ReactNode }) {
  const [threads, setThreads] = useState<Thread[]>(INITIAL_MOCK_THREADS);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Default teacher user (Dr. Eleanor Vance) or currently authenticated user
  const [currentUser, setCurrentUser] = useState<FacultyUser | null>({
    id: "user-vance",
    name: "Dr. Eleanor Vance",
    email: "dr.vance@university.edu",
    department: "Department of Computer Science",
  });

  // Default synthetic digest
  const [digest, setDigest] = useState<string>(
    "You have 2 critical items: a grade re-evaluation request due tomorrow, and an unanswered department meeting invite from 3 days ago. Your final exam submission and TA timesheet approvals also require attention this week."
  );

  const showToast = (
    title: string,
    description?: string,
    type: "success" | "info" | "warning" = "info"
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check backend health & existing session on mount
  useEffect(() => {
    async function checkBackendAndAuth() {
      try {
        const healthy = await apiClient.checkHealth();
        setIsBackendConnected(healthy);

        if (healthy) {
          const backendDigest = await apiClient.getDigest();
          if (backendDigest) setDigest(backendDigest);

          // Check if session exists in Better Auth
          const session = await authClient.getSession();
          if (session?.data?.user) {
            setCurrentUser({
              id: session.data.user.id,
              name: session.data.user.name,
              email: session.data.user.email,
              department: "Department of Computer Science",
            });
          }
        }
      } catch {
        // Fallback to local mode
      }
    }
    checkBackendAndAuth();
  }, []);

  const signOutUser = async () => {
    try {
      await authClient.signOut();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    showToast("Signed Out", "You have been logged out of FacultyInbox AI.", "info");
  };

  // Compute live stats based on effective category & urgency
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
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRead } : t))
    );
    if (selectedThread && selectedThread.id === id) {
      setSelectedThread((prev) => (prev ? { ...prev, isRead } : null));
    }
    if (isBackendConnected) {
      await apiClient.markRead(id, isRead);
    }
  };

  const reclassifyThread = async (id: string, newCategory: ThreadCategory) => {
    const targetThread = threads.find((t) => t.id === id);
    const oldCategory = targetThread?.correctedCategory ?? targetThread?.category;

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isOther = newCategory === "Other";
          return {
            ...t,
            correctedCategory: newCategory,
            needsFollowUp: isOther ? false : t.needsFollowUp,
          };
        }
        return t;
      })
    );

    if (selectedThread && selectedThread.id === id) {
      setSelectedThread((prev) =>
        prev
          ? {
              ...prev,
              correctedCategory: newCategory,
              needsFollowUp: newCategory === "Other" ? false : prev.needsFollowUp,
            }
          : null
      );
    }

    showToast(
      `Thread Reclassified`,
      `Changed from "${oldCategory}" to "${newCategory}".`,
      "success"
    );

    if (isBackendConnected) {
      await apiClient.reclassify(id, newCategory);
    }
  };

  const syncWithBackend = async () => {
    setIsSyncing(true);
    showToast("Connecting to Express Backend...", "Triggering mock sync endpoint.", "info");
    const syncRes = await apiClient.triggerMockSync();
    if (syncRes) {
      showToast(
        "Sync Completed",
        `Successfully ingested ${syncRes.ingested} threads from backend.`,
        "success"
      );
      const res = await apiClient.getThreads({ limit: 50 });
      if (res && res.items.length > 0) {
        setThreads(res.items);
      }
      const newDigest = await apiClient.getDigest();
      if (newDigest) setDigest(newDigest);
      setIsBackendConnected(true);
    } else {
      showToast(
        "Backend Unreachable",
        "Operating seamlessly with local mock data.",
        "warning"
      );
    }
    setIsSyncing(false);
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
