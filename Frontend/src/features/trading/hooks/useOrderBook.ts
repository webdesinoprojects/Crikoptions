import { useQuery } from "@tanstack/react-query";
import { CalculatePricePayload, tradingService } from "../services/trading.service";

export const useOrderBook = (marketId: string) => {
  return useQuery({
    queryKey: ["orderBook", marketId],
    queryFn: () => tradingService.getOrderBook(marketId),
    enabled: !!marketId,
    staleTime: 2000, 
    refetchInterval: 2000, // aggressive polling
  });
};

export const useMarketDepth = (marketId: string) => {
  return useQuery({
    queryKey: ["marketDepth", marketId],
    queryFn: () => tradingService.fetchMarketDepth(marketId),
    enabled: !!marketId,
    staleTime: 1000,
    refetchInterval: 2000, // 2s polling for order book depth
  });
};

export const useMarketDetail = (marketId: string) => {
  return useQuery({
    queryKey: ["marketDetail", marketId],
    queryFn: () => tradingService.fetchMarketDetail(marketId),
    enabled: !!marketId,
    staleTime: 1000,
    refetchInterval: 2000,
  });
};

export const useOptionChain = (marketId: string, payload?: CalculatePricePayload) => {
  return useQuery({
    queryKey: ["optionChain", marketId, payload],
    queryFn: () => tradingService.calculateMarketPrice(marketId, payload as CalculatePricePayload),
    enabled: !!marketId && !!payload,
    staleTime: 1000,
    refetchInterval: 5000,
  });
};

export const useMarkets = (matchId: string) => {
  return useQuery({
    queryKey: ["markets", matchId],
    queryFn: () => tradingService.fetchMarkets(matchId),
    enabled: !!matchId,
    staleTime: 5000,
    refetchInterval: 5000,
  });
};
