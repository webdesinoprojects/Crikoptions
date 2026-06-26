import { useQuery } from "@tanstack/react-query";
import { portfolioService } from "../services/portfolio.service";
import { useMemo } from "react";

/** Stale time: 30s. Refetch every 60s or on window focus. */
const PORTFOLIO_QUERY_KEY = ["portfolio", "summary"];

export function usePortfolio() {
  return useQuery({
    queryKey: PORTFOLIO_QUERY_KEY,
    queryFn: () => portfolioService.getPortfolioSummary(),
    staleTime: 2_000,
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
  });
}

/** Convenience hook: open positions slice */
export function usePositions() {
  const { data, ...rest } = usePortfolio();
  const positions = useMemo(() => data?.positions ?? [], [data]);
  return { data: positions, portfolio: data, ...rest };
}

/** Convenience hook: closed trades slice */
export function useClosedTrades() {
  const { data, ...rest } = usePortfolio();
  const closedTrades = useMemo(() => data?.closedTrades ?? [], [data]);
  return { data: closedTrades, portfolio: data, ...rest };
}

/** Convenience hook: performance & equity curve */
export function usePerformance() {
  const { data, ...rest } = usePortfolio();

  const performance = useMemo(() => {
    if (!data) return null;
    return {
      totalPnL: data.totalPnL,
      totalPnLPct: data.totalPnLPct,
      dailyPnL: data.dailyPnL,
      dailyPnLPct: data.dailyPnLPct,
      winRate: data.winRate,
      avgWin: data.avgWin,
      avgLoss: data.avgLoss,
      profitFactor: data.profitFactor,
      closedTradesCount: data.closedTradesCount,
      equityCurve: data.equityCurve,
    };
  }, [data]);

  return { data: performance, portfolio: data, ...rest };
}
