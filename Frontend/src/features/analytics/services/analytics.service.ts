import { apiClient } from "@/lib/api/client";

/**
 * Mirrors backend `analytics.Overview` (internal/modules/analytics/service.go).
 * avgSessionMinutes is an approximation (lastSeenAt - loginAt averaged across
 * users active in the trailing 24h) — there is no dedicated session-end event.
 */
export type AdminAnalyticsOverview = {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  dailyActiveUsers: number;
  avgSessionMinutes: number;
  generatedAt: string;
};

export const analyticsService = {
  getAdminOverview: async (): Promise<AdminAnalyticsOverview> => {
    const response = await apiClient.get<{ success: boolean; data: AdminAnalyticsOverview }>(
      "/v1/admin/analytics/overview"
    );
    return response.data.data;
  },
};
