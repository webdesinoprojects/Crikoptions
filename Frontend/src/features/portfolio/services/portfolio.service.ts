import { apiClient } from "@/lib/api/client";
import { BackendMarket } from "@/lib/adapters/market.adapter";
import { BackendMatch } from "@/lib/adapters/match.adapter";
import {
  ClosedTrade,
  EquityCurvePoint,
  PortfolioPosition,
  PortfolioSummary,
  RiskMetrics,
} from "../types/portfolio";

interface BackendPosition {
  _id: string;
  userId: string;
  matchId: string;
  marketId: string;
  status: "open" | "closed" | string;
  lots: number;
  buyPrice: number;
  sellPrice: number;
  ltp: number;
  pnl: number;
  createdAt: string;
  updatedAt: string;
}

class PortfolioService {
  async getPortfolioSummary(): Promise<PortfolioSummary> {
    const [openPositions, closedPositions] = await Promise.all([
      this.fetchPositions("open"),
      this.fetchPositions("closed"),
    ]);

    const allPositions = [...openPositions, ...closedPositions];
    const marketMap = await this.fetchMarketMap(allPositions.map((position) => position.marketId));
    const matchMap = await this.fetchMatchMap(allPositions.map((position) => position.matchId));

    const positions = openPositions.map((position) =>
      adaptOpenPosition(position, marketMap.get(position.marketId), matchMap.get(position.matchId))
    );
    const closedTrades = closedPositions.map((position) =>
      adaptClosedTrade(position, marketMap.get(position.marketId), matchMap.get(position.matchId))
    );

    const totalUnrealizedPnL = positions.reduce((sum, position) => sum + position.unrealizedPnL, 0);
    const totalRealizedPnL = closedTrades.reduce((sum, trade) => sum + trade.realizedPnL, 0);
    const totalPnL = totalUnrealizedPnL + totalRealizedPnL;
    const dailyPnL =
      positions.filter((position) => isToday(position.openedAt)).reduce((sum, position) => sum + position.unrealizedPnL, 0) +
      closedTrades.filter((trade) => isToday(trade.closedAt)).reduce((sum, trade) => sum + trade.realizedPnL, 0);
    const usedMargin = positions.reduce((sum, position) => sum + position.notional, 0);

    fillAllocations(positions);

    return {
      totalEquity: round2(totalPnL),
      baseCapital: 0,
      totalUnrealizedPnL: round2(totalUnrealizedPnL),
      totalRealizedPnL: round2(totalRealizedPnL),
      totalPnL: round2(totalPnL),
      totalPnLPct: 0,
      dailyPnL: round2(dailyPnL),
      dailyPnLPct: 0,
      openPositionsCount: positions.length,
      closedTradesCount: closedTrades.length,
      winRate: computeWinRate(closedTrades),
      avgWin: average(closedTrades.filter((trade) => trade.realizedPnL > 0).map((trade) => trade.realizedPnL)),
      avgLoss: average(closedTrades.filter((trade) => trade.realizedPnL <= 0).map((trade) => Math.abs(trade.realizedPnL))),
      profitFactor: computeProfitFactor(closedTrades),
      availableMargin: 0,
      usedMargin: round2(usedMargin),
      positions,
      closedTrades,
      equityCurve: buildEquityCurve(closedTrades),
      riskMetrics: computeRiskMetrics(positions, totalPnL),
    };
  }

  private async fetchPositions(status: "open" | "closed"): Promise<BackendPosition[]> {
    const response = await apiClient.get<{ success: boolean; data: BackendPosition[] }>(`/v1/positions/${status}`);
    return response.data.data ?? [];
  }

  private async fetchMarketMap(marketIds: string[]): Promise<Map<string, BackendMarket>> {
    const unique = Array.from(new Set(marketIds.filter(Boolean)));
    const results = await Promise.allSettled(
      unique.map((id) => apiClient.get<{ success: boolean; data: BackendMarket }>(`/v1/markets/${id}`))
    );
    const map = new Map<string, BackendMarket>();

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value.data.data) {
        map.set(unique[index], result.value.data.data);
      }
    });

    return map;
  }

  private async fetchMatchMap(matchIds: string[]): Promise<Map<string, BackendMatch>> {
    const unique = Array.from(new Set(matchIds.filter(Boolean)));
    const results = await Promise.allSettled(
      unique.map((id) => apiClient.get<{ success: boolean; data: BackendMatch }>(`/v1/matches/${id}`))
    );
    const map = new Map<string, BackendMatch>();

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value.data.data) {
        map.set(unique[index], result.value.data.data);
      }
    });

    return map;
  }
}

export const portfolioService = new PortfolioService();

