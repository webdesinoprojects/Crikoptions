import { useQuery } from "@tanstack/react-query";
import { tradingService } from "../services/trading.service";
import { terminalPollInterval, tradingQueryKeys } from "./query-keys";

export const useOpenPositions = () => {
  return useQuery({
    queryKey: tradingQueryKeys.openPositions,
    queryFn: () => tradingService.fetchOpenPositions(),
    refetchInterval: terminalPollInterval,
    refetchOnWindowFocus: true,
  });
};
