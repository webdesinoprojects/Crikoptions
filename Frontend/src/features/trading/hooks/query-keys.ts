import { QueryClient } from "@tanstack/react-query";
import { walletKeys } from "@/features/wallet/hooks";
import { Order } from "@/types";
import { OpenPosition } from "../types/position";
import { PositionUpdateEvent } from "@/lib/websocket/order.stream";

export const tradingQueryKeys = {
  ordersRoot: ["orders"] as const,
  orders: (matchId?: string) => ["orders", matchId] as const,
  executions: (matchId: string, marketId: string) => ["executions", matchId, marketId] as const,
  openPositions: ["openPositions"] as const,
  closedPositions: ["closedPositions"] as const,
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

/**
 * Refresh everything affected by closing/reducing a position (exit/sell-to-close):
 * open positions shrink or disappear, closed history + wallet update, orders gain a sell.
 */
export function refreshAfterExit(queryClient: QueryClient, matchId?: string) {
  invalidateAndRefetch(queryClient, tradingQueryKeys.openPositions);
  invalidateAndRefetch(queryClient, tradingQueryKeys.closedPositions);
  invalidateAndRefetch(queryClient, tradingQueryKeys.orders(matchId));
  invalidateAndRefetch(queryClient, walletKeys.wallet);
  invalidateAndRefetch(queryClient, ["portfolio"]);
  invalidateAndRefetch(queryClient, ["dashboard"]);
}

/**
 * Patch the open-positions cache in place from a WebSocket position event so the UI
 * reacts instantly: reduce lots, refresh live PnL, or drop the row when fully closed.
 */
export function patchOpenPositionsCache(queryClient: QueryClient, event: PositionUpdateEvent) {
  queryClient.setQueryData<OpenPosition[]>(tradingQueryKeys.openPositions, (current) => {
    if (!current) return current;

    if (event.lots <= 0) {
      return current.filter(
        (position) => !(position.marketId === event.marketId && position.strike === event.strike)
      );
    }

    return current.map((position) => {
      if (position.marketId !== event.marketId || position.strike !== event.strike) {
        return position;
      }
      return {
        ...position,
        lots: event.lots,
        buyPrice: typeof event.buyPrice === "number" ? event.buyPrice : position.buyPrice,
        ltp: typeof event.ltp === "number" ? event.ltp : position.ltp,
        pnl: typeof event.pnl === "number" ? event.pnl : position.pnl,
        realizedPnl: typeof event.realizedPnl === "number" ? event.realizedPnl : position.realizedPnl,
        status: event.status ?? position.status,
      };
    });
  });
}

function refreshTerminalQueries(queryClient: QueryClient, matchId: string) {
  invalidateAndRefetch(queryClient, tradingQueryKeys.orders(matchId));
  invalidateAndRefetch(queryClient, tradingQueryKeys.openPositions);
  invalidateAndRefetch(queryClient, walletKeys.wallet);
  invalidateAndRefetch(queryClient, ["portfolio"]);
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
