"use client";

import React, { useMemo } from "react";
import { usePerformance } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";
import { Skeleton } from "@/components/ui/skeleton";

export function EquityCurveChart() {
  const { data: perf, isLoading } = usePerformance();

  const option = useMemo(() => {
    if (!perf?.equityCurve) return {};

    const curve = perf.equityCurve;
    const times = curve.map((p) =>
      new Date(p.timestamp * 1000).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      })
    );
    const equities = curve.map((p) => p.equity);
    const drawdowns = curve.map((p) => -p.drawdown); // Negate for downward representation

    const baseCapital = equities[0] ?? 0;
    const maxEquity = Math.max(...equities, baseCapital + 1);
    const minEquity = Math.min(...equities, baseCapital - 1);

    return {
      tooltip: {
        trigger: "axis" as const,
        backgroundColor: "rgba(6, 13, 26, 0.85)",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: "#fff", fontSize: 11, fontFamily: "JetBrains Mono" },
        extraCssText: "backdrop-filter: blur(8px); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);",
        formatter: (params: unknown) => {
          const [eq, dd] = getAxisTooltipParams(params);
          return `
            <div style="display:flex;flex-direction:column;gap:4px;">
              <div style="color:#94a3b8;font-size:9px;text-transform:uppercase;letter-spacing:1px;font-weight:bold;">${eq.axisValue}</div>
              <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;">
                <span style="color:#e2e8f0;">Equity</span>
                <span style="color:#22c55e;font-weight:bold;text-shadow:0 0 8px rgba(34,197,94,0.4)">₵${Number(eq.data).toLocaleString("en-IN")}</span>
              </div>
              ${dd ? `
              <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;">
                <span style="color:#e2e8f0;">Drawdown</span>
                <span style="color:#ef4444;font-weight:bold;text-shadow:0 0 8px rgba(239,68,68,0.4)">${Math.abs(Number(dd.data)).toFixed(2)}%</span>
              </div>` : ""}
            </div>
          `;
        },
      },
      grid: [
        { top: "10%", left: "5%", right: "2%", height: "55%" },
        { top: "75%", left: "5%", right: "2%", height: "20%" },
      ],
      xAxis: [
        {
          type: "category" as const,
          data: times,
          gridIndex: 0,
        },
        {
          type: "category" as const,
          data: times,
          gridIndex: 1,
          axisLabel: { show: false },
        },
      ],
      yAxis: [
        {
          type: "value" as const,
          gridIndex: 0,
          min: Math.floor(minEquity * 0.98),
          max: Math.ceil(maxEquity * 1.02),
          axisLabel: {
            formatter: (v: number) => `₵${(v / 1000).toFixed(0)}K`,
          },
        },
        {
          type: "value" as const,
          gridIndex: 1,
          axisLabel: {
            formatter: (v: number) => `${Math.abs(v).toFixed(0)}%`,
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: "Equity",
          type: "line" as const,
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: equities,
          smooth: true,
          symbol: "none",
          lineStyle: { 
            color: "#0ea5e9", 
            width: 2,
            shadowColor: "rgba(14,165,233,0.5)",
            shadowBlur: 10,
            shadowOffsetY: 5
          },
          areaStyle: {
            color: {
              type: "linear" as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(14, 165, 233, 0.4)" },
                { offset: 1, color: "rgba(14, 165, 233, 0.0)" }
              ]
            }
          },
        },
        {
          name: "Drawdown",
          type: "bar" as const,
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: drawdowns,
          itemStyle: { 
            color: "#ef4444", 
            opacity: 0.9,
            borderRadius: [2, 2, 0, 0]
          },
          barMaxWidth: 6,
        },
      ],
    };
  }, [perf]);

  if (isLoading) {
    return (
      <TerminalPanel
        title="Equity Curve & Drawdown Analysis"
        className="h-[300px]"
        subtitle="Performance tracking ledger"
      >
        <div className="flex-1 flex items-center justify-center animate-pulse">
          <Skeleton className="h-full w-full bg-white/5" />
        </div>
      </TerminalPanel>
    );
  }

  return (
    <TerminalPanel
      density="dense"
      title="Equity Curve & Drawdown Analysis"
      subtitle="Comprehensive performance & downside tracking"
      className="h-[300px]"
    >
      <div className="flex-1 min-h-0 relative">
        <EChartsWrapper option={option} />
      </div>
    </TerminalPanel>
  );
}

function getAxisTooltipParams(params: unknown): { axisValue: string; data: number }[] {
  if (!Array.isArray(params)) {
    return [{ axisValue: "0", data: 0 }];
  }

  return params.map((param) => {
    if (typeof param !== "object" || param === null) {
      return { axisValue: "0", data: 0 };
    }

    const axisValue = "axisValue" in param ? String(param.axisValue ?? "0") : "0";
    const data = "data" in param ? Number(param.data) || 0 : 0;
    return { axisValue, data };
  });
}
