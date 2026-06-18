import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClosePositionPayload, tradingService } from "../services/trading.service";
import { refreshAfterExit, terminalPollInterval, tradingQueryKeys } from "./query-keys";

export const useOpenPositions = () => {
  return useQuery({
    queryKey: tradingQueryKeys.openPositions,
    queryFn: () => tradingService.fetchOpenPositions(),
    refetchInterval: terminalPollInterval,
    refetchOnWindowFocus: true,
  });
};

export const useClosePosition = (matchId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClosePositionPayload) => tradingService.closePosition(payload),
    onSuccess: (order) => {
      refreshAfterExit(queryClient, matchId);
      queryClient.invalidateQueries({ queryKey: ["marketDepth", order.marketId] });
      queryClient.invalidateQueries({ queryKey: ["orderBook", order.marketId] });
    },
  });
};
