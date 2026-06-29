import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tradingService } from "../services/trading.service";
import { refreshAfterExitAll, terminalPollInterval, tradingQueryKeys } from "./query-keys";

export const useDailyPnL = () => {
  return useQuery({
    queryKey: tradingQueryKeys.dailyPnL,
    queryFn: () => tradingService.fetchDailyPnL(),
    refetchInterval: terminalPollInterval,
    refetchOnWindowFocus: true,
  });
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
