import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../services/analytics.service";

/** Admin-only overview (total/new/active users, avg session length). */
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
