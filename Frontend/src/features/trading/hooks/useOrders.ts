import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tradingService, CreateOrderPayload } from "../services/trading.service";
import {
  refreshAfterOrderCancel,
  refreshAfterOrderSubmit,
  terminalPollInterval,
  tradingQueryKeys,
} from "./query-keys";

export const useOrders = (matchId?: string, fetchAll: boolean = false) => {
  return useQuery({
    queryKey: tradingQueryKeys.orders(matchId),
    queryFn: () => tradingService.fetchOrders(matchId),
    enabled: fetchAll || !!matchId,
    refetchInterval: terminalPollInterval,
    refetchOnWindowFocus: true,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => tradingService.createOrder(payload),
    onSuccess: (data, variables) => {
      refreshAfterOrderSubmit(queryClient, data, variables.matchId);
      queryClient.invalidateQueries({ queryKey: ["marketDepth", data.marketId] });
      queryClient.invalidateQueries({ queryKey: ["orderBook", data.marketId] });
    },
  });
};

export const useOrderPreview = (payload?: CreateOrderPayload) => {
  return useQuery({
    queryKey: tradingQueryKeys.orderPreview(payload),
    queryFn: () => tradingService.previewOrder(payload as CreateOrderPayload),
    enabled: Boolean(payload),
    staleTime: 1000,
    refetchInterval: payload ? terminalPollInterval : false,
  });
};

export const useCancelOrder = (matchId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => tradingService.cancelOrder(orderId),
    onSuccess: (data) => {
      refreshAfterOrderCancel(queryClient, matchId);
      queryClient.invalidateQueries({ queryKey: tradingQueryKeys.marketPnL(data.marketId) });
      queryClient.invalidateQueries({ queryKey: ["marketDepth", data.marketId] });
      queryClient.invalidateQueries({ queryKey: ["orderBook", data.marketId] });
    },
  });
};
