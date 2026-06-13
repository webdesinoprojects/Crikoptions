"use client";

import React from "react";
import { DataSourceBadge } from "@/components/shared/DataSourceBadge";
import { useTradeHistory } from "../hooks";

interface TradeHistoryProps {
  marketId: string;
}

export const TradeHistory = React.memo(({ marketId }: TradeHistoryProps) => {
  const { data: trades, isLoading } = useTradeHistory(marketId);

  if (isLoading || !trades) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-md flex h-full min-h-[180px] items-center justify-center text-[11px] text-outline">
        Loading trade tape...
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-md overflow-hidden flex h-full min-h-[180px] flex-col">
      <div className="bg-surface px-3 py-1.5 border-b border-outline-variant flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-on-surface">Trade History</h3>
          <p className="text-[10px] text-on-surface-variant">Executed market tape</p>
        </div>
        <DataSourceBadge source="api" />
      </div>

      <div className="grid grid-cols-[1fr_80px_80px] border-b border-outline-variant bg-surface-container-high px-3 py-1.5 text-[10px] uppercase tracking-wide text-on-surface-variant">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Time</span>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5">
        {trades.length === 0 ? (
          <div className="flex h-full min-h-[120px] flex-col items-center justify-center rounded border border-dashed border-outline-variant text-center">
            <span className="text-sm font-semibold text-on-surface">No prints yet</span>
            <span className="mt-1 text-[11px] text-on-surface-variant">Executed orders will appear here.</span>
          </div>
        ) : (
          <div className="space-y-0.5">
            {trades.map((trade) => {
              const date = new Date(trade.timestamp);
              const timeString = `${date.getHours().toString().padStart(2, "0")}:${date
                .getMinutes()
                .toString()
                .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
              const isBuy = trade.makerSide === "BUY";

              return (
                <div
                  key={trade.id}
                  className="grid h-6 grid-cols-[1fr_80px_80px] rounded px-2 font-data-tabular text-[11px] hover:bg-white/5"
                >
                  <span className={`flex items-center font-semibold ${isBuy ? "text-teal-300" : "text-red-400"}`}>
                    {trade.price.toFixed(2)}
                  </span>
                  <span className="flex items-center justify-end text-on-surface">{trade.quantity.toLocaleString()}</span>
                  <span className="flex items-center justify-end text-on-surface-variant">{timeString}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

TradeHistory.displayName = "TradeHistory";
