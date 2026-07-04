import { QueryClient } from "@tanstack/react-query";
import { walletKeys } from "@/features/wallet/hooks";
import type { PositionUpdateEvent } from "@/lib/websocket/order.stream";
import { Order } from "@/types";
import type { CreateOrderPayload, PositionQueryFilters } from "../services/trading.service";
import type { OpenPosition } from "../types/position";

export const tradingQueryKeys = {
  ordersRoot: ["orders"] as const,
  orders: (matchId?: string) => ["orders", matchId] as const,
  executions: (matchId: string, marketId: string) => ["executions", matchId, marketId] as const,
  openPositions: ["openPositions"] as const,
  openPositionsFiltered: (filters?: PositionQueryFilters) =>
    hasPositionFilters(filters) ? ["openPositions", normalizePositionFilters(filters)] as const : ["openPositions"] as const,
  closedPositions: ["closedPositions"] as const,
  closedPositionsFiltered: (filters?: PositionQueryFilters) =>
    hasPositionFilters(filters) ? ["closedPositions", normalizePositionFilters(filters)] as const : ["closedPositions"] as const,
  marketPnL: (marketId: string) => ["marketPnL", marketId] as const,
  dailyPnL: ["dailyPnL"] as const,
  orderPreview: (payload?: CreateOrderPayload) => ["orderPreview", normalizeOrderPreviewPayload(payload)] as const,
};

const TERMINAL_POLL_MS = 4000;

export const terminalPollInterval = TERMINAL_POLL_MS;

export function refreshAfterOrderSubmit(queryClient: QueryClient, order: Order, matchId: string) {
  upsertOrderInCache(queryClient, order, matchId);
  invalidateAndRefetch(queryClient, tradingQueryKeys.marketPnL(order.marketId));
  invalidateAndRefetch(queryClient, tradingQueryKeys.dailyPnL);
  refreshTerminalQueries(queryClient, matchId);
}

export function refreshAfterOrderCancel(queryClient: QueryClient, matchId?: string) {
  invalidateAndRefetch(queryClient, tradingQueryKeys.orders(matchId));
  invalidateAndRefetch(queryClient, walletKeys.wallet);
}

export function refreshAfterExit(queryClient: QueryClient, matchId?: string) {
  if (matchId) invalidateAndRefetch(queryClient, tradingQueryKeys.orders(matchId));
  invalidateAndRefetch(queryClient, tradingQueryKeys.openPositions);
  invalidateAndRefetch(queryClient, tradingQueryKeys.closedPositions);
  invalidateAndRefetch(queryClient, walletKeys.wallet);
  invalidateAndRefetch(queryClient, tradingQueryKeys.dailyPnL);
  invalidateAndRefetch(queryClient, ["portfolio"]);
  invalidateAndRefetch(queryClient, ["dashboard", "overview"]);
}

export function refreshAfterExitAll(queryClient: QueryClient) {
  invalidateAndRefetch(queryClient, tradingQueryKeys.ordersRoot);
  invalidateAndRefetch(queryClient, tradingQueryKeys.openPositions);
  invalidateAndRefetch(queryClient, tradingQueryKeys.closedPositions);
  invalidateAndRefetch(queryClient, tradingQueryKeys.dailyPnL);
  invalidateAndRefetch(queryClient, ["marketPnL"]);
  invalidateAndRefetch(queryClient, walletKeys.wallet);
  invalidateAndRefetch(queryClient, ["portfolio"]);
  invalidateAndRefetch(queryClient, ["dashboard", "overview"]);
}

export function patchOpenPositionsCache(queryClient: QueryClient, event: PositionUpdateEvent) {
  const hasSignedLots = typeof event.lots === "number" || typeof event.quantity === "number";
  const eventLots = event.lots ?? event.quantity ?? 0;
  queryClient.setQueryData<OpenPosition[]>(tradingQueryKeys.openPositions, (current = []) =>
    current
      .map((position) => {
        const samePosition =
          position.marketId === event.marketId &&
          (typeof event.strike !== "number" || Math.abs(position.strike - event.strike) < 0.01);
        if (!samePosition) return position;

        return {
          ...position,
          side: hasSignedLots ? (eventLots < 0 ? "SELL" : "BUY") : position.side,
          lots: hasSignedLots ? eventLots : position.lots,
          buyPrice: event.buyPrice ?? (eventLots > 0 ? event.averageEntryPrice : undefined) ?? position.buyPrice,
          sellPrice: event.sellPrice ?? (eventLots < 0 ? event.averageEntryPrice : undefined) ?? position.sellPrice,
          ltp: event.ltp ?? event.averageEntryPrice ?? 0,
          pnl: event.pnl ?? event.unrealizedPnL ?? 0,
          realizedPnl: event.realizedPnl ?? 0,
          status: event.status ?? position.status,
          updatedAt: event.timestamp,
        };
      })
      .filter((position) => {
        const samePosition =
          position.marketId === event.marketId &&
          (typeof event.strike !== "number" || Math.abs(position.strike - event.strike) < 0.01);
        return !samePosition || !hasSignedLots || eventLots !== 0;
      })
  );
}

function refreshTerminalQueries(queryClient: QueryClient, matchId: string) {
  invalidateAndRefetch(queryClient, tradingQueryKeys.orders(matchId));
  invalidateAndRefetch(queryClient, tradingQueryKeys.openPositions);
  invalidateAndRefetch(queryClient, tradingQueryKeys.closedPositions);
  invalidateAndRefetch(queryClient, walletKeys.wallet);
  invalidateAndRefetch(queryClient, tradingQueryKeys.dailyPnL);
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

function normalizePositionFilters(filters?: PositionQueryFilters) {
  return {
    matchId: filters?.matchId ?? "",
    marketId: filters?.marketId ?? "",
  };
}

function hasPositionFilters(filters?: PositionQueryFilters) {
  return Boolean(filters?.matchId || filters?.marketId);
}



function normalizeOrderPreviewPayload(payload?: CreateOrderPayload) {
  if (!payload) return null;
  return {
    matchId: payload.matchId,
    marketId: payload.marketId,
    strike: payload.strike,
    side: payload.side,
    type: payload.type,
    positionEffect: payload.positionEffect ?? "AUTO",
    quantity: payload.quantity,
    price: payload.price,
    pricingSnapshot: payload.pricingSnapshot ?? null,
  };
}
