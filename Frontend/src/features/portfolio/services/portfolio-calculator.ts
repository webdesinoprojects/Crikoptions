// ─────────────────────────────────────────────────────────────────────────────
// Portfolio Calculator
// Pure functions — no React, no side effects, no API calls.
// All PnL math lives here. Components consume derived PortfolioSummary only.
// ─────────────────────────────────────────────────────────────────────────────

import { Order } from "@/types";
import {
  PortfolioSummary,
  PortfolioPosition,
  ClosedTrade,
  EquityCurvePoint,
  RiskMetrics,
} from "../types/portfolio";

/** Simulated base capital (₹ 1,00,000) */
const BASE_CAPITAL = 100_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function symbolFromMarketId(marketId: string): string {
  // Market IDs typically are slugs like "ipl-msdhoni-runs" — extract and uppercase
  const parts = marketId.split("-");
  if (parts.length >= 2) return parts[1].toUpperCase();
  return marketId.toUpperCase().slice(0, 8);
}

function matchNameFromMatchId(matchId: string): string {
  return matchId
    ? matchId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "Unknown Match";
}

// ---------------------------------------------------------------------------
// Step 1 — Group FILLED orders into open positions
// ---------------------------------------------------------------------------

interface RawPosition {
  marketId: string;
  matchId: string;
  totalBuyQty: number;
  totalSellQty: number;
  weightedBuyPrice: number;
  weightedSellPrice: number;
  openedAt: string;
}

function groupOrdersIntoPositions(orders: Order[]): RawPosition[] {
  const map = new Map<string, RawPosition>();

  const filled = orders.filter((o) => o.status === "FILLED");

  for (const o of filled) {
    const matchId = (o as any).matchId || "unknown";
    const key = o.marketId;

    if (!map.has(key)) {
      map.set(key, {
        marketId: o.marketId,
        matchId,
        totalBuyQty: 0,
        totalSellQty: 0,
        weightedBuyPrice: 0,
        weightedSellPrice: 0,
        openedAt: o.createdAt,
      });
    }

    const pos = map.get(key)!;
    const qty = o.filledQuantity || o.quantity;
    const price = o.price || 0;

    if (o.side === "BUY") {
      const prevTotal = pos.weightedBuyPrice * pos.totalBuyQty;
      pos.totalBuyQty += qty;
      pos.weightedBuyPrice =
        pos.totalBuyQty > 0 ? (prevTotal + price * qty) / pos.totalBuyQty : 0;
    } else {
      const prevTotal = pos.weightedSellPrice * pos.totalSellQty;
      pos.totalSellQty += qty;
      pos.weightedSellPrice =
        pos.totalSellQty > 0
          ? (prevTotal + price * qty) / pos.totalSellQty
          : 0;
    }

    // Track earliest opened date
    if (new Date(o.createdAt) < new Date(pos.openedAt)) {
      pos.openedAt = o.createdAt;
    }
  }

  return Array.from(map.values());
}

// ---------------------------------------------------------------------------
// Step 2 — Build PortfolioPosition (open) and ClosedTrade (closed) lists
// ---------------------------------------------------------------------------

function buildPositions(
  raws: RawPosition[],
  currentPriceMap: Map<string, number>
): { open: PortfolioPosition[]; closed: ClosedTrade[] } {
  const open: PortfolioPosition[] = [];
  const closed: ClosedTrade[] = [];

  for (const raw of raws) {
    const netQty = raw.totalBuyQty - raw.totalSellQty;
    const livePrice =
      currentPriceMap.get(raw.marketId) ||
      (netQty >= 0 ? raw.weightedBuyPrice : raw.weightedSellPrice);

    if (Math.abs(netQty) < 0.001) {
      // Position fully closed — realize PnL
      const entryPrice = raw.weightedBuyPrice;
      const exitPrice = raw.weightedSellPrice;
      const qty = Math.min(raw.totalBuyQty, raw.totalSellQty);
      const realizedPnL = (exitPrice - entryPrice) * qty;
      const realizedPnLPct =
        entryPrice > 0 ? (realizedPnL / (entryPrice * qty)) * 100 : 0;

      closed.push({
        orderId: raw.marketId, // used as key
        marketId: raw.marketId,
        symbol: symbolFromMarketId(raw.marketId),
        matchName: matchNameFromMatchId(raw.matchId),
        side: "BUY",
        quantity: qty,
        entryPrice,
        exitPrice,
        realizedPnL,
        realizedPnLPct,
        openedAt: raw.openedAt,
        closedAt: new Date().toISOString(),
        holdingPeriodMs:
          new Date().getTime() - new Date(raw.openedAt).getTime(),
      });
    } else {
      // Open position
      const side: PortfolioPosition["side"] = netQty > 0 ? "BUY" : "SELL";
      const qty = Math.abs(netQty);
      const avgEntry = side === "BUY" ? raw.weightedBuyPrice : raw.weightedSellPrice;
      const unrealizedPnL =
        side === "BUY"
          ? (livePrice - avgEntry) * qty
          : (avgEntry - livePrice) * qty;
      const unrealizedPnLPct =
        avgEntry > 0 ? (unrealizedPnL / (avgEntry * qty)) * 100 : 0;
      const notional = qty * livePrice;

      open.push({
        marketId: raw.marketId,
        symbol: symbolFromMarketId(raw.marketId),
        matchName: matchNameFromMatchId(raw.matchId),
        side,
        quantity: qty,
        averageEntryPrice: avgEntry,
        currentPrice: livePrice,
        unrealizedPnL,
        unrealizedPnLPct,
        notional,
        allocation: 0, // filled after total notional is known
        openedAt: raw.openedAt,
      });
    }
  }

  // Fill allocation %
  const totalNotional = open.reduce((acc, p) => acc + p.notional, 0);
  if (totalNotional > 0) {
    for (const p of open) {
      p.allocation = (p.notional / totalNotional) * 100;
    }
  }

  return { open, closed };
}

