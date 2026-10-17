import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { analyticsService, type ListUsersParams } from "../services/analytics.service";

/** Admin-only overview: headline counts plus the 30-day signup trend. */
export const useAdminAnalyticsOverview = (enabled = true) => {
  return useQuery({
    queryKey: ["admin", "analytics", "overview"],
    queryFn: analyticsService.getAdminOverview,
    enabled,
    // Not live-trading data — refreshing every minute is plenty.
    refetchInterval: enabled ? 60000 : false,
    refetchOnWindowFocus: enabled,
  });
};

/** Paginated, searchable admin users table. */
export const useAdminUsers = (params: ListUsersParams) => {
  return useQuery({
    queryKey: ["admin", "analytics", "users", params],
    queryFn: () => analyticsService.listUsers(params),
    // Keeps the current rows on screen while the next page or a new search
    // loads, so the table does not collapse to a spinner on every keystroke.
    placeholderData: keepPreviousData,
  });
};

/** One user's full detail, behind a row click. */
export const useAdminUser = (userId: string) => {
  return useQuery({
    queryKey: ["admin", "analytics", "users", userId],
    queryFn: () => analyticsService.getUser(userId),
    enabled: !!userId,
    refetchInterval: 60000,
  });
};
