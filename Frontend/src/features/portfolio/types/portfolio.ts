// ─────────────────────────────────────────────────────────────────────────────
// Portfolio Domain Model
// Source of truth for all Portfolio Hub components.
// ─────────────────────────────────────────────────────────────────────────────

import { WalletAccount } from "@/features/wallet/types/wallet";

export interface PortfolioPosition {
  id: string;
  marketId: string;
  symbol: string;
  /** Derived from matchId stored in order */
  matchName: string;
  side: "BUY" | "SELL";
  quantity: number;
  averageEntryPrice: number;
  /** Live price from backend market data */
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  /** notional = quantity × currentPrice */
  notional: number;
  /** % of total portfolio notional */
  allocation: number;
  openedAt: string;
}

export interface ClosedTrade {
  orderId: string;
  marketId: string;
  symbol: string;
  matchName: string;
  side: "BUY" | "SELL";
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  realizedPnL: number;
  realizedPnLPct: number;
  openedAt: string;
  closedAt: string;
  holdingPeriodMs: number;
}

export interface EquityCurvePoint {
  /** Unix timestamp in seconds */
  timestamp: number;
  equity: number;
  drawdown: number;
}

export interface RiskMetrics {
  /** % of capital in top-1 position */
  maxConcentration: number;
  /** Count of markets with open exposure */
  diversificationScore: number;
  /** Gross exposure / total equity */
  leverageRatio: number;
  /** Based on 30-day volatility approximation */
  portfolioVolatility: number;
  /** Simple stress test: worst-case 20% drawdown on open positions */
  stressTestLoss: number;
}

export interface PortfolioSummary {
  /** Total capital including unrealized P&L */
  totalEquity: number;
  /** Starting equity or cash deposited when backend provides it */
  baseCapital: number;
  /** Sum of unrealized P&L across open positions */
  totalUnrealizedPnL: number;
  /** Sum of realized P&L from closed trades */
  totalRealizedPnL: number;
  /** Combined PnL */
  totalPnL: number;
  totalPnLPct: number;
  /** PnL attributable to today (approximated from today's orders) */
  dailyPnL: number;
  dailyPnLPct: number;
  openPositionsCount: number;
  closedTradesCount: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  /** Available cash when backend provides it */
  availableMargin: number;
  usedMargin: number;
  wallet: WalletAccount;
  positions: PortfolioPosition[];
  closedTrades: ClosedTrade[];
  equityCurve: EquityCurvePoint[];
  riskMetrics: RiskMetrics;
}
