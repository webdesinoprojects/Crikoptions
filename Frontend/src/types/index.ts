export * from "./player";
export * from "./team";
export * from "./match";
export * from "./market";
export * from "./quote";
export * from "./order";
export * from "./trade";
export * from "./position";
export * from "./portfolio";
export * from "./signal";
export * from "./alert";
export * from "./watchlist";
export * from "./dna";

// Legacy Sprint 1 types for Dashboard
export interface PortfolioSummary {
  totalEquity: number;
  dailyPnL: number;
  dailyPnLPercentage: number;
  marginAvailable: number;
  marginUsed: number;
  marginUsagePct: number;
  openPositionsCount: number;
}

export interface TickerItem {
  id: string;
  symbol: string;
  lastTradedPrice: number;
  priceChange: number;
  percentageChange: number;
  trend: "UP" | "DOWN" | "NEUTRAL";
}

export interface MarketMover {
  id: string;
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  type: "GAINER" | "LOSER" | "TRENDING";
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  sparkline: number[];
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: "BREAKOUT" | "DNA_MISMATCH" | "SENTIMENT_DIVERGENCE";
  confidence: number;
  targetPrice: number;
  currentPrice: number;
}

export type SignalLegacy = Record<string, never>;
