import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: dashboardService.getFinancialOverview,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
};

export const useLiveTicker = () => {
  return useQuery({
    queryKey: ["dashboard", "ticker"],
    queryFn: dashboardService.getLiveTicker,
    refetchInterval: 5000,
  });
};

export const useHomeMatches = () => {
  return useQuery({
    queryKey: ["homeMatches"],
    queryFn: dashboardService.fetchHomeMatches,
    refetchInterval: 5000,
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
