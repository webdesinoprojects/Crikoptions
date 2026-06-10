"use client";

import React from "react";
import { MatchAnalyticsPanel, MarketChart, OrderBook, TradeHistory, OrderEntryForm, PositionSummary } from "@/features/trading/components";
import { useMarketDepth } from "@/features/trading/hooks";

interface PageProps {
  params: Promise<{ marketId: string }>;
}

export default function TradingTerminalPage({ params }: PageProps) {
  const { marketId } = React.use(params);
  const { data: depth, isLoading } = useMarketDepth(marketId);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-on-surface">
        <div className="text-sm font-bold animate-pulse text-outline">Loading Trading Terminal...</div>
      </div>
    );
  }

  // Retrieve matchId from URL mapping or default to 1 (CSK vs MI)
  const matchId = marketId === "market-4" ? "2" : "1";

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden bg-background">
      {/* 3-Column Dense Layout Grid */}
      <div className="flex-grow grid grid-cols-1 xl:grid-cols-12 gap-6 p-4 md:p-6 lg:p-8 overflow-y-auto">
        {/* Left Column - Match Score & Analytics (3/12 width) */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          <MatchAnalyticsPanel matchId={matchId} marketId={marketId} />
        </div>

        {/* Center Column - Candlestick Chart, Order Book, Trade History (6/12 width) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
          {/* Candle Chart wrapper */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col h-[380px]">
            <div className="flex justify-between items-center mb-4">
              <span className="font-label-sm text-label-sm font-bold text-on-surface">Price Action</span>
              <span className="text-[10px] text-bull-green font-bold bg-bull-green/10 px-2 py-0.5 rounded">MSDHONI</span>
            </div>
            <MarketChart marketId={marketId} />
          </div>

          {/* Depth and Tape grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OrderBook marketId={marketId} />
            <TradeHistory marketId={marketId} />
          </div>
        </div>

        {/* Right Column - Execution Form & Positions Summary (3/12 width) */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          <OrderEntryForm matchId={matchId} marketId={marketId} />
          <PositionSummary matchId={matchId} marketId={marketId} />
        </div>
      </div>
    </div>
  );
}
