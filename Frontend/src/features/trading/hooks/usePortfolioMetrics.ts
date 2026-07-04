import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tradingService } from "../services/trading.service";
import { refreshAfterExitAll, tradingQueryKeys } from "./query-keys";
import { portfolioStream } from "@/lib/websocket/portfolio.stream";

export const useDailyPnL = () => {
  return useQuery({
    queryKey: tradingQueryKeys.dailyPnL,
    queryFn: () => tradingService.fetchDailyPnL(),
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });
};

export const usePortfolioStream = (userId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    
    const unsubscribe = portfolioStream.subscribePortfolioUpdates(userId, (data) => {
      // Update Daily PnL component
      queryClient.setQueryData(tradingQueryKeys.dailyPnL, {
        dailyPnL: data.dailyPnL,
        dailyPnLPct: data.dailyPnLPct,
      });
      
      // Update full dashboard overview
      queryClient.setQueryData(["dashboard", "overview"], data);
    });

    return () => unsubscribe();
  }, [userId, queryClient]);
};

export const useExitAllPositions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => tradingService.exitAllPositions(),
    onSuccess: () => {
      refreshAfterExitAll(queryClient);
    },
  });
};
