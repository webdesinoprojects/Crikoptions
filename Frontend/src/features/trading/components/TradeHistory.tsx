"use client";

import React from "react";
import { useTradeHistory } from "../hooks";
import { DataSourceBadge } from "@/components/shared/DataSourceBadge";

interface TradeHistoryProps {
  marketId: string;
}

export const TradeHistory = React.memo(({ marketId }: TradeHistoryProps) => {
  const { data: trades, isLoading } = useTradeHistory(marketId);

  if (isLoading || !trades) {
    return <div className="h-48 flex items-center justify-center text-outline text-[11px]">Loading History...</div>;
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col h-full">
      <div className="bg-surface px-3 py-2 border-b border-outline-variant flex justify-between items-center">
        <span className="font-label-sm text-label-sm font-bold">Trade History</span>
        <DataSourceBadge source="api" />
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        <table className="w-full text-[11px] font-data-tabular">
          <thead>
            <tr className="text-on-surface-variant border-b border-outline-variant">
              <th className="text-left font-normal pb-1">Price</th>
              <th className="text-center font-normal pb-1">Qty</th>
              <th className="text-right font-normal pb-1">Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => {
              const date = new Date(trade.timestamp);
              const timeString = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
              const isBuy = trade.makerSide === "BUY";
              
              return (
                <tr key={trade.id} className="hover:bg-surface-container transition-colors">
                  <td className={isBuy ? "text-bull-green py-1" : "text-bear-red py-1"}>
                    {trade.price.toFixed(2)}
                  </td>
                  <td className="text-center py-1">{trade.quantity.toLocaleString()}</td>
                  <td className="text-right text-on-surface-variant py-1">{timeString}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

TradeHistory.displayName = "TradeHistory";
