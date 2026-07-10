import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";

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
  return useQuery({
    queryKey: ["matchDetails", matchId],
    queryFn: () => dashboardService.fetchMatchDetails(matchId),
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