function adaptOpenPosition(
  position: BackendPosition,
  market?: BackendMarket,
  match?: BackendMatch
): PortfolioPosition {
  const side: PortfolioPosition["side"] = numberOrZero(position.lots) >= 0 ? "BUY" : "SELL";
  const quantity = Math.abs(numberOrZero(position.lots));
  const entryPrice = side === "BUY" ? numberOrZero(position.buyPrice) : numberOrZero(position.sellPrice);
  const currentPrice = numberOrZero(position.ltp);
  const notional = quantity * currentPrice;
  const pnl = numberOrZero(position.pnl);

  return {
    marketId: position.marketId,
    symbol: symbolFromMarket(market, position.marketId),
    matchName: matchName(match, position.matchId),
    side,
    quantity,
    averageEntryPrice: round2(entryPrice),
    currentPrice: round2(currentPrice),
    unrealizedPnL: round2(pnl),
    unrealizedPnLPct: entryPrice > 0 && quantity > 0 ? round2((pnl / (entryPrice * quantity)) * 100) : 0,
    notional: round2(notional),
    allocation: 0,
    openedAt: position.createdAt || position.updatedAt || new Date(0).toISOString(),
  };
}

function adaptClosedTrade(position: BackendPosition, market?: BackendMarket, match?: BackendMatch): ClosedTrade {
  const quantity = Math.abs(numberOrZero(position.lots));
  const entryPrice = numberOrZero(position.buyPrice);
  const exitPrice = numberOrZero(position.sellPrice);
  const pnl = numberOrZero(position.pnl);
  const openedAt = position.createdAt || new Date(0).toISOString();
  const closedAt = position.updatedAt || openedAt;

  return {
    orderId: position._id || position.marketId,
    marketId: position.marketId,
    symbol: symbolFromMarket(market, position.marketId),
    matchName: matchName(match, position.matchId),
    side: "BUY",
    quantity,
    entryPrice: round2(entryPrice),
    exitPrice: round2(exitPrice),
    realizedPnL: round2(pnl),
    realizedPnLPct: entryPrice > 0 && quantity > 0 ? round2((pnl / (entryPrice * quantity)) * 100) : 0,
    openedAt,
    closedAt,
    holdingPeriodMs: Math.max(0, new Date(closedAt).getTime() - new Date(openedAt).getTime()),
  };
}

function fillAllocations(positions: PortfolioPosition[]): void {
  const totalNotional = positions.reduce((sum, position) => sum + position.notional, 0);
  positions.forEach((position) => {
    position.allocation = totalNotional > 0 ? round2((position.notional / totalNotional) * 100) : 0;
  });
}

function buildEquityCurve(closedTrades: ClosedTrade[]): EquityCurvePoint[] {
  if (closedTrades.length === 0) {
    return [{ timestamp: Math.floor(Date.now() / 1000), equity: 0, drawdown: 0 }];
  }

  let equity = 0;
  let peak = 0;
  return [...closedTrades]
    .sort((a, b) => new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime())
    .map((trade) => {
      equity += trade.realizedPnL;
      peak = Math.max(peak, equity);
      const drawdown = peak > 0 ? ((peak - equity) / peak) * 100 : 0;
      return {
        timestamp: Math.floor(new Date(trade.closedAt).getTime() / 1000),
        equity: round2(equity),
        drawdown: round2(drawdown),
      };
    });
}

function computeRiskMetrics(positions: PortfolioPosition[], totalEquity: number): RiskMetrics {
  if (positions.length === 0) {
    return {
      maxConcentration: 0,
      diversificationScore: 0,
      leverageRatio: 0,
      portfolioVolatility: 0,
      stressTestLoss: 0,
    };
  }

  const totalNotional = positions.reduce((sum, position) => sum + position.notional, 0);
  return {
    maxConcentration: totalNotional > 0 ? round2(Math.max(...positions.map((position) => position.notional)) / totalNotional * 100) : 0,
    diversificationScore: positions.length,
    leverageRatio: totalEquity > 0 ? round2(totalNotional / totalEquity) : 0,
    portfolioVolatility: round2(average(positions.map((position) => Math.abs(position.unrealizedPnLPct)))),
    stressTestLoss: round2(totalNotional * 0.2),
  };
}

function computeWinRate(closedTrades: ClosedTrade[]): number {
  if (closedTrades.length === 0) return 0;
  return round2((closedTrades.filter((trade) => trade.realizedPnL > 0).length / closedTrades.length) * 100);
}

function computeProfitFactor(closedTrades: ClosedTrade[]): number {
  const grossWin = closedTrades.filter((trade) => trade.realizedPnL > 0).reduce((sum, trade) => sum + trade.realizedPnL, 0);
  const grossLoss = closedTrades.filter((trade) => trade.realizedPnL < 0).reduce((sum, trade) => sum + Math.abs(trade.realizedPnL), 0);
  if (grossLoss === 0) return grossWin > 0 ? Infinity : 0;
  return round2(grossWin / grossLoss);
}

function symbolFromMarket(market: BackendMarket | undefined, marketId: string): string {
  const source = market?.title || marketId || "0";
  const words = source
    .split(/[\s/_-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (words.length === 0) return "0";
  return words.map((word) => word[0]).join("").toUpperCase() || "0";
}

function matchName(match: BackendMatch | undefined, matchId: string): string {
  if (!match) return matchId || "0";
  return `${match.teamAName || "0"} vs ${match.teamBName || "0"}`;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return round2(values.reduce((sum, value) => sum + value, 0) / values.length);
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
