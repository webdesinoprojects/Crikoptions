"use client";

import React, { useMemo } from "react";
import { usePerformance } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";
import { Skeleton } from "@/components/ui/skeleton";

export function EquityCurveChart() {
  const { data: perf, isLoading } = usePerformance();

  const option = useMemo(() => {
    if (!perf?.equityCurve || perf.equityCurve.length === 0) return {};

    const curve = perf.equityCurve;
    
    // Format full date/time for tooltips & formatted date strings for X-axis
    const formattedPoints = curve.map((p) => {
      const dateObj = new Date(p.timestamp * 1000);
      const dateLabel = dateObj.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
      const timeLabel = dateObj.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return {
        timestampLabel: `${dateLabel} ${timeLabel}`,
        dateLabel,
        equity: p.equity,
        // Cap drawdown at 100% max to prevent extreme percentages from ruining scaling
        drawdownPct: Math.min(100, Math.max(0, p.drawdown)),
      };
    });

    const times = formattedPoints.map((p) => p.dateLabel);
    const fullTimes = formattedPoints.map((p) => p.timestampLabel);
    const equities = formattedPoints.map((p) => p.equity);
    const drawdowns = formattedPoints.map((p) => -p.drawdownPct); // Negate for downward bars

    const baseCapital = equities[0] ?? 0;
    const maxEq = Math.max(...equities, baseCapital);
    const minEq = Math.min(...equities, baseCapital);
    const eqRange = maxEq - minEq || 100;
    
    const yMin = Math.floor(minEq - eqRange * 0.1);
    const yMax = Math.ceil(maxEq + eqRange * 0.1);

    return {
      tooltip: {
        trigger: "axis" as const,
        backgroundColor: "rgba(7, 19, 39, 0.95)",
        borderColor: "rgba(255, 255, 255, 0.12)",
        borderWidth: 1,
        padding: [10, 14],
        textStyle: { color: "#fff", fontSize: 11 },
        extraCssText: "backdrop-filter: blur(12px); border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.6);",
        formatter: (params: unknown) => {
          if (!Array.isArray(params) || params.length === 0) return "";
          const dataIndex = params[0]?.dataIndex ?? 0;
          const timeStr = fullTimes[dataIndex] || times[dataIndex] || "";
          const eqVal = equities[dataIndex] ?? 0;
          const ddVal = formattedPoints[dataIndex]?.drawdownPct ?? 0;

          return `
            <div style="display:flex;flex-direction:column;gap:6px;min-width:150px;">
              <div style="color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">${timeStr}</div>
              <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;">
                <span style="color:#cbd5e1;font-size:11px;font-weight:500;">Equity P&L</span>
                <span style="color:${eqVal >= 0 ? "#38bdf8" : "#f43f5e"};font-weight:800;font-size:12px;font-family:monospace;">
                  ${eqVal >= 0 ? "+" : "-"}₵${Math.abs(eqVal).toLocaleString("en-IN")}
                </span>
              </div>
              <div style="display:flex;justify-content:space-between;gap:16px;align-items:center;">
                <span style="color:#cbd5e1;font-size:11px;font-weight:500;">Drawdown</span>
                <span style="color:#ef4444;font-weight:800;font-size:12px;font-family:monospace;">
                  ${ddVal.toFixed(1)}%
                </span>
              </div>
            </div>
          `;
        },
      },
      grid: [
        { top: "10%", left: "65px", right: "20px", height: "54%" },
        { top: "72%", left: "65px", right: "20px", height: "18%" },
      ],
      xAxis: [
        {
          type: "category" as const,
          data: times,
          gridIndex: 0,
          boundaryGap: false,
          axisLine: { lineStyle: { color: "rgba(255, 255, 255, 0.1)" } },
          axisTick: { show: false },
          axisLabel: { show: false },
        },
        {
          type: "category" as const,
          data: times,
          gridIndex: 1,
          boundaryGap: false,
          axisLine: { lineStyle: { color: "rgba(255, 255, 255, 0.1)" } },
          axisTick: { show: false },
          axisLabel: {
            color: "#64748b",
            fontSize: 10,
            interval: "auto" as const,
            hideOverlap: true,
          },
        },
      ],
      yAxis: [
        {
          type: "value" as const,
          gridIndex: 0,
          min: yMin,
          max: yMax,
          splitNumber: 4,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: "#94a3b8",
            fontSize: 10,
            fontFamily: "monospace",
            formatter: (v: number) => {
              const abs = Math.abs(v);
              const sign = v < 0 ? "-" : "";
              if (abs >= 1000) {
                return `${sign}₵${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1)}K`;
              }
              return `${sign}₵${abs}`;
            },
          },
          splitLine: {
            lineStyle: { color: "rgba(255, 255, 255, 0.06)", type: "dashed" },
          },
        },
        {
          type: "value" as const,
          gridIndex: 1,
          min: -100,
          max: 0,
          interval: 50,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: "#64748b",
            fontSize: 9,
            fontFamily: "monospace",
            formatter: (v: number) => `${Math.abs(v)}%`,
          },
          splitLine: {
            lineStyle: { color: "rgba(255, 255, 255, 0.04)", type: "dotted" },
          },
        },
      ],
      series: [
        {
          name: "Equity",
          type: "line" as const,
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: equities,
          smooth: 0.25,
          symbol: "circle",
          symbolSize: 4,
          showSymbol: false,
          lineStyle: {
            color: "#38bdf8",
            width: 2.5,
            shadowColor: "rgba(56, 189, 248, 0.4)",
            shadowBlur: 8,
          },
          areaStyle: {
            color: {
              type: "linear" as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(56, 189, 248, 0.35)" },
                { offset: 1, color: "rgba(56, 189, 248, 0.0)" },
              ],
            },
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
            opacity: 0.85,
            borderRadius: [0, 0, 2, 2],
          },
          barMaxWidth: 8,
        },
      ],
    };
  }, [perf]);

  if (isLoading) {
    return (
      <TerminalPanel
        title="Equity Curve & Drawdown Analysis"
        className="h-[380px]"
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
      className="h-[380px]"
    >
      <div className="flex-1 min-h-0 relative">
        <EChartsWrapper option={option} />
      </div>
    </TerminalPanel>
  );
}
