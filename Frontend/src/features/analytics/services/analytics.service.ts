import { apiClient } from "@/lib/api/client";

/** One point on the signup trend chart. */
export type DayCount = {
  date: string; // YYYY-MM-DD (UTC)
  count: number;
};

/**
 * Mirrors backend `analytics.Overview` (internal/modules/analytics/service.go).
 * avgSessionMinutes measures time between a user's first and last action in a
 * visit, where 30 minutes of silence starts a new visit.
 */
export type AdminAnalyticsOverview = {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  dailyActiveUsers: number;
  avgSessionMinutes: number;
  signupTrend: DayCount[];
  generatedAt: string;
};

/** "active" = seen in last 24h, "dormant" = seen earlier, "never" = no activity recorded. */
export type UserStatus = "active" | "dormant" | "never";

/** Mirrors backend `analytics.UserRow`. */
export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tier: string;
  role: string;
  createdAt: string;
  lastSeenAt?: string;
  sessionCount: number;
  totalActiveSeconds: number;
  avgSessionSeconds: number;
  orderCount: number;
  walletBalance: number;
  status: UserStatus;
  isNew: boolean;
};

export type AdminUsersPage = {
  users: AdminUserRow[];
  total: number;
  page: number;
  limit: number;
};

/** Mirrors backend `analytics.UserDetail`. */
export type AdminUserDetail = AdminUserRow & {
  currentSessionSeconds: number;
  loginAt?: string;
  filledOrders: number;
  walletReserved: number;
};

export type ListUsersParams = {
  search?: string;
  status?: UserStatus | "all";
  page?: number;
  limit?: number;
};

export const analyticsService = {
  getAdminOverview: async (): Promise<AdminAnalyticsOverview> => {
    const response = await apiClient.get<{ success: boolean; data: AdminAnalyticsOverview }>(
      "/v1/admin/analytics/overview"
    );
    return response.data.data;
  },

  listUsers: async (params: ListUsersParams = {}): Promise<AdminUsersPage> => {
    const response = await apiClient.get<{ success: boolean; data: AdminUsersPage }>(
      "/v1/admin/analytics/users",
      { params }
    );
    return response.data.data;
  },

  getUser: async (userId: string): Promise<AdminUserDetail> => {
    const response = await apiClient.get<{ success: boolean; data: AdminUserDetail }>(
      `/v1/admin/analytics/users/${userId}`
    );
    return response.data.data;
  },
};
