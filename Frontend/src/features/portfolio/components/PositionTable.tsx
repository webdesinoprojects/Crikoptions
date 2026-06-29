"use client";

import React, { useState } from "react";
import { usePositions, useCloseAllPositions } from "../hooks";
import { Search, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { Skeleton } from "@/components/ui/skeleton";

export function PositionTable() {
  const { data: positions, isLoading } = usePositions();
  const { mutate: closeAll, isPending: isClosingAll } = useCloseAllPositions();
  const [query, setQuery] = useState("");

  const filtered = positions
    ? positions.filter(
        (p) =>
          p.symbol.toLowerCase().includes(query.toLowerCase()) ||
          p.matchName.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <TerminalPanel
      density="dense"
      title="Open Positions Monitor"
      subtitle="Active derivatives exposure tracker"
      className="h-[300px]"
      headerActions={
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search exposure..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-surface-dim border border-outline/10 rounded pl-7 pr-2 py-0.5 text-[10px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary w-40"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                disabled={isClosingAll || !positions || positions.length === 0}
                className="flex items-center gap-1.5 px-3 py-1 bg-bear-red/20 text-bear-red border border-bear-red/30 rounded text-[10px] font-bold hover:bg-bear-red/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-3 h-3" />
                {isClosingAll ? "EXITING..." : "EXIT ALL"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-[#0a0a0a] border border-bear-red/50 shadow-[0_0_15px_rgba(255,42,42,0.15)] rounded">
              <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-bear-red font-bold flex items-center gap-2">
                <LogOut className="w-3.5 h-3.5" /> Confirm Exit All
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <div className="px-2 py-3 text-[11px] text-on-surface-variant space-y-3">
                <p>You are about to close <strong className="text-white">{positions?.length || 0} active positions</strong> immediately at the current market price.</p>
                <DropdownMenuItem asChild onSelect={(e) => { e.preventDefault(); closeAll(); }}>
                  <button
                    className="w-full flex items-center justify-center bg-bear-red text-white hover:bg-bear-red/80 hover:shadow-[0_0_10px_rgba(255,42,42,0.5)] text-xs font-bold py-2 rounded transition-all cursor-pointer border border-transparent hover:border-bear-red"
                  >
                    SELL ALL POSITIONS
                  </button>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
    >
      <div className="flex-1 overflow-y-auto text-xs font-data-tabular min-h-0 select-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[9px] uppercase tracking-wider text-on-surface-variant border-b border-outline/10 font-bold">
              <th className="pb-1.5 font-bold">Symbol</th>
              <th className="pb-1.5 font-bold text-center w-12">Side</th>
              <th className="pb-1.5 font-bold text-right">Qty</th>
              <th className="pb-1.5 font-bold text-right">Entry</th>
              <th className="pb-1.5 font-bold text-right">LTP</th>
              <th className="pb-1.5 font-bold text-right">Unrl PnL</th>
              <th className="pb-1.5 font-bold text-right">PnL %</th>
              <th className="pb-1.5 font-bold text-right w-24">Alloc</th>
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
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-on-surface-variant font-sans">
                  {query ? "No matching positions found" : "No active exposure"}
                </td>
              </tr>
            ) : (
              filtered.map((pos, index) => {
                const isUp = pos.unrealizedPnL >= 0;
                const pnlColor = isUp ? "text-bull-green" : "text-bear-red";
                const sideBg =
                  pos.side === "BUY"
                    ? "bg-bull-green/10 text-bull-green"
                    : "bg-bear-red/10 text-bear-red";

                return (
                  <tr key={pos.id || `${pos.marketId}-${pos.side}-${index}`} className="hover:bg-white/5 group transition-colors">
                    <td className="py-1">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{pos.symbol}</span>
                        <span className="text-[8px] text-on-surface-variant font-sans uppercase font-medium">{pos.matchName}</span>
                      </div>
                    </td>
                    <td className="py-1 text-center">
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${sideBg}`}>
                        {pos.side}
                      </span>
                    </td>
                    <td className="py-1 text-right text-white font-bold">{pos.quantity}</td>
                    <td className="py-1 text-right text-on-surface-variant">₹{pos.averageEntryPrice.toFixed(2)}</td>
                    <td className="py-1 text-right text-white">₹{pos.currentPrice.toFixed(2)}</td>
                    <td className={`py-1 text-right font-bold ${pnlColor}`}>
                      {isUp ? "+" : ""}₹{Math.abs(pos.unrealizedPnL).toFixed(2)}
                    </td>
                    <td className={`py-1 text-right font-bold ${pnlColor}`}>
                      {isUp ? "+" : ""}{pos.unrealizedPnLPct.toFixed(2)}%
                    </td>
                    <td className="py-1">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="h-1.5 w-12 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(pos.allocation, 100)}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-on-surface-variant w-8 text-right font-bold">
                          {pos.allocation.toFixed(1)}%
                        </span>
                      </div>
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
