import React from "react";
import { useMarketDepth } from "../hooks";
import { useTerminalStore } from "@/stores/terminal.store";
import { DataSourceBadge } from "@/components/shared/DataSourceBadge";

interface OrderBookProps {
  marketId: string;
}

export const OrderBook = React.memo(({ marketId }: OrderBookProps) => {
  const { data: depth, isLoading } = useMarketDepth(marketId);
  const setSelectedPrice = useTerminalStore((state) => state.setSelectedPrice);

  if (isLoading || !depth) {
    return <div className="h-48 flex items-center justify-center text-outline text-[11px]">Loading OrderBook...</div>;
  }

  // Calculate max quantity for depth bars
  const maxQty = Math.max(
    ...depth.bids.map((b) => b.quantity),
    ...depth.asks.map((a) => a.quantity),
    1
  );

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col h-full">
      <div className="bg-surface px-3 py-2 border-b border-outline-variant flex justify-between items-center">
        <span className="font-label-sm text-label-sm font-bold text-on-surface">Order Book</span>
        <DataSourceBadge source="api" />
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        <table className="w-full text-[11px] font-data-tabular">
          <thead>
            <tr className="text-on-surface-variant border-b border-outline-variant">
              <th className="text-left font-normal pb-1">Price</th>
              <th className="text-right font-normal pb-1">Qty</th>
            </tr>
          </thead>
          <tbody>
            {/* Asks (Sells) - Red, displayed from highest price to lowest price */}
            {depth.asks.slice().reverse().map((ask, i) => (
              <tr 
                key={`ask-${i}`} 
                className="text-bear-red hover:bg-bear-red/10 cursor-pointer transition-colors relative group"
                onClick={() => setSelectedPrice(ask.price)}
              >
                <td className="py-0.5 z-10 relative">{ask.price.toFixed(2)}</td>
                <td className="text-right py-0.5 z-10 relative">{ask.quantity.toLocaleString()}</td>
                <td className="absolute right-0 top-0 bottom-0 bg-bear-red/10 z-0 transition-all" style={{ width: `${(ask.quantity / maxQty) * 100}%` }} />
              </tr>
            ))}
            
            {/* Spread Row */}
            <tr className="bg-surface-container">
              <td colSpan={2} className="py-1 text-center text-[10px] text-on-surface-variant font-bold border-y border-outline-variant">
                Spread: {depth.spread.toFixed(2)}
              </td>
            </tr>

            {/* Bids (Buys) - Green, displayed from highest price to lowest price */}
            {depth.bids.map((bid, i) => (
              <tr 
                key={`bid-${i}`} 
                className="text-bull-green hover:bg-bull-green/10 cursor-pointer transition-colors relative group"
                onClick={() => setSelectedPrice(bid.price)}
              >
                <td className="py-0.5 z-10 relative">{bid.price.toFixed(2)}</td>
                <td className="text-right py-0.5 z-10 relative">{bid.quantity.toLocaleString()}</td>
                <td className="absolute right-0 top-0 bottom-0 bg-bull-green/10 z-0 transition-all" style={{ width: `${(bid.quantity / maxQty) * 100}%` }} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

OrderBook.displayName = "OrderBook";
