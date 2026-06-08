import { apiClient } from "@/lib/api/client";
import { adaptMatches, adaptMatch, BackendMatch } from "@/lib/adapters/match.adapter";
import {
  PortfolioSummary,
  TickerItem,
  Match,
  MarketMover,
  Opportunity,
  Signal,
} from "@/types";

/**
 * Service layer for the Dashboard. Handles mock and live integrations.
 */
export const dashboardService = {
  fetchHomeMatches: async (): Promise<Match[]> => {
    const response = await apiClient.get<{ success: boolean; data: BackendMatch[] }>("/v1/matches/home");
    return adaptMatches(response.data.data);
  },

  fetchMatchDetails: async (matchId: string): Promise<Match> => {
    const response = await apiClient.get<{ success: boolean; data: BackendMatch }>(`/v1/matches/${matchId}`);
    return adaptMatch(response.data.data);
  },
  getFinancialOverview: async (): Promise<PortfolioSummary> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      totalEquity: 245820.5,
      dailyPnL: 12450.75,
      dailyPnLPercentage: 5.2,
      marginAvailable: 180000.0,
      marginUsed: 65820.5,
      openPositionsCount: 8,
    };
  },

  getLiveTicker: async (): Promise<TickerItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [
      {
        id: "1",
        symbol: "MSDHONI",
        lastTradedPrice: 154.5,
        priceChange: 6.2,
        percentageChange: 4.2,
        trend: "UP",
      },
      {
        id: "2",
        symbol: "VKOHLI",
        lastTradedPrice: 182.1,
        priceChange: -3.3,
        percentageChange: -1.8,
        trend: "DOWN",
      },
      {
        id: "3",
        symbol: "CSK_WIN",
        lastTradedPrice: 65.0,
        priceChange: 2.1,
        percentageChange: 3.3,
        trend: "UP",
      },
      {
        id: "4",
        symbol: "RSHARMA",
        lastTradedPrice: 142.8,
        priceChange: -1.2,
        percentageChange: -0.8,
        trend: "DOWN",
      },
    ];
  },

  getLiveMatches: async (): Promise<Match[]> => {
    return dashboardService.fetchHomeMatches();
  },

  getMarketMovers: async (): Promise<MarketMover[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [
      {
        id: "1",
        symbol: "SAYUB",
        name: "Saim Ayub",
        price: 88.4,
        changePercent: 12.5,
        type: "GAINER",
        sentiment: "BULLISH",
        sparkline: [60, 62, 65, 70, 75, 82, 88.4],
      },
      {
        id: "2",
        symbol: "JBUMRAH",
        name: "Jasprit Bumrah",
        price: 210.5,
        changePercent: 8.2,
        type: "GAINER",
        sentiment: "BULLISH",
        sparkline: [190, 195, 198, 202, 205, 208, 210.5],
      },
      {
        id: "3",
        symbol: "MAXWELL",
        name: "Glenn Maxwell",
        price: 112.0,
        changePercent: -15.4,
        type: "LOSER",
        sentiment: "BEARISH",
        sparkline: [135, 130, 128, 120, 118, 115, 112],
      },
    ];
  },

  getOpportunities: async (): Promise<Opportunity[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [
      {
        id: "o1",
        title: "Suryakumar Yadav Breakout",
        description: "Price approaching resistance at 195. High volume detected.",
        type: "BREAKOUT",
        confidence: 85,
        currentPrice: 192.5,
        targetPrice: 210.0,
      },
      {
        id: "o2",
        title: "CSK Win DNA Mismatch",
        description: "Historical win probability in current state is 75%, market pricing at 65%.",
        type: "DNA_MISMATCH",
        confidence: 92,
        currentPrice: 65.0,
        targetPrice: 75.0,
      },
    ];
  },

  getIntelligenceFeed: async (): Promise<Signal[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [
      {
        id: "s1",
        title: "AI Signal: CSK Bullish Momentum",
        message: "Bullish momentum on CSK player stocks following Dhoni's boundary surge. 68% Buy interest detected.",
        type: "AI_SIGNAL",
        impact: "HIGH",
        recommendation: "BUY",
        timestamp: new Date().toISOString(),
      },
      {
        id: "s2",
        title: "Catalyst: Death Overs Start",
        message: "CSK batting volatility expected to spike. Predicted LTP range: ₹162-175.",
        type: "CATALYST",
        impact: "HIGH",
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: "s3",
        title: "Alert: Volatility Spike",
        message: "Bumrah economy volatility up 12% in the last over.",
        type: "ALERT",
        impact: "MEDIUM",
        timestamp: new Date(Date.now() - 600000).toISOString(),
      },
    ];
  },
};
