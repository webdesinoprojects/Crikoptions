"use client";

import React, { useMemo, useState } from "react";
import * as echarts from "echarts";
import { Activity, CandlestickChart, TrendingDown, TrendingUp, X } from "lucide-react";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ChainHistoryPoint } from "../hooks";
import {
  CANDLE_BUCKETS,
  StrikeCandle,
  buildStrikeCandles,
  getCandleStats,
} from "../utils/option-chain-candles";
import { ChainRow } from "../utils/terminal-context";

interface OptionChainCandlestickDialogProps {
  atmRow?: ChainRow;
  getStrikeHistory: (strike?: number | null) => ChainHistoryPoint[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  selectedRow?: ChainRow | null;
}

const DEFAULT_BUCKET_MS = 30_000;

export function OptionChainCandlestickDialog({
  atmRow,
  getStrikeHistory,
  onOpenChange,
  open,
  selectedRow,
}: OptionChainCandlestickDialogProps) {
  const [bucketMs, setBucketMs] = useState(DEFAULT_BUCKET_MS);
  const [showQuoteBands, setShowQuoteBands] = useState(false);

  const selectedHistory = useMemo(
    () => getStrikeHistory(selectedRow?.strike),
    [getStrikeHistory, selectedRow?.strike]
  );
  const candles = useMemo(() => buildStrikeCandles(selectedHistory, bucketMs), [bucketMs, selectedHistory]);
  const candleStats = useMemo(() => getCandleStats(candles), [candles]);

  const latestPoint = selectedHistory[selectedHistory.length - 1];
  const previousPoint = selectedHistory[selectedHistory.length - 2];
  const latestCandle = candleStats.last;
  const currentPremium = latestCandle?.close ?? latestPoint?.premium ?? selectedRow?.premium ?? 0;
  const currentOpen = latestCandle?.open ?? currentPremium;
  const move = previousPoint ? currentPremium - previousPoint.premium : candleStats.move;
  const spread = selectedRow ? Math.max(0, selectedRow.ask - selectedRow.bid) : 0;
  const activitySize = Math.max(selectedRow?.bidQty ?? 0, selectedRow?.askQty ?? 0);
  const chartReady = Boolean(selectedRow && candles.length > 0);

  const chartOption = useMemo<echarts.EChartsOption>(
    () => buildCandleOption(candles, showQuoteBands),
    [candles, showQuoteBands]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[calc(100dvh-1rem)] max-h-[820px] !w-[calc(100vw-1rem)] !max-w-[calc(100vw-1rem)] grid-rows-none flex-col gap-0 overflow-hidden border border-cyan-300/14 bg-[#030817] p-0 text-on-surface shadow-[0_30px_120px_rgba(0,0,0,0.62)] sm:!w-[calc(100vw-2rem)] sm:!max-w-[1320px]"
        showCloseButton={false}
      >
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/70 to-transparent" />
        <DialogClose
          render={
            <button
              type="button"
              aria-label="Close candlestick chart"
              className="absolute right-2 top-2 z-30 inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/8 bg-[#030817]/80 text-slate-200 shadow-[0_12px_32px_rgba(0,0,0,0.28)] transition-colors hover:border-cyan-300/28 hover:bg-cyan-300/10 hover:text-white"
            />
          }
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <div className="flex shrink-0 flex-col gap-3 border-b border-white/8 bg-[#071124]/96 px-4 py-3 pr-14">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <DialogHeader className="min-w-0 gap-1">
              <DialogTitle className="flex min-w-0 items-center gap-2 text-[16px] font-black text-on-surface">
                <CandlestickChart className="h-5 w-5 shrink-0 text-cyan-300" />
                <span className="truncate">
                  Strike {selectedRow ? formatStrike(selectedRow.strike) : "--"} Premium Chart
                </span>
              </DialogTitle>
              <DialogDescription className="truncate text-[11px] text-cyan-100/62">
                {selectedRow
                  ? `${formatBucket(bucketMs)} premium OHLC - ${selectedRow.moneyness} chain movement`
                  : "Select a strike"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid w-full grid-cols-2 gap-1.5 sm:grid-cols-3 xl:w-auto xl:grid-cols-6">
              <MetricCell label="Last" tone={move >= 0 ? "up" : "down"} value={`Rs ${formatMoney(currentPremium)}`} />
              <MetricCell label="Open" value={`Rs ${formatMoney(currentOpen)}`} />
              <MetricCell label="High" value={`Rs ${formatMoney(candleStats.high || currentPremium)}`} />
              <MetricCell label="Low" value={`Rs ${formatMoney(candleStats.low || currentPremium)}`} />
              <MetricCell label="Spread" value={`Rs ${formatMoney(spread)}`} />
              <MetricCell label="Ticks" value={String(selectedHistory.length)} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-b border-white/8 bg-[#050d1d] px-3 py-2 md:flex-row md:items-center md:justify-between">
          <div className="grid w-full grid-cols-4 gap-1 rounded-lg border border-white/8 bg-[#071327] p-0.5 md:w-auto">
            {CANDLE_BUCKETS.map((bucket) => (
              <ControlButton
                key={bucket.value}
                active={bucketMs === bucket.value}
                onClick={() => setBucketMs(bucket.value)}
              >
                {bucket.label}
              </ControlButton>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-wide text-on-surface-variant md:justify-end">
            <button
              type="button"
              onClick={() => setShowQuoteBands((value) => !value)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 font-black transition-all",
                showQuoteBands
                  ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100"
                  : "border-white/8 bg-white/[0.03] text-on-surface-variant hover:bg-white/6 hover:text-on-surface"
              )}
            >
              <Activity className="h-3.5 w-3.5" />
              Bid/Ask
            </button>
            <span>{candles.length} candles</span>
            <span className={move >= 0 ? "text-bull-green" : "text-bear-red"}>
              {previousPoint || candleStats.previous
                ? `${move >= 0 ? "+" : "-"}Rs ${formatMoney(Math.abs(move))}`
                : "Waiting"}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 bg-[#020817] p-3">
          {chartReady ? (
            <div className="relative h-full min-h-[360px] overflow-hidden rounded-lg border border-white/8 bg-[#030817] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:min-h-[430px]">
              <div className="pointer-events-none absolute left-4 top-3 z-10 flex flex-wrap items-center gap-2">
                <LegendPill color="#22c55e" label="Premium" />
                <LegendPill color="rgba(148,163,184,0.5)" label="Volume" />
                {showQuoteBands && (
                  <>
                    <LegendPill color="#38bdf8" label="Bid" />
                    <LegendPill color="#fb7185" label="Ask" />
                  </>
                )}
              </div>
              <EChartsWrapper option={chartOption} />
            </div>
          ) : (
            <CandlestickEmptyState pointCount={selectedHistory.length} row={selectedRow} />
          )}
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-white/8 bg-[#071124]/95 px-3 py-2 text-[10px] text-on-surface-variant sm:grid-cols-3 md:grid-cols-5">
          <FooterStat label="Moneyness" value={selectedRow?.moneyness ?? "--"} />
          <FooterStat label="Size" value={compactSize(activitySize)} />
          <FooterStat label="ATM" value={atmRow ? formatStrike(atmRow.strike) : "--"} />
          <FooterStat label="Bucket" value={formatBucket(bucketMs)} />
          <FooterStat label="Last Tick" value={latestPoint ? formatClock(latestPoint.timestamp) : "--:--"} align="right" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function buildCandleOption(candles: StrikeCandle[], showQuoteBands: boolean): echarts.EChartsOption {
  const labels = candles.map((candle) => formatTimeLabel(candle.time));
  const candleData = candles.map((candle) => [candle.open, candle.close, candle.low, candle.high]);
  const latestCandle = candles[candles.length - 1];
  const priceValues =
    candles.length > 0
      ? candles.flatMap((candle) =>
          showQuoteBands
            ? [candle.open, candle.close, candle.low, candle.high, candle.bid, candle.ask]
            : [candle.open, candle.close, candle.low, candle.high]
        )
      : [0, 1];
  const minPrice = Math.min(...priceValues);
  const maxPrice = Math.max(...priceValues);
  const priceRange = Math.max(1, maxPrice - minPrice);
  const yAxisMin = Math.max(0, minPrice - priceRange * 0.18);
  const yAxisMax = maxPrice + priceRange * 0.18;
  const activityData = candles.map((candle) => ({
    value: Math.max(candle.ticks, candle.bidQty + candle.askQty),
    itemStyle: {
      color: candle.close >= candle.open ? "rgba(34,197,94,0.22)" : "rgba(239,68,68,0.22)",
    },
  }));
  const series: echarts.EChartsOption["series"] = [
    {
      name: "Premium",
      type: "candlestick",
      data: candleData,
      barMinWidth: 4,
      barMaxWidth: 18,
      itemStyle: {
        color: "#16a34a",
        color0: "#ef4444",
        borderColor: "#22c55e",
        borderColor0: "#f87171",
        borderWidth: 1.1,
      },
      emphasis: {
        itemStyle: {
          borderWidth: 1.4,
          shadowBlur: 12,
          shadowColor: "rgba(34,211,238,0.18)",
        },
      },
      markLine: latestCandle
        ? {
            animation: false,
            symbol: "none",
            silent: true,
            label: {
              show: true,
              position: "end",
              formatter: `Rs ${formatMoney(latestCandle.close)}`,
              color: "#020617",
              backgroundColor: latestCandle.close >= latestCandle.open ? "#22c55e" : "#ef4444",
              borderRadius: 3,
              padding: [3, 6],
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 10,
              fontWeight: 900,
            },
            lineStyle: {
              color: latestCandle.close >= latestCandle.open ? "rgba(34,197,94,0.72)" : "rgba(239,68,68,0.72)",
              type: "dashed",
              width: 1,
            },
            data: [{ yAxis: latestCandle.close }],
          }
        : undefined,
    },
    {
      name: "Volume",
      type: "bar",
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: activityData,
      barMaxWidth: 22,
      barMinWidth: 3,
      silent: true,
    },
  ];

  if (showQuoteBands) {
    series.push(
      {
        name: "Bid",
        type: "line",
        data: candles.map((candle) => candle.bid),
        smooth: false,
        showSymbol: false,
        lineStyle: {
          color: "#38bdf8",
          type: "dashed",
          opacity: 0.7,
          width: 1,
        },
        emphasis: {
          focus: "series",
        },
      },
      {
        name: "Ask",
        type: "line",
        data: candles.map((candle) => candle.ask),
        smooth: false,
        showSymbol: false,
        lineStyle: {
          color: "#fb7185",
          type: "dashed",
          opacity: 0.7,
          width: 1,
        },
        emphasis: {
          focus: "series",
        },
      }
    );
  }

  return {
    animationDuration: 220,
    backgroundColor: "transparent",
    color: ["#22c55e", "#38bdf8", "#fb7185"],
    grid: [
      {
        top: 54,
        right: 104,
        bottom: 92,
        left: 16,
        containLabel: false,
      },
      {
        height: 42,
        right: 104,
        bottom: 34,
        left: 16,
        containLabel: false,
      },
    ],
    xAxis: [
      {
        type: "category",
        data: labels,
        boundaryGap: true,
        axisLine: { onZero: false, lineStyle: { color: "rgba(148,163,184,0.16)" } },
        axisTick: { show: false },
        axisLabel: {
          color: "#94a3b8",
          fontSize: 10,
          fontFamily: "JetBrains Mono, monospace",
          hideOverlap: true,
          margin: 12,
        },
        splitLine: { show: true, lineStyle: { color: "rgba(148,163,184,0.07)" } },
      },
      {
        type: "category",
        gridIndex: 1,
        data: labels,
        boundaryGap: true,
        axisLabel: { show: false },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "rgba(148,163,184,0.11)" } },
        splitLine: { show: false },
      },
    ],
    yAxis: [
      {
        type: "value",
        scale: true,
        position: "right",
        min: yAxisMin,
        max: yAxisMax,
        splitNumber: 5,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          formatter: (value: string | number) => formatMoney(Number(value)),
          color: "#94a3b8",
          fontSize: 10,
          fontFamily: "JetBrains Mono, monospace",
          margin: 12,
        },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.09)" } },
      },
      {
        type: "value",
        gridIndex: 1,
        axisLabel: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
      },
    ],
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: [0, 1],
        filterMode: "none",
        start: zoomStart(candles.length),
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: false,
      },
    ],
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(3,8,23,0.96)",
      borderColor: "rgba(148,163,184,0.22)",
      borderWidth: 1,
      padding: [8, 10],
      extraCssText: "box-shadow:0 18px 44px rgba(0,0,0,0.35);border-radius:6px;",
      axisPointer: {
        type: "cross",
        lineStyle: {
          color: "rgba(203,213,225,0.28)",
          width: 1,
        },
        crossStyle: {
          color: "rgba(203,213,225,0.28)",
        },
        label: {
          backgroundColor: "#071327",
          color: "#e2e8f0",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 10,
        },
      },
      formatter: (params: unknown) => formatCandleTooltip(params, candles),
    },
    axisPointer: {
      link: [{ xAxisIndex: [0, 1] }],
    },
    series,
  };
}

function formatCandleTooltip(params: unknown, candles: StrikeCandle[]) {
  const rows = Array.isArray(params) ? params : [params];
  const dataIndex = getTooltipDataIndex(rows[0]);
  const candle = candles[dataIndex];
  if (!candle) return "";

  const direction = candle.close >= candle.open ? "UP" : "DOWN";
  return [
    `<div style="min-width:188px">`,
    `<div style="font-weight:900;color:#e2e8f0;margin-bottom:6px">${formatClock(candle.startedAt)} - ${formatClock(candle.endedAt)} <span style="color:${direction === "UP" ? "#86efac" : "#fca5a5"}">${direction}</span></div>`,
    tooltipLine("Open", `Rs ${formatMoney(candle.open)}`),
    tooltipLine("High", `Rs ${formatMoney(candle.high)}`),
    tooltipLine("Low", `Rs ${formatMoney(candle.low)}`),
    tooltipLine("Close", `Rs ${formatMoney(candle.close)}`),
    tooltipLine("Bid / Ask", `Rs ${formatMoney(candle.bid)} / Rs ${formatMoney(candle.ask)}`),
    tooltipLine("Ticks", String(candle.ticks)),
    `</div>`,
  ].join("");
}

function tooltipLine(label: string, value: string) {
  return `<div style="display:flex;justify-content:space-between;gap:16px;margin:2px 0"><span style="color:#94a3b8">${label}</span><strong style="color:#f8fafc">${value}</strong></div>`;
}

function getTooltipDataIndex(value: unknown) {
  if (typeof value === "object" && value !== null && "dataIndex" in value) {
    const dataIndex = Number((value as { dataIndex?: unknown }).dataIndex);
    return Number.isFinite(dataIndex) ? dataIndex : -1;
  }
  return -1;
}

function ControlButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 min-w-11 items-center justify-center rounded-md px-2 font-data-tabular text-[10px] font-black transition-all",
        active
          ? "bg-primary/18 text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
      )}
    >
      {children}
    </button>
  );
}

