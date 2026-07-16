import { apiClient } from "@/lib/api/client";
import { portfolioService } from "@/features/portfolio/services/portfolio.service";
import { adaptMatch, adaptMatches, BackendMatch } from "@/lib/adapters/match.adapter";
import { BackendMarket } from "@/lib/adapters/market.adapter";
import {
  MarketMover,
  Match,
  Opportunity,
  PortfolioSummary,
  Signal,
  TickerItem,
} from "@/types";

export const dashboardService = {
  fetchHomeMatches: async (): Promise<Match[]> => {
    const response = await apiClient.get<{ success: boolean; data: BackendMatch[] }>("/v1/matches/home");
    return adaptMatches(response.data.data ?? []);
  },

  fetchMatchDetails: async (matchId: string): Promise<Match> => {
    const response = await apiClient.get<{ success: boolean; data: BackendMatch }>(`/v1/matches/${matchId}`);
    return adaptMatch(response.data.data);
  },

  fetchLiveState: async (matchId: string): Promise<Match> => {
    const response = await apiClient.get<{ success: boolean; data: BackendMatch }>(`/v1/matches/${matchId}/live-state`);
    return adaptMatch(response.data.data);
  },

  getFinancialOverview: async (): Promise<PortfolioSummary> => {
    const portfolio = await portfolioService.getPortfolioSummary();
    return {
      totalEquity: portfolio.totalEquity,
      dailyPnL: portfolio.dailyPnL,
      dailyPnLPercentage: portfolio.dailyPnLPct,
      marginAvailable: portfolio.availableMargin,
      marginUsed: portfolio.usedMargin,
      marginUsagePct: portfolio.marginUsagePct,
      openPositionsCount: portfolio.openPositionsCount,
    };
  },

  getLiveTicker: async (): Promise<TickerItem[]> => {
    const markets = await fetchAllMarkets();

    return markets.map((market) => {
      const ltp = numberOrZero(market.ltp);
      const open = numberOrZero(market.open);
      const priceChange = round2(ltp - open);
      const percentageChange = open > 0 ? round2((priceChange / open) * 100) : 0;

      return {
        id: market._id ?? "",
        symbol: symbolFromTitle(market.title),
        lastTradedPrice: ltp,
        priceChange,
        percentageChange,
        trend: priceChange > 0 ? "UP" : priceChange < 0 ? "DOWN" : "NEUTRAL",
      };
    });
  },

  getLiveMatches: async (): Promise<Match[]> => {
    return dashboardService.fetchHomeMatches();
  },

  getMarketMovers: async (): Promise<MarketMover[]> => {
    const markets = await fetchAllMarkets();

    return markets
      .map((market) => {
        const ltp = numberOrZero(market.ltp);
        const open = numberOrZero(market.open);
        const changePercent = open > 0 ? round2(((ltp - open) / open) * 100) : 0;

        return {
          id: market._id ?? "",
          symbol: symbolFromTitle(market.title),
          name: market.title || "0",
          price: ltp,
          changePercent,
          type: changePercent > 0 ? "GAINER" : changePercent < 0 ? "LOSER" : "TRENDING",
          sentiment: changePercent > 0 ? "BULLISH" : changePercent < 0 ? "BEARISH" : "NEUTRAL",
          sparkline: [
            numberOrZero(market.open),
            numberOrZero(market.low),
            numberOrZero(market.ltp),
            numberOrZero(market.high),
          ],
        } satisfies MarketMover;
      })
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  },

  getOpportunities: async (): Promise<Opportunity[]> => {
    return [];
  },

  getIntelligenceFeed: async (): Promise<Signal[]> => {
    return [];
  },
};

async function fetchAllMarkets(): Promise<BackendMarket[]> {
  const response = await apiClient.get<{ success: boolean; data: BackendMatch[] }>("/v1/matches/home");
  const matches = response.data.data ?? [];
  const results = await Promise.allSettled(
    matches.map((match) =>
      apiClient.get<{ success: boolean; data: BackendMarket[] }>(`/v1/matches/${match._id}/markets`)
    )
  );

  return results
    .flatMap((result, index) => {
      if (result.status !== "fulfilled") return [];
      const match = matches[index];
      return (result.value.data.data ?? []).map((market) => ({ market, match }));
    })
    .sort((a, b) => {
      const priority = matchPriority(a.match?.status) - matchPriority(b.match?.status);
      if (priority !== 0) return priority;
      return new Date(a.match?.startTime ?? 0).getTime() - new Date(b.match?.startTime ?? 0).getTime();
    })
    .map((entry) => entry.market);
}

function symbolFromTitle(title?: string | null): string {
  const words = (title || "0")
    .split(/[\s/_-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (words.length === 0) return "0";
  return words.map((word) => word[0]).join("").toUpperCase() || "0";
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function round2(value: number): number {
  return Math.round(numberOrZero(value) * 100) / 100;
}

function matchPriority(status?: string | null) {
  const normalized = (status ?? "").toLowerCase();
  if (normalized === "live") return 0;
  if (normalized === "innings_break") return 1;
  if (normalized === "upcoming") return 2;
  return 3;
}
