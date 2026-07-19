import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tradingService } from "../services/trading.service";
import { refreshAfterExitAll, tradingQueryKeys } from "./query-keys";
import { portfolioStream } from "@/lib/websocket/portfolio.stream";
import { walletKeys } from "@/features/wallet/hooks";
import type { PortfolioSummary as DashboardOverview } from "@/types";
import type { PortfolioSummary as StreamPortfolio } from "@/features/portfolio/types/portfolio";
import type { WalletAccount } from "@/features/wallet/types/wallet";

export const useDailyPnL = () => {
  return useQuery({
    queryKey: tradingQueryKeys.dailyPnL,
    queryFn: () => tradingService.fetchDailyPnL(),
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });
};

export const usePortfolioStream = (userId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    
    const unsubscribe = portfolioStream.subscribePortfolioUpdates(userId, (data) => {
      const marginAvailable = resolveAvailableMargin(data);

      queryClient.setQueryData(tradingQueryKeys.dailyPnL, {
        dailyPnL: data.dailyPnL,
        dailyPnLPct: data.dailyPnLPct,
      });
      
      // Dashboard overview uses marginAvailable — never overwrite with raw portfolio shape.
      queryClient.setQueryData<DashboardOverview>(["dashboard", "overview"], (current) => ({
        totalEquity: data.totalEquity ?? current?.totalEquity ?? 0,
        dailyPnL: data.dailyPnL ?? current?.dailyPnL ?? 0,
        dailyPnLPercentage: data.dailyPnLPct ?? current?.dailyPnLPercentage ?? 0,
        marginAvailable,
        marginUsed: data.usedMargin ?? current?.marginUsed ?? 0,
        marginUsagePct: data.marginUsagePct ?? current?.marginUsagePct ?? 0,
        openPositionsCount: data.openPositionsCount ?? current?.openPositionsCount ?? 0,
      }));

      if (data.wallet) {
        queryClient.setQueryData(walletKeys.wallet, data.wallet);
      } else {
        queryClient.setQueryData<WalletAccount | undefined>(walletKeys.wallet, (current) =>
          current
            ? { ...current, availableBalance: marginAvailable }
            : current
        );
      }

      void queryClient.invalidateQueries({ queryKey: walletKeys.wallet });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    });

    return () => unsubscribe();
  }, [userId, queryClient]);
};

function resolveAvailableMargin(data: StreamPortfolio): number {
  if (typeof data.wallet?.availableBalance === "number" && Number.isFinite(data.wallet.availableBalance)) {
    return data.wallet.availableBalance;
  }
  if (typeof data.availableMargin === "number" && Number.isFinite(data.availableMargin)) {
    return data.availableMargin;
  }
  return 0;
}

export const useExitAllPositions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => tradingService.exitAllPositions(),
    onSuccess: () => {
      refreshAfterExitAll(queryClient);
    },
  });
};
