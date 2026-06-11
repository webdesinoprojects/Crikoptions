"use client";

import React, { useState } from "react";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { useCreateOrder } from "@/features/trading/hooks";
import { toast } from "sonner";

export function DashboardTradeTicket() {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [symbol, setSymbol] = useState<string>("MSDHONI");
  const [qty, setQty] = useState<number>(10);
  const [price, setPrice] = useState<number>(154.50);

  const createOrderMutation = useCreateOrder();

  const handleTrade = (e: React.FormEvent) => {
    e.preventDefault();

    const marketId = symbol === "MSDHONI" ? "market-1" : "market-2";

    createOrderMutation.mutate(
      {
        matchId: "1",
        marketId,
        side: side.toLowerCase() as "buy" | "sell",
        quantity: qty,
        price: price,
      },
      {
        onSuccess: (data) => {
          toast.success(`Order Executed: ${side} ${qty} ${symbol} @ ₹${price}`);
        },
        onError: (err: any) => {
          const errMsg = err?.response?.data?.message || "Failed to execute trade";
          toast.error(`Error: ${errMsg}`);
        },
      }
    );
  };

  return (
    <TerminalPanel
      title="Quick Trade Ticket"
      subtitle="Instant order routing terminal"
      className="h-[260px] text-xs"
    >
      <form onSubmit={handleTrade} className="flex-1 flex flex-col justify-between min-h-0 select-none">
        <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-surface-dim border border-outline/5 rounded">
          <button
            type="button"
            onClick={() => setSide("BUY")}
            className={`py-1 text-[10px] font-bold rounded transition-all ${
              side === "BUY" ? "bg-bull-green text-white" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setSide("SELL")}
            className={`py-1 text-[10px] font-bold rounded transition-all ${
              side === "SELL" ? "bg-bear-red text-white" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            SELL
          </button>
        </div>

        <div className="space-y-1.5 mt-2 flex-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase font-bold text-on-surface-variant tracking-wider">Symbol</label>
              <select
                value={symbol}
                onChange={(e) => {
                  const sym = e.target.value;
                  setSymbol(sym);
                  setPrice(sym === "MSDHONI" ? 154.50 : 182.10);
                }}
                className="bg-surface-dim border border-outline/10 rounded px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary font-bold font-data-tabular"
              >
                <option value="MSDHONI">MSDHONI</option>
                <option value="VKOHLI">VKOHLI</option>
              </select>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[8px] uppercase font-bold text-on-surface-variant tracking-wider">Lmt Price (₹)</label>
              <input
                type="number"
                step="0.05"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
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
                onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                className="bg-surface-dim border border-outline/10 rounded px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary font-data-tabular"
              />
            </div>
            <div className="flex flex-col gap-0.5 justify-end">
              <div className="bg-surface-dim border border-outline/10 rounded p-1.5 flex justify-between items-center text-[9px]">
                <span className="text-on-surface-variant">Margin:</span>
                <span className="font-bold text-white font-data-tabular">₹{(qty * price).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={createOrderMutation.isPending}
          className={`w-full py-1.5 mt-2 rounded text-[10px] font-bold text-white transition-all uppercase tracking-wider ${
            side === "BUY" ? "bg-bull-green hover:bg-bull-green/90" : "bg-bear-red hover:bg-bear-red/90"
          } disabled:opacity-50`}
        >
          {createOrderMutation.isPending ? "Executing..." : `EXECUTE ${side} ORDER`}
        </button>
      </form>
    </TerminalPanel>
  );
}
