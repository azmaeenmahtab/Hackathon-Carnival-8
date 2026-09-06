import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { MOCK_THREADS } from "@/lib/mock-threads";
import {
  effectiveCategory,
  sortByPriority,
  type Category,
  type Thread,
} from "@/lib/types";

/**
 * Single data-access layer. Today it resolves mock data after a short delay;
 * later this is the only place that needs to call the real triage API.
 */
export async function fetchThreads(): Promise<Thread[]> {
  await new Promise((resolve) => setTimeout(resolve, 650));
  return MOCK_THREADS;
}

interface InboxState {
  threads: Thread[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
  getThread: (id: string) => Thread | undefined;
  setRead: (id: string, isRead: boolean) => void;
  reclassify: (id: string, category: Category) => void;
  stats: {
    critical: number;
    high: number;
    followUp: number;
    unread: number;
    filteredOther: number;
  };
  byCategory: (category: Category | "All") => Thread[];
}

const InboxContext = createContext<InboxState | null>(null);

export function InboxProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    fetchThreads()
      .then((data) => {
        if (!active) return;
        setThreads(data);
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError("We couldn't load your inbox.");
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const setRead = useCallback((id: string, isRead: boolean) => {
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, isRead } : t)));
  }, []);

  const reclassify = useCallback((id: string, category: Category) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, correctedCategory: category } : t)),
    );
  }, []);

  const value = useMemo<InboxState>(() => {
    const visible = threads.filter((t) => effectiveCategory(t) !== "Other");
    return {
      threads,
      isLoading,
      error,
      reload,
      getThread: (id) => threads.find((t) => t.id === id),
      setRead,
      reclassify,
      stats: {
        critical: visible.filter((t) => t.urgency === "Critical").length,
        high: visible.filter((t) => t.urgency === "High").length,
        followUp: threads.filter((t) => t.needsFollowUp).length,
        unread: visible.filter((t) => !t.isRead).length,
        filteredOther: threads.filter((t) => effectiveCategory(t) === "Other").length,
      },
      byCategory: (category) =>
        sortByPriority(
          category === "All"
            ? threads.filter((t) => effectiveCategory(t) !== "Other")
            : threads.filter((t) => effectiveCategory(t) === category),
        ),
    };
  }, [threads, isLoading, error, reload, setRead, reclassify]);

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

export function useInbox(): InboxState {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error("useInbox must be used inside <InboxProvider>");
  return ctx;
}

/** Plain-English digest of the current priorities (stands in for an LLM call). */
export function useDailyDigest(): string[] {
  const { threads } = useInbox();
  return useMemo(() => {
    const active = sortByPriority(threads.filter((t) => effectiveCategory(t) !== "Other"));
    if (active.length === 0) return [];
    const critical = active.filter((t) => t.urgency === "Critical");
    const followUps = threads.filter((t) => t.needsFollowUp);
    const dated = active
      .filter((t) => t.deadline)
      .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1));

    const lines: string[] = [];
    lines.push(
      critical.length
        ? `You have ${critical.length} critical item${critical.length === 1 ? "" : "s"} today — the most pressing is "${critical[0]!.subject}".`
        : `Nothing is critical right now; your top item is "${active[0]!.subject}".`,
    );
    if (critical[0]) lines.push(critical[0].aiExplanation);
    if (followUps.length)
      lines.push(
        `${followUps.length} thread${followUps.length === 1 ? "" : "s"} have gone unanswered and look like they expect a reply from you, including "${followUps[0]!.subject}".`,
      );
    if (dated[0])
      lines.push(
        `The nearest deadline is ${new Date(dated[0].deadline!).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} for "${dated[0].subject}".`,
      );
    lines.push(
      `Everything else in your inbox is routine, and ${threads.filter((t) => effectiveCategory(t) === "Other").length} non-academic messages were kept out of your priority view.`,
    );
    return lines;
  }, [threads]);
}
