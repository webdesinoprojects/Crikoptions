import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";
import type { Match } from "@/types";
import { mergeMatchSnapshot } from "@/features/trading/utils/merge-match-snapshot";

export const useDashboardOverview = (enabled = true) => {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: dashboardService.getFinancialOverview,
    enabled,
    refetchInterval: enabled ? 10000 : false,
    refetchOnWindowFocus: enabled,
  });
};

export const useLiveTicker = (enabled = true) => {
  return useQuery({
    queryKey: ["dashboard", "ticker"],
    queryFn: dashboardService.getLiveTicker,
    enabled,
    refetchInterval: enabled ? 5000 : false,
  });
};

export const useHomeMatches = (enabled = true) => {
  return useQuery({
    queryKey: ["homeMatches"],
    queryFn: dashboardService.fetchHomeMatches,
    enabled,
    refetchInterval: enabled ? 5000 : false,
  });
};

export const useMatchDetails = (matchId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["matchDetails", matchId],
    queryFn: async () => {
      const current = queryClient.getQueryData<Match>(["matchDetails", matchId]);
      const ids = Array.from(new Set([matchId, current?.id].filter(Boolean))) as string[];

      for (const id of ids) {
        try {
          const incoming = await dashboardService.fetchLiveState(id);
          return mergeMatchSnapshot(current, incoming);
        } catch {
          // Try the next alias id.
        }
      }

      const incoming = await dashboardService.fetchMatchDetails(matchId);
      return mergeMatchSnapshot(current, incoming);
    },
    enabled: !!matchId,
    refetchInterval: 1000,
  });
};

export const useLiveMatches = () => {
  return useHomeMatches();
};

export const useMarketMovers = () => {
  return useQuery({
    queryKey: ["dashboard", "movers"],
    queryFn: dashboardService.getMarketMovers,
  });
};

export const useOpportunityScanner = () => {
  return useQuery({
    queryKey: ["dashboard", "opportunities"],
    queryFn: dashboardService.getOpportunities,
  });
};

export const useIntelligenceFeed = () => {
  return useQuery({
    queryKey: ["dashboard", "intelligence"],
    queryFn: dashboardService.getIntelligenceFeed,
  });
};
