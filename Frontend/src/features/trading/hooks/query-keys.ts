import { QueryClient } from "@tanstack/react-query";
import { walletKeys } from "@/features/wallet/hooks";
import type { PositionUpdateEvent } from "@/lib/websocket/order.stream";
import { Order } from "@/types";
import type { OpenPosition } from "../types/position";

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

export function refreshAfterExit(queryClient: QueryClient, matchId?: string) {
  if (matchId) invalidateAndRefetch(queryClient, tradingQueryKeys.orders(matchId));
  invalidateAndRefetch(queryClient, tradingQueryKeys.openPositions);
  invalidateAndRefetch(queryClient, walletKeys.wallet);
  invalidateAndRefetch(queryClient, ["portfolio"]);
  invalidateAndRefetch(queryClient, ["dashboard", "overview"]);
}

export function patchOpenPositionsCache(queryClient: QueryClient, event: PositionUpdateEvent) {
  queryClient.setQueryData<OpenPosition[]>(tradingQueryKeys.openPositions, (current = []) =>
    current
      .map((position) => {
        if (position.marketId !== event.marketId) return position;

        return {
          ...position,
          lots: Math.abs(event.quantity),
          buyPrice: event.averageEntryPrice,
          ltp: event.averageEntryPrice,
          pnl: event.unrealizedPnL,
          updatedAt: event.timestamp,
        };
      })
      .filter((position) => position.marketId !== event.marketId || event.quantity !== 0)
  );
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
