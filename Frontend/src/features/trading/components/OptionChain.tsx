"use client";

import React, { useMemo, useState } from "react";
import { CandlestickChart, ChevronLeft, MoreHorizontal } from "lucide-react";
import { DataSourceBadge } from "@/components/shared/DataSourceBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { BackendMarket } from "@/lib/adapters/market.adapter";
import { useTerminalStore } from "@/stores/terminal.store";
import { Match } from "@/types";
import { useOptionChain, useOptionChainHistory } from "../hooks";
import { ChainRow, buildOptionRows, buildPricePayload, findAtmRow } from "../utils/terminal-context";
import { OptionChainCandlestickDialog } from "./OptionChainCandlestickDialog";

interface OptionChainProps {
  marketId: string;
  market?: BackendMarket;
  match?: Match;
  className?: string;
}

export function OptionChain({ marketId, market, match, className }: OptionChainProps) {
  const [candlestickRow, setCandlestickRow] = useState<ChainRow | null>(null);
  const selectedStrike = useTerminalStore((state) => state.selectedStrike);
  const selectedSide = useTerminalStore((state) => state.selectedSide ?? "BUY");
  const setOrderIntent = useTerminalStore((state) => state.setOrderIntent);

  const payload = useMemo(() => buildPricePayload(match, market), [match, market]);
  const { data: calculated, isLoading, isError } = useOptionChain(marketId, payload);

  const rows = useMemo(() => buildOptionRows(calculated, market), [calculated, market]);
  const hasApiChain = Boolean(calculated?.optionChain?.length);
  const atmRow = findAtmRow(rows);
  const activeRow = selectedStrike == null ? atmRow : rows.find((row) => row.strike === selectedStrike);
  const visibleRows = rows;
  const firstStrike = visibleRows[0]?.strike;
  const lastStrike = visibleRows[visibleRows.length - 1]?.strike;
  const candlestickSelectedRow = candlestickRow ? rows.find((row) => row.strike === candlestickRow.strike) ?? candlestickRow : null;
  const { getStrikeHistory } = useOptionChainHistory(marketId, rows);
  
  React.useEffect(() => {
    if (selectedStrike != null || !atmRow) return;

    setOrderIntent({
      side: selectedSide,
      strike: atmRow.strike,
      price: selectedSide === "BUY" ? atmRow.ask : atmRow.bid,
      source: "auto",
    });
  }, [atmRow, selectedSide, selectedStrike, setOrderIntent]);

  const selectRow = (row: ChainRow, side: "BUY" | "SELL" = selectedSide) => {
    setOrderIntent({
      side,
      strike: row.strike,
      price: side === "BUY" ? row.ask : row.bid,
    });
  };

  return (
    <>
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
                <th className="w-[170px] px-3 py-2.5 text-left font-semibold">Strike</th>
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
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-lg font-black text-on-surface",
                              isAtm && "text-cyan-200"
                            )}
                          >
                            {row.strike.toFixed(0)}
                            {isAtm && <ChevronLeft className="h-4 w-4 text-cyan-300" />}
                          </span>
                          <div className="ml-auto">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  aria-label={`Actions for strike ${row.strike.toFixed(0)}`}
                                  title="Strike actions"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    selectRow(row);
                                  }}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/8 bg-white/[0.03] text-on-surface-variant opacity-100 transition-all hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100 md:opacity-65 md:group-hover:opacity-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                side="bottom"
                                className="min-w-40 border-white/10 bg-[#071327] p-1 text-on-surface shadow-[0_16px_44px_rgba(0,0,0,0.45)]"
                              >
                                <DropdownMenuItem
                                  onSelect={() => {
                                    selectRow(row);
                                    setCandlestickRow(row);
                                  }}
                                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-[12px] font-black text-cyan-100 focus:bg-cyan-300/10 focus:text-cyan-100"
                                >
                                  <CandlestickChart className="h-4 w-4 text-cyan-300" />
                                  View candlestick
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right text-base font-black text-cyan-300 transition-colors group-hover:text-cyan-200">
                        {formatQuote(row.bid)}
                      </td>
                      <td className="px-3 py-3 text-right text-base font-black text-red-300 transition-colors group-hover:text-red-200">
                        {formatQuote(row.ask)}
                      </td>
                      <td className="px-3 py-3 text-right text-on-surface-variant relative">
                        <span className="relative z-10">{compactSize(size)}</span>
                      </td>
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
          <span>
            {visibleRows.length > 0
              ? `${visibleRows.length} strikes ${firstStrike?.toFixed(0)}-${lastStrike?.toFixed(0)}`
              : `ATM ${atmRow?.strike.toFixed(0) ?? "0"}`}
          </span>
          <span className={isError || !hasApiChain ? "text-red-300" : "text-cyan-300"}>
            {isError || !hasApiChain ? "No API option chain" : `${selectedSide} ticket routed`}
          </span>
        </div>
      </section>

      <OptionChainCandlestickDialog
        key={candlestickSelectedRow?.strike ?? "closed-chain-candlestick"}
        atmRow={atmRow}
        getStrikeHistory={getStrikeHistory}
        onOpenChange={(open) => {
          if (!open) setCandlestickRow(null);
        }}
        open={Boolean(candlestickRow)}
        selectedRow={candlestickSelectedRow}
      />
    </>
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

function compactSize(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  return value.toLocaleString("en-IN");
}

function formatQuote(value: number) {
  if (!Number.isFinite(value)) return "0.00";
  return value.toFixed(2);
}
