import { useQuery } from "@tanstack/react-query";
import { tradingService } from "../services/trading.service";
import type { PositionQueryFilters } from "../services/trading.service";
import { terminalPollInterval, tradingQueryKeys } from "./query-keys";

export const useOpenPositions = (filters?: PositionQueryFilters) => {
  return useQuery({
    queryKey: tradingQueryKeys.openPositionsFiltered(filters),
    queryFn: () => tradingService.fetchOpenPositions(filters),
    refetchInterval: terminalPollInterval,
    refetchOnWindowFocus: true,
  });
};

export const useClosedPositions = (filters?: PositionQueryFilters) => {
  return useQuery({
    queryKey: tradingQueryKeys.closedPositionsFiltered(filters),
    queryFn: () => tradingService.fetchClosedPositions(filters),
    refetchInterval: terminalPollInterval,
    refetchOnWindowFocus: true,
  });
};
