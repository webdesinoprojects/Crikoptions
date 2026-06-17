import { useQuery } from "@tanstack/react-query";
import { tradingService } from "../services/trading.service";
import { terminalPollInterval, tradingQueryKeys } from "./query-keys";

export const useExecutions = (matchId: string, marketId: string) => {
  return useQuery({
    queryKey: tradingQueryKeys.executions(matchId, marketId),
    queryFn: () => tradingService.fetchExecutions(matchId, marketId),
    enabled: !!matchId && !!marketId,
    refetchInterval: terminalPollInterval,
    refetchOnWindowFocus: true,
  });
};
