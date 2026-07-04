"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { walletKeys } from "@/features/wallet/hooks";
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import { orderStream } from "@/lib/websocket/order.stream";
import { patchOpenPositionsCache, refreshAfterExit, tradingQueryKeys } from "./query-keys";
import { usePortfolioStream } from "./usePortfolioMetrics";

/**
 * Subscribes to the authenticated user's private order/position topics
 * (`user:{userId}:orders`, `user:{userId}:positions`) and keeps the trading
 * caches live without polling. Falls back to REST refetch on reconnect because
 * any missed events are reconciled by invalidating the affected queries.
 */
export function useUserStream(matchId?: string) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  // Mount portfolio stream here so it's active wherever user streams are needed
  usePortfolioStream(userId);

  useEffect(() => {
    if (!userId) return;

    const unsubscribeOrders = orderStream.subscribeOrderUpdates(userId, () => {
      queryClient.invalidateQueries({ queryKey: tradingQueryKeys.orders(matchId) });
      queryClient.invalidateQueries({ queryKey: walletKeys.wallet });
    });

    const unsubscribePositions = orderStream.subscribePositionUpdates(userId, (event) => {
      patchOpenPositionsCache(queryClient, event);
      refreshAfterExit(queryClient, matchId);
    });

    return () => {
      unsubscribeOrders();
      unsubscribePositions();
    };
  }, [userId, matchId, queryClient]);
}
