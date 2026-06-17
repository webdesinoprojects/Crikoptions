import { useQuery } from "@tanstack/react-query";
import { tradingService } from "../services/trading.service";

export const useMarketChart = (marketId: string, timeframe: string = "1D") => {
  return useQuery({
    queryKey: ["marketChart", marketId, timeframe],
    queryFn: () => tradingService.getMarketCandles(marketId, timeframe),
    enabled: !!marketId,
    staleTime: 60000,
  });
};
