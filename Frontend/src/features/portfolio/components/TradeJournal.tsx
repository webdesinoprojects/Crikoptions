"use client";

import React, { useState } from "react";
import { usePortfolio } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { Skeleton } from "@/components/ui/skeleton";

type FilterType = "ALL" | "WIN" | "LOSS";

export function TradeJournal() {
  const { data, isLoading } = usePortfolio();
  const [filter, setFilter] = useState<FilterType>("ALL");

  const trades = data?.closedTrades ?? [];

  const filtered = trades.filter((t) => {
    if (filter === "WIN") return t.realizedPnL > 0;
    if (filter === "LOSS") return t.realizedPnL <= 0;
    return true;
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime()
  );

  function formatDuration(ms: number): string {
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  }

  return (
    <TerminalPanel
      density="dense"
      title="Closed Trades Journal"
      subtitle="Historical realized outcomes"
      className="h-[300px]"
      headerActions={
        <div className="flex gap-1 p-0.5 bg-surface-dim border border-outline/5 rounded">
          {(["ALL", "WIN", "LOSS"] as FilterType[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`text-[9px] font-bold px-2 py-0.5 rounded transition-all ${
                filter === f
                  ? f === "WIN"
                    ? "bg-bull-green/20 text-bull-green"
                    : f === "LOSS"
                    ? "bg-bear-red/20 text-bear-red"
                    : "bg-white/10 text-white"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {f}
            </button>
          ))}
          <span className="ml-1 self-center text-[9px] text-on-surface-variant font-data-tabular font-bold">
            ({sorted.length})
          </span>
        </div>
      }
    >
      <div className="flex-1 overflow-y-auto text-xs font-data-tabular min-h-0 select-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[9px] uppercase tracking-wider text-on-surface-variant border-b border-outline/10 font-bold">
              <th className="pb-1.5 font-bold">Symbol</th>
              <th className="pb-1.5 font-bold text-center w-12">Side</th>
              <th className="pb-1.5 font-bold text-right">Entry</th>
              <th className="pb-1.5 font-bold text-right">Exit</th>
              <th className="pb-1.5 font-bold text-right">Qty</th>
              <th className="pb-1.5 font-bold text-right">Realized PnL</th>
              <th className="pb-1.5 font-bold text-right">PnL %</th>
              <th className="pb-1.5 font-bold text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="py-2">
                      <Skeleton className="h-4 w-full bg-white/5" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-on-surface-variant font-sans">
                  No realized trades in this filter
                </td>
              </tr>
            ) : (
              sorted.map((trade, idx) => {
                const isWin = trade.realizedPnL > 0;
                const pnlColor = isWin ? "text-bull-green" : "text-bear-red";
                const sideBg =
                  trade.side === "BUY"
                    ? "bg-bull-green/10 text-bull-green"
                    : "bg-bear-red/10 text-bear-red";

                return (
                  <tr key={`${trade.orderId}-${idx}`} className="hover:bg-white/5 group transition-colors">
                    <td className="py-1">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{trade.symbol}</span>
                        <span className="text-[8px] text-on-surface-variant font-sans uppercase font-medium">{trade.matchName}</span>
                      </div>
                    </td>
                    <td className="py-1 text-center">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${sideBg}`}>
                        {trade.side}
                      </span>
                    </td>
                    <td className="py-1 text-right text-on-surface-variant">₹{trade.entryPrice.toFixed(2)}</td>
                    <td className="py-1 text-right text-white">₹{trade.exitPrice.toFixed(2)}</td>
                    <td className="py-1 text-right text-on-surface-variant">{trade.quantity}</td>
                    <td className={`py-1 text-right font-bold ${pnlColor}`}>
                      {isWin ? "+" : ""}₹{Math.abs(trade.realizedPnL).toFixed(2)}
                    </td>
                    <td className={`py-1 text-right font-bold ${pnlColor}`}>
                      {isWin ? "+" : ""}{trade.realizedPnLPct.toFixed(2)}%
                    </td>
                    <td className="py-1 text-right text-on-surface-variant font-medium">
                      {formatDuration(trade.holdingPeriodMs)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </TerminalPanel>
  );
}