function LegendPill({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-md border border-white/8 bg-[#061022]/90 px-2 font-data-tabular text-[10px] font-black text-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function MetricCell({ label, tone, value }: { label: string; tone?: "up" | "down"; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-white/8 bg-[#030817] px-2 py-1.5">
      <div className="text-[9px] font-black uppercase tracking-wide text-on-surface-variant">{label}</div>
      <div
        className={cn(
          "flex items-center gap-1 truncate font-data-tabular text-[12px] font-black text-on-surface",
          tone === "up" && "text-bull-green",
          tone === "down" && "text-bear-red"
        )}
      >
        {tone === "up" && <TrendingUp className="h-3.5 w-3.5 shrink-0" />}
        {tone === "down" && <TrendingDown className="h-3.5 w-3.5 shrink-0" />}
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}

function CandlestickEmptyState({ pointCount, row }: { pointCount: number; row?: ChainRow | null }) {
  return (
    <div className="flex h-full min-h-[390px] flex-col items-center justify-center rounded-lg border border-dashed border-cyan-300/18 bg-[#030817] px-5 text-center">
      <CandlestickChart className="mb-3 h-9 w-9 text-cyan-300/75" />
      <div className="text-sm font-black text-on-surface">
        {row ? "Collecting live candles" : "Select a strike"}
      </div>
      <div className="mt-1 max-w-sm text-[11px] leading-5 text-on-surface-variant">
        {row
          ? pointCount > 0
            ? "The first candle is forming from the latest live premium tick."
            : "The candlestick appears as soon as this strike receives a live quote."
          : "Open a strike from the option chain actions menu."}
      </div>
    </div>
  );
}

function FooterStat({
  align,
  label,
  value,
}: {
  align?: "right";
  label: string;
  value: string;
}) {
  return (
    <div className={cn("min-w-0", align === "right" && "text-right")}>
      <div className="uppercase tracking-wide">{label}</div>
      <div className="truncate font-data-tabular text-[11px] font-black text-on-surface">{value}</div>
    </div>
  );
}

function zoomStart(count: number) {
  if (count <= 24) return 0;
  return Math.max(0, 100 - (24 / count) * 100);
}

function formatStrike(value: number) {
  return value.toFixed(0);
}

function formatMoney(value: number) {
  if (!Number.isFinite(value)) return "0.00";
  return value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatBucket(bucketMs: number) {
  const bucket = CANDLE_BUCKETS.find((item) => item.value === bucketMs);
  return bucket?.label ?? `${Math.round(bucketMs / 1000)}s`;
}

function formatClock(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatTimeLabel(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function compactSize(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  return value.toLocaleString("en-IN");
}