// ---------------------------------------------------------------------------
// Step 3 — Build equity curve from closed trade timeline
// ---------------------------------------------------------------------------

function buildEquityCurve(
  closedTrades: ClosedTrade[],
  baseCapital: number
): EquityCurvePoint[] {
  if (closedTrades.length === 0) {
    const now = Math.floor(Date.now() / 1000);
    return [{ timestamp: now - 86400, equity: baseCapital, drawdown: 0 }];
  }

  const sorted = [...closedTrades].sort(
    (a, b) => new Date(a.closedAt).getTime() - new Date(b.closedAt).getTime()
  );

  let runningEquity = baseCapital;
  let peakEquity = baseCapital;
  const curve: EquityCurvePoint[] = [
    {
      timestamp: Math.floor(new Date(sorted[0].openedAt).getTime() / 1000) - 3600,
      equity: baseCapital,
      drawdown: 0,
    },
  ];

  for (const trade of sorted) {
    runningEquity += trade.realizedPnL;
    if (runningEquity > peakEquity) peakEquity = runningEquity;
    const drawdown =
      peakEquity > 0 ? ((peakEquity - runningEquity) / peakEquity) * 100 : 0;

    curve.push({
      timestamp: Math.floor(new Date(trade.closedAt).getTime() / 1000),
      equity: runningEquity,
      drawdown,
    });
  }

  return curve;
}

// ---------------------------------------------------------------------------
// Step 4 — Risk Metrics
// ---------------------------------------------------------------------------

function computeRiskMetrics(
  positions: PortfolioPosition[],
  totalEquity: number
): RiskMetrics {
  if (positions.length === 0) {
    return {
      maxConcentration: 0,
      diversificationScore: 0,
      leverageRatio: 0,
      portfolioVolatility: 0,
      stressTestLoss: 0,
    };
  }

  const totalNotional = positions.reduce((s, p) => s + p.notional, 0);
  const maxConcentration =
    totalEquity > 0
      ? (Math.max(...positions.map((p) => p.notional)) / totalEquity) * 100
      : 0;
  const leverageRatio = totalEquity > 0 ? totalNotional / totalEquity : 0;
  const stressTestLoss = totalNotional * 0.2; // 20% drop scenario

  // Volatility approximation: avg of absolute unrealizedPnLPct
  const portfolioVolatility =
    positions.reduce((s, p) => s + Math.abs(p.unrealizedPnLPct), 0) /
    positions.length;

  return {
    maxConcentration,
    diversificationScore: positions.length,
    leverageRatio,
    portfolioVolatility,
    stressTestLoss,
  };
}

// ---------------------------------------------------------------------------
// Main aggregation entry point
// ---------------------------------------------------------------------------

export function computePortfolioSummary(
  orders: Order[],
  currentPriceMap: Map<string, number>
): PortfolioSummary {
  const raws = groupOrdersIntoPositions(orders);
  const { open: positions, closed: closedTrades } = buildPositions(
    raws,
    currentPriceMap
  );

  const totalUnrealizedPnL = positions.reduce((s, p) => s + p.unrealizedPnL, 0);
  const totalRealizedPnL = closedTrades.reduce((s, t) => s + t.realizedPnL, 0);
  const totalPnL = totalUnrealizedPnL + totalRealizedPnL;

  const totalEquity = BASE_CAPITAL + totalPnL;
  const totalPnLPct = (totalPnL / BASE_CAPITAL) * 100;

  // Daily PnL: closed trades + unrealized from positions opened today
  const dailyRealized = closedTrades
    .filter((t) => isToday(t.closedAt))
    .reduce((s, t) => s + t.realizedPnL, 0);
  const dailyUnrealized = positions
    .filter((p) => isToday(p.openedAt))
    .reduce((s, p) => s + p.unrealizedPnL, 0);
  const dailyPnL = dailyRealized + dailyUnrealized;
  const dailyPnLPct = (dailyPnL / BASE_CAPITAL) * 100;

  // Win rate from closed trades
  const wins = closedTrades.filter((t) => t.realizedPnL > 0);
  const losses = closedTrades.filter((t) => t.realizedPnL <= 0);
  const winRate =
    closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
  const avgWin =
    wins.length > 0 ? wins.reduce((s, t) => s + t.realizedPnL, 0) / wins.length : 0;
  const avgLoss =
    losses.length > 0
      ? losses.reduce((s, t) => s + Math.abs(t.realizedPnL), 0) / losses.length
      : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

  const usedMargin = positions.reduce((s, p) => s + p.notional, 0);
  const availableMargin = Math.max(0, BASE_CAPITAL - usedMargin);

  const equityCurve = buildEquityCurve(closedTrades, BASE_CAPITAL);
  const riskMetrics = computeRiskMetrics(positions, totalEquity);

  return {
    totalEquity,
    baseCapital: BASE_CAPITAL,
    totalUnrealizedPnL,
    totalRealizedPnL,
    totalPnL,
    totalPnLPct,
    dailyPnL,
    dailyPnLPct,
    openPositionsCount: positions.length,
    closedTradesCount: closedTrades.length,
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    availableMargin,
    usedMargin,
    positions,
    closedTrades,
    equityCurve,
    riskMetrics,
  };
}
