import { useQuery } from "@tanstack/react-query";
import { tradingService } from "../services/trading.service";

export const useTradeHistory = (marketId: string) => {
  return useQuery({
    queryKey: ["tradeHistory", marketId],
    queryFn: () => tradingService.getRecentTrades(marketId),
    staleTime: 5000,
    refetchInterval: 2000, // Simulate realtime push by aggressive polling
  });
};
