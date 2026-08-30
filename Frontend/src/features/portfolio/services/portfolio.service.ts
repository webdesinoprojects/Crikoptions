import { apiClient } from "@/lib/api/client";
import { PortfolioSummary } from "../types/portfolio";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

class PortfolioService {
  async getPortfolioSummary(): Promise<PortfolioSummary> {
    const response = await apiClient.get<ApiResponse<PortfolioSummary>>("/v1/portfolio/summary");
    return normalizePortfolioSummary(response.data.data);
  }

  async closeAllPositions(): Promise<void> {
    await apiClient.post(`/v1/positions/close-all`);
  }
}

export const portfolioService = new PortfolioService();

function normalizePortfolioSummary(summary: PortfolioSummary): PortfolioSummary {
  const positions = summary.positions ?? [];
  const closedTrades = summary.closedTrades ?? [];

  return {
    ...summary,
    totalEquity: numberOrZero(summary.totalEquity),
    baseCapital: numberOrZero(summary.baseCapital),
    totalUnrealizedPnL: numberOrZero(summary.totalUnrealizedPnL),
    totalRealizedPnL: numberOrZero(summary.totalRealizedPnL),
    totalPnL: numberOrZero(summary.totalPnL),
    totalPnLPct: numberOrZero(summary.totalPnLPct),
    dailyPnL: numberOrZero(summary.dailyPnL),
    dailyPnLPct: numberOrZero(summary.dailyPnLPct),
    openPositionsCount: numberOrZero(summary.openPositionsCount),
    closedTradesCount: numberOrZero(summary.closedTradesCount),
    winRate: numberOrZero(summary.winRate),
    avgWin: numberOrZero(summary.avgWin),
    avgLoss: numberOrZero(summary.avgLoss),
    profitFactor: numberOrZero(summary.profitFactor),
    streak: numberOrZero(summary.streak),
    availableMargin: numberOrZero(summary.availableMargin),
    usedMargin: numberOrZero(summary.usedMargin),
    marginUsagePct: numberOrZero(summary.marginUsagePct),
    positions,
    closedTrades,
    equityCurve: summary.equityCurve ?? [],
    riskMetrics: {
      maxConcentration: numberOrZero(summary.riskMetrics?.maxConcentration),
      diversificationScore: numberOrZero(summary.riskMetrics?.diversificationScore),
      leverageRatio: numberOrZero(summary.riskMetrics?.leverageRatio),
      portfolioVolatility: numberOrZero(summary.riskMetrics?.portfolioVolatility),
      stressTestLoss: numberOrZero(summary.riskMetrics?.stressTestLoss),
    },
  };
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
