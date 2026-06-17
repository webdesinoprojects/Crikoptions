import React from "react";
import { DataSourceBadge } from "@/components/shared/DataSourceBadge";
import { useTerminalStore } from "@/stores/terminal.store";
import { useMarketDepth } from "../hooks";

interface OrderBookProps {
  marketId: string;
}

export const OrderBook = React.memo(({ marketId }: OrderBookProps) => {
  const { data: depth, isLoading } = useMarketDepth(marketId);
  const setSelectedPrice = useTerminalStore((state) => state.setSelectedPrice);

  if (isLoading || !depth) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-md flex h-full min-h-[180px] items-center justify-center text-[11px] text-outline">
        Loading order book...
      </div>
    );
  }

  const asks = depth.asks.slice().reverse();
  const bids = depth.bids;
  const maxQty = Math.max(...bids.map((bid) => bid.quantity), ...asks.map((ask) => ask.quantity), 1);
  const isCrossed = depth.spread < 0;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-md overflow-hidden flex h-full min-h-[180px] flex-col">
      <div className="bg-surface px-3 py-1.5 border-b border-outline-variant flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-on-surface">Order Book</h3>
          <p className="text-[10px] text-on-surface-variant">Live market depth</p>
        </div>
        <DataSourceBadge source="api" />
      </div>

      <div className="grid grid-cols-[1fr_90px] border-b border-outline-variant bg-surface-container-high px-3 py-1.5 text-[10px] uppercase tracking-wide text-on-surface-variant">
        <span>Price</span>
        <span className="text-right">Qty</span>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5">
        <div className="space-y-0.5">
          {asks.map((ask, index) => (
            <DepthRow
              key={`ask-${index}`}
              price={ask.price}
              quantity={ask.quantity}
              maxQty={maxQty}
              tone="ask"
              onSelect={() => setSelectedPrice(ask.price)}
            />
          ))}

          <div className="my-1 rounded border border-outline-variant bg-surface-container px-2 py-0.5 text-center text-[10px] font-semibold text-on-surface-variant">
            {isCrossed ? "Crossed" : "Spread"} {Math.abs(depth.spread).toFixed(2)}
          </div>

          {bids.map((bid, index) => (
            <DepthRow
              key={`bid-${index}`}
              price={bid.price}
              quantity={bid.quantity}
              maxQty={maxQty}
              tone="bid"
              onSelect={() => setSelectedPrice(bid.price)}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

OrderBook.displayName = "OrderBook";

function DepthRow({
  price,
  quantity,
  maxQty,
  tone,
  onSelect,
}: {
  price: number;
  quantity: number;
  maxQty: number;
  tone: "bid" | "ask";
  onSelect: () => void;
}) {
  const width = `${Math.max(8, (quantity / maxQty) * 100)}%`;
  const isBid = tone === "bid";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="relative grid h-6 w-full grid-cols-[1fr_90px] overflow-hidden rounded px-2 text-left font-data-tabular text-[11px] transition-colors hover:bg-white/5"
    >
      <span
        className={`absolute inset-y-0 right-0 ${isBid ? "bg-teal-400/10" : "bg-red-400/10"}`}
        style={{ width }}
      />
      <span className={`relative z-[1] flex items-center font-semibold ${isBid ? "text-teal-300" : "text-red-400"}`}>
        {price.toFixed(2)}
      </span>
      <span className="relative z-[1] flex items-center justify-end text-on-surface-variant">
        {quantity.toLocaleString()}
      </span>
    </button>
  );
}
