import { QueryClient } from "@tanstack/react-query";
import { walletKeys } from "@/features/wallet/hooks";
import { Order } from "@/types";

export const tradingQueryKeys = {
  orders: (matchId?: string) => ["orders", matchId] as const,
  executions: (matchId: string, marketId: string) => ["executions", matchId, marketId] as const,
  openPositions: ["openPositions"] as const,
};

const TERMINAL_POLL_MS = 4000;

export const terminalPollInterval = TERMINAL_POLL_MS;

export function refreshAfterOrderSubmit(queryClient: QueryClient, order: Order, matchId: string, marketId: string) {
  const status = order.backendStatus;

  queryClient.invalidateQueries({ queryKey: tradingQueryKeys.orders(matchId) });
  queryClient.invalidateQueries({ queryKey: walletKeys.wallet });

  if (status === "executed" || status === "partially_filled") {
    queryClient.invalidateQueries({ queryKey: tradingQueryKeys.executions(matchId, marketId) });
    queryClient.invalidateQueries({ queryKey: tradingQueryKeys.openPositions });
    queryClient.invalidateQueries({ queryKey: ["portfolio"] });
  }
}

export function refreshAfterOrderCancel(queryClient: QueryClient, matchId?: string) {
  queryClient.invalidateQueries({ queryKey: tradingQueryKeys.orders(matchId) });
  queryClient.invalidateQueries({ queryKey: walletKeys.wallet });
}
