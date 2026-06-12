import { apiClient } from "@/lib/api/client";
import { adaptMatch, adaptMatches, BackendMatch } from "@/lib/adapters/match.adapter";
import { BackendMarket } from "@/lib/adapters/market.adapter";
import { BackendOrder } from "@/lib/adapters/order.adapter";
import {
  MarketMover,
  Match,
  Opportunity,
  PortfolioSummary,
  Signal,
  TickerItem,
} from "@/types";

interface BackendPosition {
  _id: string;
  matchId: string;
  marketId: string;
  lots: number;
  buyPrice: number;
  sellPrice: number;
  ltp: number;
  pnl: number;
  updatedAt: string;
}

export const dashboardService = {
  fetchHomeMatches: async (): Promise<Match[]> => {
    const response = await apiClient.get<{ success: boolean; data: BackendMatch[] }>("/v1/matches/home");
    return adaptMatches(response.data.data ?? []);
  },

  fetchMatchDetails: async (matchId: string): Promise<Match> => {
    const response = await apiClient.get<{ success: boolean; data: BackendMatch }>(`/v1/matches/${matchId}`);
    return adaptMatch(response.data.data);
  },

  getFinancialOverview: async (): Promise<PortfolioSummary> => {
    const [openPositions, closedPositions, orders] = await Promise.all([
      fetchOpenPositions(),
      fetchClosedPositions(),
      fetchOrders(),
    ]);

    const openPnL = openPositions.reduce((sum, position) => sum + numberOrZero(position.pnl), 0);
    const closedPnL = closedPositions.reduce((sum, position) => sum + numberOrZero(position.pnl), 0);
    const totalPnL = openPnL + closedPnL;
    const usedByPositions = openPositions.reduce(
      (sum, position) => sum + Math.abs(numberOrZero(position.lots)) * numberOrZero(position.ltp),
      0
    );
    const usedByOpenOrders = orders
      .filter((order) => order.status?.toLowerCase() === "open")
      .reduce((sum, order) => sum + numberOrZero(order.price) * numberOrZero(order.quantity), 0);
    const dailyPnL = openPositions
      .filter((position) => isToday(position.updatedAt))
      .reduce((sum, position) => sum + numberOrZero(position.pnl), 0);

    return {
      totalEquity: round2(totalPnL),
      dailyPnL: round2(dailyPnL),
      dailyPnLPercentage: 0,
      marginAvailable: 0,
      marginUsed: round2(usedByPositions + usedByOpenOrders),
      openPositionsCount: openPositions.length,
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
        id: market._id,
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
          id: market._id,
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

  return results.flatMap((result) => (result.status === "fulfilled" ? result.value.data.data ?? [] : []));
}

async function fetchOpenPositions(): Promise<BackendPosition[]> {
  const response = await apiClient.get<{ success: boolean; data: BackendPosition[] }>("/v1/positions/open");
  return response.data.data ?? [];
}

async function fetchClosedPositions(): Promise<BackendPosition[]> {
  const response = await apiClient.get<{ success: boolean; data: BackendPosition[] }>("/v1/positions/closed");
  return response.data.data ?? [];
}

async function fetchOrders(): Promise<BackendOrder[]> {
  const response = await apiClient.get<{ success: boolean; data: BackendOrder[] }>("/v1/orders");
  return response.data.data ?? [];
}

function symbolFromTitle(title: string): string {
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

function isToday(value: string): boolean {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}
