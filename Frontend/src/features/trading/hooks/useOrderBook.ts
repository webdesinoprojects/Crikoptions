import { useQuery } from "@tanstack/react-query";
import { tradingService } from "../services/trading.service";

export const useOrderBook = (marketId: string) => {
  return useQuery({
    queryKey: ["orderBook", marketId],
    queryFn: () => tradingService.getOrderBook(marketId),
    staleTime: 5000, 
    refetchInterval: 2000, // Simulate realtime push by aggressive polling
  });
};
