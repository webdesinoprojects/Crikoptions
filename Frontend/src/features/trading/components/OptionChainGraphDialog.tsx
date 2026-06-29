"use client";

import React, { useMemo, useState } from "react";
import * as echarts from "echarts";
import { Activity, GitCompareArrows, LineChart, TrendingDown, TrendingUp } from "lucide-react";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ChainHistoryPoint } from "../hooks";
import { ChainRow } from "../utils/terminal-context";

interface OptionChainGraphDialogProps {
  atmRow?: ChainRow;
  getStrikeHistory: (strike?: number | null) => ChainHistoryPoint[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  rows: ChainRow[];
  selectedRow?: ChainRow | null;
}

type ChartMode = "premium" | "bidAsk" | "compare";

interface LineSeries {
  name: string;
  type: "line";
  smooth: boolean;
  showSymbol: boolean;
  symbolSize: number;
  data: Array<[number, number]>;
  lineStyle: {
    color: string;
    width: number;
  };
  itemStyle: {
    color: string;
  };
  areaStyle?: {
    color: {
      type: "linear";
      x: number;
      y: number;
      x2: number;
      y2: number;
      colorStops: Array<{ offset: number; color: string }>;
    };
  };
  emphasis: {
    focus: "series";
  };
}

const SERIES_COLORS = ["#22d3ee", "#22c55e", "#f59e0b", "#a78bfa"];

export function OptionChainGraphDialog({
  atmRow,
  getStrikeHistory,
  onOpenChange,
  open,
  rows,
  selectedRow,
}: OptionChainGraphDialogProps) {
  const [mode, setMode] = useState<ChartMode>("premium");

  const selectedHistory = useMemo(
    () => getStrikeHistory(selectedRow?.strike),
    [getStrikeHistory, selectedRow?.strike]
  );
  const latestPoint = selectedHistory[selectedHistory.length - 1];
  const previousPoint = selectedHistory[selectedHistory.length - 2];
  const currentPremium = latestPoint?.premium ?? selectedRow?.premium ?? 0;
  const move = previousPoint ? currentPremium - previousPoint.premium : 0;
  const spread = selectedRow ? Math.max(0, selectedRow.ask - selectedRow.bid) : 0;
  const compareRows = useMemo(() => buildCompareRows(selectedRow, atmRow, rows), [atmRow, rows, selectedRow]);

  const chartSeries = useMemo(() => {
    if (!selectedRow) return [];

    if (mode === "bidAsk") {
      return [
        buildLineSeries("Bid", selectedHistory, "bid", "#22d3ee", false),
        buildLineSeries("Ask", selectedHistory, "ask", "#f87171", false),
      ].filter((series) => series.data.length >= 2);
    }

    if (mode === "compare") {
      return compareRows
        .map((row, index) => {
          const name = row.strike === selectedRow.strike ? `Selected ${formatStrike(row.strike)}` : labelForCompare(row, atmRow);
          return buildLineSeries(name, getStrikeHistory(row.strike), "premium", SERIES_COLORS[index % SERIES_COLORS.length], false);
        })
        .filter((series) => series.data.length >= 2);
    }

    return [
      buildLineSeries(`Strike ${formatStrike(selectedRow.strike)}`, selectedHistory, "premium", "#22d3ee", true),
    ].filter((series) => series.data.length >= 2);
  }, [atmRow, compareRows, getStrikeHistory, mode, selectedHistory, selectedRow]);

  const chartReady = chartSeries.length > 0;

  const chartOption = useMemo<echarts.EChartsOption>(
    () => ({
      color: chartSeries.map((series) => series.itemStyle.color),
      animationDuration: 360,
      legend: {
        top: 4,
        right: 8,
        icon: "roundRect",
        itemHeight: 7,
        itemWidth: 12,
        textStyle: {
          color: "#cbd5e1",
          fontSize: 10,
          fontFamily: "JetBrains Mono, monospace",
        },
      },
      grid: {
        top: 44,
        right: 20,
        bottom: 34,
        left: 46,
        containLabel: true,
      },
      xAxis: {
        type: "time",
        boundaryGap: ["0%", "0%"],
        axisLabel: {
          formatter: (value: string | number) => formatTimeLabel(Number(value)),
        },
      },
      yAxis: {
        type: "value",
        scale: true,
        axisLabel: {
          formatter: (value: string | number) => formatMoney(Number(value)),
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#071327",
          },
        },
      },
      series: chartSeries as echarts.EChartsOption["series"],
    }),
    [chartSeries]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[min(760px,calc(100dvh-1.5rem))] max-w-[min(1120px,calc(100vw-1.5rem))] grid-rows-none flex-col gap-0 overflow-hidden border border-cyan-300/14 bg-[#040a17] p-0 text-on-surface shadow-[0_30px_120px_rgba(0,0,0,0.58)] sm:max-w-[min(1120px,calc(100vw-2rem))]"
        showCloseButton
      >
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/65 to-transparent" />
        <div className="flex shrink-0 flex-col gap-3 border-b border-white/8 bg-[#071124]/95 px-4 py-3 pr-12 md:flex-row md:items-center md:justify-between">
          <DialogHeader className="min-w-0 gap-1">
            <DialogTitle className="truncate text-[15px] font-black text-on-surface">
              Strike {selectedRow ? formatStrike(selectedRow.strike) : "--"} Graph
            </DialogTitle>
            <DialogDescription className="truncate text-[11px] text-cyan-100/62">
              {selectedRow ? `${selectedRow.moneyness} chain movement` : "Select a strike"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid shrink-0 grid-cols-2 gap-1.5 sm:grid-cols-4">
            <MetricCell label="Premium" tone={move >= 0 ? "up" : "down"} value={`Rs ${formatMoney(currentPremium)}`} />
            <MetricCell label="Bid" value={`Rs ${formatMoney(selectedRow?.bid ?? 0)}`} />
            <MetricCell label="Ask" value={`Rs ${formatMoney(selectedRow?.ask ?? 0)}`} />
            <MetricCell label="Spread" value={`Rs ${formatMoney(spread)}`} />
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-b border-white/8 bg-[#050d1d] px-3 py-2 md:flex-row md:items-center md:justify-between">
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-white/8 bg-[#071327] p-0.5">
            <ModeButton active={mode === "premium"} icon={<LineChart className="h-3.5 w-3.5" />} onClick={() => setMode("premium")}>
              Premium
            </ModeButton>
            <ModeButton active={mode === "bidAsk"} icon={<Activity className="h-3.5 w-3.5" />} onClick={() => setMode("bidAsk")}>
              Bid/Ask
            </ModeButton>
            <ModeButton active={mode === "compare"} icon={<GitCompareArrows className="h-3.5 w-3.5" />} onClick={() => setMode("compare")}>
              Compare
            </ModeButton>
          </div>

          <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wide text-on-surface-variant md:justify-end">
            <span>{selectedHistory.length} ticks</span>
            <span className={move >= 0 ? "text-bull-green" : "text-bear-red"}>
              {previousPoint ? `${move >= 0 ? "+" : "-"}Rs ${formatMoney(Math.abs(move))}` : "Waiting"}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 bg-[#020817] p-3">
          {chartReady ? (
            <div className="h-full min-h-[360px] overflow-hidden rounded-lg border border-white/8 bg-[#040a17]">
              <EChartsWrapper option={chartOption} />
            </div>
          ) : (
            <GraphEmptyState pointCount={selectedHistory.length} row={selectedRow} />
          )}
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-white/8 bg-[#071124]/95 px-3 py-2 text-[10px] text-on-surface-variant md:grid-cols-4">
          <FooterStat label="Moneyness" value={selectedRow?.moneyness ?? "--"} />
          <FooterStat label="Size" value={compactSize(Math.max(selectedRow?.bidQty ?? 0, selectedRow?.askQty ?? 0))} />
          <FooterStat label="ATM" value={atmRow ? formatStrike(atmRow.strike) : "--"} />
          <FooterStat label="Last" value={latestPoint ? formatClock(latestPoint.timestamp) : "--:--"} align="right" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function buildLineSeries(
  name: string,
  points: ChainHistoryPoint[],
  field: "premium" | "bid" | "ask",
  color: string,
  fill: boolean
): LineSeries {
  return {
    name,
    type: "line",
    smooth: true,
    showSymbol: false,
    symbolSize: 5,
    data: points.map((point) => [point.timestamp, point[field]]),
    lineStyle: {
      color,
      width: 2,
    },
    itemStyle: {
      color,
    },
    areaStyle: fill
      ? {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(34, 211, 238, 0.22)" },
              { offset: 1, color: "rgba(34, 211, 238, 0.02)" },
            ],
          },
        }
      : undefined,
    emphasis: {
      focus: "series",
    },
  };
}

function buildCompareRows(selectedRow: ChainRow | null | undefined, atmRow: ChainRow | undefined, rows: ChainRow[]) {
  if (!selectedRow) return [];

  const sortedRows = [...rows].sort((left, right) => left.strike - right.strike);
  const selectedIndex = sortedRows.findIndex((row) => row.strike === selectedRow.strike);
  const candidates = [
    selectedRow,
    atmRow,
    selectedIndex > 0 ? sortedRows[selectedIndex - 1] : undefined,
    selectedIndex >= 0 ? sortedRows[selectedIndex + 1] : undefined,
  ];
  const seen = new Set<number>();

  return candidates.filter((row): row is ChainRow => {
    if (!row || seen.has(row.strike)) return false;
    seen.add(row.strike);
    return true;
  });
}

function labelForCompare(row: ChainRow, atmRow?: ChainRow) {
  if (atmRow?.strike === row.strike) return `ATM ${formatStrike(row.strike)}`;
  return `Strike ${formatStrike(row.strike)}`;
}

function ModeButton({
  active,
  children,
  icon,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-md px-2 text-[10px] font-black transition-all",
        active
          ? "bg-primary/18 text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
      )}
    >
      {icon}
      <span className="truncate">{children}</span>
    </button>
  );
}

function MetricCell({ label, tone, value }: { label: string; tone?: "up" | "down"; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-white/8 bg-[#040a17] px-2 py-1.5">
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

function GraphEmptyState({ pointCount, row }: { pointCount: number; row?: ChainRow | null }) {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-cyan-300/18 bg-[#040a17] px-5 text-center">
      <LineChart className="mb-3 h-8 w-8 text-cyan-300/70" />
      <div className="text-sm font-black text-on-surface">
        {row ? "Collecting live ticks" : "Select a strike"}
      </div>
      <div className="mt-1 max-w-sm text-[11px] leading-5 text-on-surface-variant">
        {row
          ? pointCount > 0
            ? "One more option-chain refresh will draw the line."
            : "The graph starts as soon as this strike receives a live quote."
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

function formatStrike(value: number) {
  return value.toFixed(0);
}

function formatMoney(value: number) {
  if (!Number.isFinite(value)) return "0.00";
  return value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
