import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: dashboardService.getFinancialOverview,
  });
};

export const useLiveTicker = () => {
  return useQuery({
    queryKey: ["dashboard", "ticker"],
    queryFn: dashboardService.getLiveTicker,
    refetchInterval: 5000, // Refetch every 5 seconds for simulated "live" feel if WS isn't active
  });
};

export const useHomeMatches = () => {
  return useQuery({
    queryKey: ["homeMatches"],
    queryFn: dashboardService.fetchHomeMatches,
    refetchInterval: 5000, // Poll every 5s for live score updates
  });
};

export const useMatchDetails = (matchId: string) => {
  return useQuery({
    queryKey: ["matchDetails", matchId],
    queryFn: () => dashboardService.fetchMatchDetails(matchId),
    enabled: !!matchId,
    refetchInterval: 5000,
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
