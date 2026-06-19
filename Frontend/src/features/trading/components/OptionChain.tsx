"use client";

import React, { useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { DataSourceBadge } from "@/components/shared/DataSourceBadge";
import { cn } from "@/lib/utils";
import { BackendMarket } from "@/lib/adapters/market.adapter";
import { useTerminalStore } from "@/stores/terminal.store";
import { Match } from "@/types";
import { useOptionChain } from "../hooks";
import { ChainRow, buildOptionRows, buildPricePayload, findAtmRow } from "../utils/terminal-context";

interface OptionChainProps {
  marketId: string;
  market?: BackendMarket;
  match?: Match;
  className?: string;
}

export function OptionChain({ marketId, market, match, className }: OptionChainProps) {
  const selectedStrike = useTerminalStore((state) => state.selectedStrike);
  const selectedSide = useTerminalStore((state) => state.selectedSide ?? "BUY");
  const setOrderIntent = useTerminalStore((state) => state.setOrderIntent);

  const payload = useMemo(() => buildPricePayload(match, market), [match, market]);
  const { data: calculated, isLoading, isError } = useOptionChain(marketId, payload);

  const rows = useMemo(() => buildOptionRows(calculated, market), [calculated, market]);
  const hasApiChain = Boolean(calculated?.optionChain?.length);
  const atmRow = findAtmRow(rows);
  const activeRow = rows.find((row) => row.strike === selectedStrike) ?? atmRow;
  const visibleRows = useMemo(() => windowAroundAtm(rows), [rows]);

  const selectRow = (row: ChainRow) => {
    setOrderIntent({
      side: selectedSide,
      strike: row.strike,
      price: selectedSide === "BUY" ? row.ask : row.bid,
    });
  };

  return (
    <section
      className={cn(
        "relative flex h-[430px] min-h-[340px] flex-col overflow-hidden rounded-xl border border-cyan-300/12 bg-[#040a17]/94 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl",
        className
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/55 to-transparent" />
      <div className="relative flex items-center justify-between gap-3 border-b border-white/8 bg-[#071124]/92 px-3.5 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-black text-on-surface">Match Depth Options</h2>
          <p className="truncate text-[11px] text-cyan-100/62">Live strikes and executable quotes</p>
        </div>

        <div className="flex min-w-0 items-center gap-3 text-right">
          <div className="flex shrink-0 items-center gap-2">
            <DataSourceBadge source={hasApiChain ? "api" : "static"} />
            <span className="rounded border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-black text-primary">
              {payload?.innings === 2 ? "CHASE" : "1ST INNS"}
            </span>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[560px] border-collapse font-data-tabular text-[12px]">
          <thead className="sticky top-0 z-10 bg-[#08152b] text-[10px] uppercase tracking-wide text-cyan-100/58">
            <tr className="border-b border-white/8">
              <th className="px-3 py-2.5 text-left font-semibold">Strike</th>
              <th className="px-3 py-2.5 text-right font-semibold">Bid</th>
              <th className="px-3 py-2.5 text-right font-semibold">Ask</th>
              <th className="px-3 py-2.5 text-right font-semibold">Size</th>
              <th className="px-3 py-2.5 text-center font-semibold">State</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && rows.length === 0 ? (
              <ZeroChainRow />
            ) : visibleRows.length === 0 ? (
              <ZeroChainRow />
            ) : (
              visibleRows.map((row) => {
                const selected = activeRow?.strike === row.strike;
                const isAtm = row.moneyness === "ATM";
                const size = Math.max(row.bidQty, row.askQty);

                return (
                  <tr
                    key={row.strike}
                    onClick={() => selectRow(row)}
                    className={cn(
                      "group cursor-pointer border-b border-white/6 transition-colors odd:bg-white/2.5 hover:bg-cyan-400/6",
                      isAtm && "bg-cyan-400/10 shadow-[inset_4px_0_0_#22d3ee]",
                      selected && "bg-cyan-400/12 shadow-[inset_4px_0_0_#67e8f9]"
                    )}
                  >
                    <td
                      className={cn(
                        "px-3 py-3 text-lg font-black text-on-surface",
                        isAtm && "text-cyan-200"
                      )}
                    >
                      <span className="inline-flex items-center gap-1">
                        {row.strike.toFixed(0)}
                        {isAtm && <ChevronLeft className="h-4 w-4 text-cyan-300" />}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-base font-black text-cyan-300 transition-colors group-hover:text-cyan-200">{row.bid.toFixed(2)}</td>
                    <td className="px-3 py-3 text-right text-base font-black text-red-300 transition-colors group-hover:text-red-200">{row.ask.toFixed(2)}</td>
                    <td className="px-3 py-3 text-right text-on-surface-variant">{compactSize(size)}</td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={cn(
                          "inline-flex min-w-10 justify-center rounded border px-2 py-1 text-[10px] font-black",
                          row.moneyness === "ATM" && "border-cyan-300/40 bg-cyan-300/18 text-cyan-100",
                          row.moneyness !== "ATM" && "border-slate-400/20 bg-slate-400/12 text-slate-300"
                        )}
                      >
                        {row.moneyness}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-white/8 bg-[#071124]/92 px-3 py-2 text-[10px] uppercase tracking-wide text-on-surface-variant">
        <span>ATM {atmRow?.strike.toFixed(0) ?? "0"}</span>
        <span className={isError || !hasApiChain ? "text-red-300" : "text-cyan-300"}>
          {isError || !hasApiChain ? "No API option chain" : `${selectedSide} ticket routed`}
        </span>
      </div>
    </section>
  );
}

function ZeroChainRow() {
  return (
    <tr className="border-b border-white/6">
      <td className="px-3 py-3 text-lg font-black text-on-surface">0</td>
      <td className="px-3 py-3 text-right text-base font-black text-cyan-300">0.00</td>
      <td className="px-3 py-3 text-right text-base font-black text-red-300">0.00</td>
      <td className="px-3 py-3 text-right text-on-surface-variant">0</td>
      <td className="px-3 py-3 text-center">
        <span className="inline-flex min-w-10 justify-center rounded border border-slate-400/20 bg-slate-400/12 px-2 py-1 text-[10px] font-black text-slate-300">
          --
        </span>
      </td>
    </tr>
  );
}

function windowAroundAtm<T extends { moneyness: "ITM" | "ATM" | "OTM" }>(rows: T[]) {
  if (rows.length <= 12) return rows;
  const atmIndex = Math.max(0, rows.findIndex((row) => row.moneyness === "ATM"));
  const start = Math.max(0, Math.min(rows.length - 12, atmIndex - 3));
  return rows.slice(start, start + 12);
}

function compactSize(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  return value.toLocaleString();
}
