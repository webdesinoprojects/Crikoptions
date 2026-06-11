import { useQuery } from "@tanstack/react-query";
import { tradingService } from "../services/trading.service";

export const useMarketChart = (marketId: string, timeframe: string = "1D") => {
  return useQuery({
    queryKey: ["marketChart", marketId, timeframe],
    queryFn: () => tradingService.getMarketCandles(marketId, timeframe),
    staleTime: 60000, // Real-time updates will be pushed via websocket (simulated in component for now)
  });
};
