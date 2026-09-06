import { Thread, PriorityStats } from "@/types/threads";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface SyncResult {
  ingested: number;
  reclassified: number;
  failed: number;
}

export const apiClient = {
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/health`, {
        signal: AbortSignal.timeout(2000),
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
  }): Promise<{ items: Thread[]; total: number } | null> {
    try {
      const params = new URLSearchParams();
      if (query?.category) params.set("category", query.category);
      if (query?.urgency) params.set("urgency", query.urgency);
      if (query?.needsFollowUp !== undefined)
        params.set("needsFollowUp", String(query.needsFollowUp));
      if (query?.isRead !== undefined)
        params.set("isRead", String(query.isRead));
      if (query?.page) params.set("page", String(query.page));
      if (query?.limit) params.set("limit", String(query.limit));

      const res = await fetch(`${API_BASE}/api/threads?${params.toString()}`, {
        headers: { "x-dev-user-id": "dev-user-1" },
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (!json.success) return null;

      return {
        items: json.data,
        total: json.meta?.total || json.data.length,
      };
    } catch {
      return null;
    }
  },

  async getDigest(): Promise<string | null> {
    try {
      const res = await fetch(`${API_BASE}/api/digest`, {
        headers: { "x-dev-user-id": "dev-user-1" },
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data.digestText : null;
    } catch {
      return null;
    }
  },

  async getStats(): Promise<PriorityStats | null> {
    try {
      const res = await fetch(`${API_BASE}/api/stats/overview`, {
        headers: { "x-dev-user-id": "dev-user-1" },
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async triggerMockSync(): Promise<SyncResult | null> {
    try {
      const res = await fetch(`${API_BASE}/api/sync/mock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dev-user-id": "dev-user-1",
        },
        body: JSON.stringify({ reset: false }),
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
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-dev-user-id": "dev-user-1",
        },
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
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-dev-user-id": "dev-user-1",
        },
        body: JSON.stringify({ category }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
