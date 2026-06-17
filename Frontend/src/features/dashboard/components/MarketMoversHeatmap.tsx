"use client";

import React, { useMemo } from "react";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";
import { AssetHeatmapMask } from "./AssetHeatmapMask";
import { useMarketMovers } from "@/features/dashboard/hooks";

export function MarketMoversHeatmap() {
  const { data: movers = [] } = useMarketMovers();
  const option = useMemo(() => {
    const symbols = movers.map((mover) => mover.symbol);
    const data = movers.map((mover, index) => [index, 0, mover.changePercent]);

    return {
      tooltip: {
        position: "top" as const,
        formatter: (params: unknown) => {
          const valueTuple = getHeatmapTuple(params);
          const symbolIndex = valueTuple?.[0] ?? 0;
          const value = valueTuple?.[2] ?? 0;
          const colorClass = value >= 0 ? "#22c55e" : "#ef4444";
          return `${symbols[symbolIndex] ?? "0"}: <span style="color:${colorClass};font-weight:bold;">${value >= 0 ? "+" : ""}${value}%</span>`;
        },
      },
      grid: { top: 10, bottom: 30, left: 50, right: 10 },
      xAxis: { type: "category" as const, data: symbols, splitArea: { show: true } },
      yAxis: { type: "category" as const, data: ["Change"], splitArea: { show: true } },
      visualMap: {
        min: -15,
        max: 15,
        calculable: true,
        orient: "horizontal" as const,
        left: "center",
        bottom: 0,
        itemWidth: 10,
        itemHeight: 120,
        textStyle: { color: "#94a3b8", fontSize: 9, fontFamily: "JetBrains Mono, monospace" },
        inRange: { color: ["#ef4444", "#0a1428", "#22c55e"] },
      },
      series: [
        {
          name: "Movers Heat",
          type: "heatmap" as const,
          data,
          label: {
            show: true,
            formatter: (params: unknown) => `${getHeatmapTuple(params)?.[2] ?? 0}%`,
            fontSize: 9,
            fontFamily: "JetBrains Mono, monospace",
            color: "#f8fafc",
          },
        },
      ],
    };
  }, [movers]);

  return (
    <TerminalPanel title="Market Movers Heatmap" subtitle="Backend market change by symbol" className="h-[260px]">
      <div className="flex-1 min-h-0 relative">
        <AssetHeatmapMask />
        {movers.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-on-surface-variant">
            No backend market movers
          </div>
        ) : (
          <EChartsWrapper option={option} />
        )}
      </div>
    </TerminalPanel>
  );
}

function getHeatmapTuple(params: unknown): [number, number, number] | null {
  if (
    typeof params === "object" &&
    params !== null &&
    "value" in params &&
    Array.isArray(params.value) &&
    params.value.length >= 3
  ) {
    const [x, y, value] = params.value;
    return [Number(x) || 0, Number(y) || 0, Number(value) || 0];
  }
  return null;
}
