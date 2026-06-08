import { useQuery } from "@tanstack/react-query";
import { tradingService } from "../services/trading.service";

export const useOrderBook = (marketId: string) => {
  return useQuery({
    queryKey: ["orderBook", marketId],
    queryFn: () => tradingService.getOrderBook(marketId),
    staleTime: 2000, 
    refetchInterval: 2000, // aggressive polling
  });
};

export const useMarketDepth = (marketId: string) => {
  return useQuery({
    queryKey: ["marketDepth", marketId],
    queryFn: () => tradingService.fetchMarketDepth(marketId),
    staleTime: 1000,
    refetchInterval: 2000, // 2s polling for order book depth
  });
};
