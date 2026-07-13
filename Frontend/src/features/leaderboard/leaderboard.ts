import { apiClient } from "@/lib/api/client";

export interface LeaderboardEntry {
  rank: number;
  name: string;
  country: string;
  roi: number;
  userId?: string;
}

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
}

function numberOrZero(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeEntry(raw: Record<string, unknown>, index: number): LeaderboardEntry {
  const userId = raw.userId ?? raw.user_id ?? raw.id;
  return {
    rank: numberOrZero(raw.rank) || index + 1,
    name: String(raw.name ?? "Trader"),
    country: String(raw.country ?? "—"),
    roi: numberOrZero(raw.roi),
    userId: userId ? String(userId) : undefined,
  };
}

export function normalizeLeaderboard(payload: unknown): LeaderboardEntry[] {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload.map((item, index) => normalizeEntry(item as Record<string, unknown>, index));
  }

  const envelope = payload as ApiEnvelope<unknown>;
  const data = envelope.data ?? payload;

  if (Array.isArray(data)) {
    return data.map((item, index) => normalizeEntry(item as Record<string, unknown>, index));
  }

  const items = (data as { items?: unknown[] })?.items;
  if (Array.isArray(items)) {
    return items.map((item, index) => normalizeEntry(item as Record<string, unknown>, index));
  }

  return [];
}

export const leaderboardKeys = {
  all: ["leaderboard"] as const,
};

export const leaderboardApi = {
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await apiClient.get<ApiEnvelope<unknown>>("/v1/leaderboard");
    return normalizeLeaderboard(response.data);
  },
};

export function formatRoi(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function findCurrentUserEntry(
  entries: LeaderboardEntry[],
  user?: { id?: string; name?: string }
): LeaderboardEntry | undefined {
  if (!user) return undefined;

  if (user.id) {
    const byId = entries.find((entry) => entry.userId && entry.userId === user.id);
    if (byId) return byId;
  }

  const exactName = user.name?.trim();
  if (exactName) {
    const exactMatches = entries.filter((entry) => entry.name.trim() === exactName);
    if (exactMatches.length === 1) return exactMatches[0];

    const looseMatches = entries.filter(
      (entry) => entry.name.trim().toLowerCase() === exactName.toLowerCase()
    );
    if (looseMatches.length === 1) return looseMatches[0];
  }

  return undefined;
}
