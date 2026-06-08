import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tradingService, CreateOrderPayload } from "../services/trading.service";

export const useOrders = (matchId?: string, status?: string) => {
  return useQuery({
    queryKey: ["orders", matchId, status],
    queryFn: () => tradingService.fetchOrders(matchId, status),
    refetchInterval: 5000, // Refresh orders list every 5s
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => tradingService.createOrder(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["marketDepth", data.marketId] });
      queryClient.invalidateQueries({ queryKey: ["orderBook", data.marketId] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => tradingService.cancelOrder(orderId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["marketDepth", data.marketId] });
      queryClient.invalidateQueries({ queryKey: ["orderBook", data.marketId] });
    },
  });
};
