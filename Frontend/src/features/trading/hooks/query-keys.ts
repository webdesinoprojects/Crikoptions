import { QueryClient } from "@tanstack/react-query";
import { walletKeys } from "@/features/wallet/hooks";
import { Order } from "@/types";

export const tradingQueryKeys = {
  ordersRoot: ["orders"] as const,
  orders: (matchId?: string) => ["orders", matchId] as const,
  executions: (matchId: string, marketId: string) => ["executions", matchId, marketId] as const,
  openPositions: ["openPositions"] as const,
};

const TERMINAL_POLL_MS = 4000;

export const terminalPollInterval = TERMINAL_POLL_MS;

export function refreshAfterOrderSubmit(queryClient: QueryClient, order: Order, matchId: string) {
  upsertOrderInCache(queryClient, order, matchId);
  refreshTerminalQueries(queryClient, matchId);
}

export function refreshAfterOrderCancel(queryClient: QueryClient, matchId?: string) {
  invalidateAndRefetch(queryClient, tradingQueryKeys.orders(matchId));
  invalidateAndRefetch(queryClient, walletKeys.wallet);
}

function refreshTerminalQueries(queryClient: QueryClient, matchId: string) {
  invalidateAndRefetch(queryClient, tradingQueryKeys.orders(matchId));
  invalidateAndRefetch(queryClient, tradingQueryKeys.openPositions);
  invalidateAndRefetch(queryClient, walletKeys.wallet);
  invalidateAndRefetch(queryClient, ["portfolio"]);
  invalidateAndRefetch(queryClient, ["dashboard", "overview"]);
}

function invalidateAndRefetch(queryClient: QueryClient, queryKey: readonly unknown[]) {
  void queryClient.invalidateQueries({ queryKey });
  void queryClient.refetchQueries({ queryKey, type: "active" });
}

function upsertOrderInCache(queryClient: QueryClient, order: Order, matchId: string) {
  queryClient.setQueryData<Order[]>(tradingQueryKeys.orders(matchId), (current = []) => {
    const next = current.filter((item) => item.id !== order.id);
    next.unshift(order);
    return next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });
}
