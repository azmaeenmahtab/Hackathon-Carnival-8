import { Thread, PriorityStats } from "@/types/threads";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** Shared fetch options — always send cookies so Better Auth session is forwarded */
const BASE_OPTS: RequestInit = {
  credentials: "include",
};

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
        BASE_OPTS
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
      const res = await fetch(`${API_BASE}/api/threads/${id}`, BASE_OPTS);
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async getFollowUpThreads(): Promise<{ items: Thread[]; total: number } | null> {
    try {
      const res = await fetch(`${API_BASE}/api/threads/follow-up`, BASE_OPTS);
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
      const res = await fetch(`${API_BASE}/api/threads/other`, BASE_OPTS);
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
      const res = await fetch(`${API_BASE}/api/digest`, BASE_OPTS);
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async getStats(): Promise<PriorityStats | null> {
    try {
      const res = await fetch(`${API_BASE}/api/stats/overview`, BASE_OPTS);
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async triggerMockSync(reset = false): Promise<SyncResult | null> {
    try {
      const res = await fetch(`${API_BASE}/api/sync/mock`, {
        ...BASE_OPTS,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async markRead(id: string, isRead: boolean): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/threads/${id}/read`, {
        ...BASE_OPTS,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async reclassify(id: string, category: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/threads/${id}/reclassify`, {
        ...BASE_OPTS,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
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
      const res = await fetch(`${API_BASE}/api/threads/incoming`, {
        ...BASE_OPTS,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async resolveThread(id: string, note?: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/threads/${id}/resolve`, {
        ...BASE_OPTS,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getResolvedThreads(): Promise<{ items: Thread[]; total: number } | null> {
    try {
      const res = await fetch(`${API_BASE}/api/threads/resolved`, BASE_OPTS);
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
      const res = await fetch(`${API_BASE}/api/threads/resolved/${id}/restore`, {
        ...BASE_OPTS,
        method: "POST",
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },
};
