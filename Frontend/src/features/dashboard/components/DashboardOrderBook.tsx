"use client";

import React, { useMemo } from "react";
import { useMarketDepth } from "@/features/trading/hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardOrderBook() {
  // Use market-1 as default featured market for the dashboard
  const { data, isLoading } = useMarketDepth("market-1");

  const spreadInfo = useMemo(() => {
    if (!data || data.bids.length === 0 || data.asks.length === 0) return { spread: 0, percent: 0 };
    const bestBid = data.bids[0].price;
    const bestAsk = data.asks[0].price;
    const spread = bestAsk - bestBid;
    const percent = (spread / bestAsk) * 100;
    return { spread: parseFloat(spread.toFixed(2)), percent: parseFloat(percent.toFixed(2)) };
  }, [data]);

  if (isLoading) {
    return (
      <TerminalPanel title="Live Order Book" className="h-[280px]" subtitle="Featured Market: MSDHONI">
        <div className="space-y-2 flex-1 flex flex-col justify-center">
          <Skeleton className="h-4 w-full bg-white/5" />
          <Skeleton className="h-4 w-[80%] bg-white/5" />
          <Skeleton className="h-4 w-[90%] bg-white/5" />
          <Skeleton className="h-4 w-[70%] bg-white/5" />
        </div>
      </TerminalPanel>
    );
  }

  const bids = data?.bids.slice(0, 5) || [];
  const asks = data?.asks.slice(0, 5) || [];

  return (
    <TerminalPanel
      title="Live Order Book"
      subtitle="Featured Market: MSDHONI"
      className="h-[280px] text-xs font-data-tabular"
      headerActions={
        <div className="text-[10px] text-on-surface-variant flex items-center gap-1.5 font-bold">
          <span>SPREAD: <span className="text-white">₹{spreadInfo.spread}</span></span>
          <span className="text-primary">({spreadInfo.percent}%)</span>
        </div>
      }
    >
      <div className="flex-1 flex flex-col justify-between min-h-0 select-none">
        {/* Asks (Sell Side) - rendered top-to-bottom or bottom-to-top (standard is asks top, bids bottom) */}
        <div className="flex flex-col gap-0.5 flex-1 justify-end pb-1.5 border-b border-outline/5">
          {asks.slice().reverse().map((ask, idx) => {
            const total = ask.quantity * ask.price;
            return (
              <div key={`ask-${idx}`} className="flex justify-between items-center py-0.5 hover:bg-white/5 px-1 rounded transition-colors">
                <span className="text-bear-red font-bold">₹{ask.price.toFixed(2)}</span>
                <span className="text-on-surface-variant">{ask.quantity}</span>
                <span className="text-on-surface-variant/70">₹{total.toLocaleString()}</span>
              </div>
            );
          })}
        </div>

        {/* Spread divider in middle */}
        <div className="py-1 px-1 flex justify-between items-center bg-surface-dim border-y border-outline/5 text-[10px] text-on-surface-variant font-bold">
          <span>MID POINT</span>
          <span className="text-white">
            ₹{(((data?.bids[0]?.price || 0) + (data?.asks[0]?.price || 0)) / 2).toFixed(2)}
          </span>
        </div>

        {/* Bids (Buy Side) */}
        <div className="flex flex-col gap-0.5 flex-1 pt-1.5 justify-start">
          {bids.map((bid, idx) => {
            const total = bid.quantity * bid.price;
            return (
              <div key={`bid-${idx}`} className="flex justify-between items-center py-0.5 hover:bg-white/5 px-1 rounded transition-colors">
                <span className="text-bull-green font-bold">₹{bid.price.toFixed(2)}</span>
                <span className="text-on-surface-variant">{bid.quantity}</span>
                <span className="text-on-surface-variant/70">₹{total.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </TerminalPanel>
  );
}
