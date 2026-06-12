"use client";

import React, { useMemo, useState } from "react";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { useLiveTicker } from "@/features/dashboard/hooks";
import { useCreateOrder, useMarketDetail } from "@/features/trading/hooks";
import { toast } from "sonner";

export function DashboardTradeTicket() {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [marketId, setMarketId] = useState("");
  const [qty, setQty] = useState(0);
  const [price, setPrice] = useState(0);

  const { data: tickers } = useLiveTicker();
  const selectedMarketId = marketId || tickers?.[0]?.id || "";
  const selectedTicker = useMemo(
    () => tickers?.find((ticker) => ticker.id === selectedMarketId),
    [selectedMarketId, tickers]
  );
  const { data: market } = useMarketDetail(selectedMarketId);
  const createOrderMutation = useCreateOrder();
  const backendPrice = selectedTicker?.lastTradedPrice ?? 0;
  const effectivePrice = price > 0 ? price : backendPrice;

  const handleTrade = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMarketId || !market?.matchId || qty <= 0 || effectivePrice <= 0) {
      toast.error("No valid backend market, quantity, or price selected");
      return;
    }

    createOrderMutation.mutate(
      {
        matchId: market.matchId,
        marketId: selectedMarketId,
        side: side.toLowerCase() as "buy" | "sell",
        quantity: qty,
        price: effectivePrice,
      },
      {
        onSuccess: () => {
          toast.success(`Order placed: ${side} ${qty} ${selectedTicker?.symbol ?? "0"} @ Rs ${effectivePrice}`);
        },
        onError: (err: unknown) => {
          const errMsg = getErrorMessage(err, "Failed to place order");
          toast.error(`Error: ${errMsg}`);
        },
      }
    );
  };

  return (
    <TerminalPanel title="Quick Trade Ticket" subtitle="Backend order routing" className="h-[260px] text-xs">
      <form onSubmit={handleTrade} className="flex-1 flex flex-col justify-between min-h-0 select-none">
        <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-surface-dim border border-outline/5 rounded">
          {(["BUY", "SELL"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSide(option)}
              className={`py-1 text-[10px] font-bold rounded transition-all ${
                side === option
                  ? option === "BUY"
                    ? "bg-bull-green text-white"
                    : "bg-bear-red text-white"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="space-y-1.5 mt-2 flex-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase font-bold text-on-surface-variant tracking-wider">Symbol</label>
              <select
                value={selectedMarketId}
                onChange={(e) => {
                  setMarketId(e.target.value);
                  setPrice(0);
                }}
                className="bg-surface-dim border border-outline/10 rounded px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary font-bold font-data-tabular"
              >
                <option value="">0</option>
                {tickers?.map((ticker) => (
                  <option key={ticker.id} value={ticker.id}>
                    {ticker.symbol}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase font-bold text-on-surface-variant tracking-wider">Limit Price (Rs)</label>
              <input
                type="number"
                step="0.05"
                value={price || backendPrice}
                onChange={(e) => setPrice(Number.parseFloat(e.target.value) || 0)}
                className="bg-surface-dim border border-outline/10 rounded px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary font-data-tabular"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase font-bold text-on-surface-variant tracking-wider">Quantity</label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Number.parseInt(e.target.value, 10) || 0)}
                className="bg-surface-dim border border-outline/10 rounded px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary font-data-tabular"
              />
            </div>
            <div className="flex flex-col gap-0.5 justify-end">
              <div className="bg-surface-dim border border-outline/10 rounded p-1.5 flex justify-between items-center text-[9px]">
                <span className="text-on-surface-variant">Margin:</span>
                <span className="font-bold text-white font-data-tabular">Rs {(qty * effectivePrice).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={createOrderMutation.isPending || !selectedMarketId}
          className={`w-full py-1.5 mt-2 rounded text-[10px] font-bold text-white transition-all uppercase tracking-wider ${
            side === "BUY" ? "bg-bull-green hover:bg-bull-green/90" : "bg-bear-red hover:bg-bear-red/90"
          } disabled:opacity-50`}
        >
          {createOrderMutation.isPending ? "Placing..." : `PLACE ${side} ORDER`}
        </button>
      </form>
    </TerminalPanel>
  );
}

function getErrorMessage(error: unknown, defaultMessage: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }
  return defaultMessage;
}
