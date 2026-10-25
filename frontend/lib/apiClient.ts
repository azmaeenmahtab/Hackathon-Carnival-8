import { Thread, PriorityStats } from "@/types/threads";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Builds request options including credentials and bearer token fallback.
 * Cross-domain requests between frontend.vercel.app and backend.vercel.app
 * may block third-party cookies; sending Bearer token guarantees authentication.
 */
function getRequestOptions(customOpts: RequestInit = {}): RequestInit {
  const headers: Record<string, string> = {};

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("faculty_session_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["x-session-token"] = token;
    }
  }

  return {
    credentials: "include",
    ...customOpts,
    headers: {
      ...headers,
      ...((customOpts.headers as Record<string, string>) || {}),
    },
  };
}

export interface SyncResult {
  ingested: number;
  reclassified: number;
  failed: number;
}

export const apiClient = {
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/health`, {
        signal: AbortSignal.timeout(3000),
        credentials: "include",
      });
      const data = await res.json();
      return data.success === true;
    } catch {
      return false;
    }
  },

  async getThreads(query?: {
    category?: string;
    urgency?: string;
    needsFollowUp?: boolean;
    isRead?: boolean;
    page?: number;
    limit?: number;
    sort?: "urgency" | "recent" | "oldest";
  }): Promise<{ items: Thread[]; total: number; meta?: any } | null> {
    try {
      const params = new URLSearchParams();
      if (query?.category && query.category !== "All")
        params.set("category", query.category);
      if (query?.urgency && query.urgency !== "All")
        params.set("urgency", query.urgency);
      if (query?.needsFollowUp !== undefined)
        params.set("needsFollowUp", String(query.needsFollowUp));
      if (query?.isRead !== undefined)
        params.set("isRead", String(query.isRead));
      if (query?.page) params.set("page", String(query.page));
      if (query?.limit) params.set("limit", String(query.limit));
      if (query?.sort) params.set("sort", query.sort);

      const res = await fetch(
        `${API_BASE}/api/threads?${params.toString()}`,
        getRequestOptions()
      );
      if (!res.ok) return null;
      const json = await res.json();
      if (!json.success) return null;

      return {
        items: json.data,
        total: json.meta?.total ?? json.data.length,
        meta: json.meta,
      };
    } catch {
      return null;
    }
  },

  async getThreadById(id: string): Promise<Thread | null> {
    try {
      const res = await fetch(`${API_BASE}/api/threads/${id}`, getRequestOptions());
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async getFollowUpThreads(): Promise<{ items: Thread[]; total: number } | null> {
    try {
      const res = await fetch(`${API_BASE}/api/threads/follow-up`, getRequestOptions());
      if (!res.ok) return null;
      const json = await res.json();
      return json.success
        ? { items: json.data, total: json.meta?.total ?? json.data.length }
        : null;
    } catch {
      return null;
    }
  },

  async getOtherThreads(): Promise<{
    items: Thread[];
    total: number;
    filteredPercent: number;
  } | null> {
    try {
      const res = await fetch(`${API_BASE}/api/threads/other`, getRequestOptions());
      if (!res.ok) return null;
      const json = await res.json();
      return json.success
        ? {
            items: json.data,
            total: json.meta?.total ?? json.data.length,
            filteredPercent: json.meta?.filteredPercentOfInbox ?? 0,
          }
        : null;
    } catch {
      return null;
    }
  },

  async getDigest(): Promise<{
    digestText: string;
    generatedAt: string;
    stale: boolean;
    aiGenerated?: boolean;
  } | null> {
    try {
      const res = await fetch(`${API_BASE}/api/digest`, getRequestOptions());
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async getStats(): Promise<PriorityStats | null> {
    try {
      const res = await fetch(`${API_BASE}/api/stats/overview`, getRequestOptions());
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async triggerMockSync(reset = false): Promise<SyncResult | null> {
    try {
      const res = await fetch(
        `${API_BASE}/api/sync/mock`,
        getRequestOptions({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reset }),
        })
      );
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async markRead(id: string, isRead: boolean): Promise<boolean> {
    try {
      const res = await fetch(
        `${API_BASE}/api/threads/${id}/read`,
        getRequestOptions({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead }),
        })
      );
      return res.ok;
    } catch {
      return false;
    }
  },

  async reclassify(id: string, category: string): Promise<boolean> {
    try {
      const res = await fetch(
        `${API_BASE}/api/threads/${id}/reclassify`,
        getRequestOptions({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category }),
        })
      );
      return res.ok;
    } catch {
      return false;
    }
  },

  async simulateIncomingEmail(data: {
    subject: string;
    sender: string;
    body: string;
    isFaculty?: boolean;
  }): Promise<Thread | null> {
    try {
      const res = await fetch(
        `${API_BASE}/api/threads/incoming`,
        getRequestOptions({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
      );
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async resolveThread(id: string, note?: string): Promise<boolean> {
    try {
      const res = await fetch(
        `${API_BASE}/api/threads/${id}/resolve`,
        getRequestOptions({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note }),
        })
      );
      return res.ok;
    } catch {
      return false;
    }
  },

  async getResolvedThreads(): Promise<{ items: Thread[]; total: number } | null> {
    try {
      const res = await fetch(`${API_BASE}/api/threads/resolved`, getRequestOptions());
      if (!res.ok) return null;
      const json = await res.json();
      return json.success
        ? { items: json.data, total: json.meta?.total ?? json.data.length }
        : null;
    } catch {
      return null;
    }
  },

  async restoreResolvedThread(id: string): Promise<Thread | null> {
    try {
      const res = await fetch(
        `${API_BASE}/api/threads/resolved/${id}/restore`,
        getRequestOptions({ method: "POST" })
      );
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async getGoogleConnectUrl(): Promise<string | null> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/google/connect`, getRequestOptions());
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data.url : null;
    } catch {
      return null;
    }
  },

  async getGmailStatus(): Promise<{
    connected: boolean;
    connectedEmail?: string | null;
    lastSyncedAt?: string | null;
    syncStatus?: string;
  } | null> {
    try {
      const res = await fetch(`${API_BASE}/api/auth/google/status`, getRequestOptions());
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async disconnectGmail(): Promise<boolean> {
    try {
      const res = await fetch(
        `${API_BASE}/api/auth/google/disconnect`,
        getRequestOptions({ method: "POST" })
      );
      return res.ok;
    } catch {
      return false;
    }
  },

  async triggerGmailSync(): Promise<SyncResult | null> {
    try {
      const res = await fetch(
        `${API_BASE}/api/sync/gmail`,
        getRequestOptions({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },
};
