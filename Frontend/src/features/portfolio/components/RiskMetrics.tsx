"use client";

import React, { useMemo } from "react";
import { usePortfolio } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskGraphWatermark } from "./RiskGraphWatermark";

function RiskGauge({
  label,
  value,
  max,
  unit,
  danger,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  danger: boolean;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const color = danger
    ? "#ef4444"
    : pct > 70
    ? "#f59e0b"
    : "#22c55e";

  return (
    <div className="space-y-1 select-none">
      <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
        <span>{label}</span>
        <span style={{ color }} className="font-data-tabular font-bold text-xs">
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function RiskMetrics() {
  const { data, isLoading } = usePortfolio();

  const donutOption = useMemo(() => {
    if (!data || data.positions.length === 0) return {};

    const slices = data.positions.map((p) => ({
      name: p.symbol,
      value: parseFloat(p.allocation.toFixed(1)),
    }));

    return {
      tooltip: {
        trigger: "item" as const,
        formatter: "{b}: {c}%",
      },
      legend: { show: false },
      series: [
        {
          type: "pie" as const,
          radius: ["50%", "75%"],
          center: ["50%", "50%"],
          data: slices,
          label: {
            show: true,
            position: "outside" as const,
            formatter: "{b}\n{c}%",
            color: "#94a3b8",
            fontSize: 9,
            fontFamily: "JetBrains Mono, monospace",
          },
          labelLine: { lineStyle: { color: "rgba(255,255,255,0.1)" } },
          itemStyle: { borderRadius: 2, borderColor: "#081225", borderWidth: 1.5 },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowColor: "rgba(14,165,233,0.3)" },
          },
          color: [
            "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6",
            "#ec4899", "#14b8a6", "#a855f7",
          ],
        },
      ],
    };
  }, [data]);

  if (isLoading) {
    return (
      <TerminalPanel density="dense" title="Risk Metrics & Concentration" className="h-[300px]" subtitle="Risk metrics">
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-full w-full bg-white/5 animate-pulse" />
        </div>
      </TerminalPanel>
    );
  }

  if (!data) return null;

  const rm = data.riskMetrics;

  return (
    <TerminalPanel
      density="dense"
      title="Risk Parameters & Stress Monitor"
      subtitle="Institutional concentration, leverage, and stress scenarios"
      className="h-[300px]"
    >
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 select-none">
        {/* Concentration donut */}
        <div className="flex flex-col min-h-0">
          <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold mb-1">
            Allocation Breakdown
          </span>
          {data.positions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant">
              No open positions
            </div>
          ) : (
            <div className="flex-1 relative">
              <EChartsWrapper option={donutOption} />
            </div>
          )}
        </div>

        {/* Risk gauges */}
        <div className="flex flex-col justify-between gap-4 overflow-y-auto pl-2">
          <div className="space-y-4">
            <RiskGauge
              label="Max Concentration"
              value={rm.maxConcentration}
              max={100}
              unit="%"
              danger={rm.maxConcentration > 50}
            />
            <RiskGauge
              label="Leverage Ratio"
              value={rm.leverageRatio}
              max={5}
              unit="×"
              danger={rm.leverageRatio > 3}
            />
            <RiskGauge
              label="Portfolio Volatility"
              value={rm.portfolioVolatility}
              max={30}
              unit="%"
              danger={rm.portfolioVolatility > 20}
            />
          </div>

          <div className="relative overflow-hidden rounded-xl border border-bear-red/30 bg-[#1a0505] p-4 shadow-[0_0_20px_rgba(239,68,68,0.1)] group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.15),transparent_70%)]" />
            <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-bear-red animate-ping opacity-75" />
            <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-bear-red" />
            <RiskGraphWatermark />
            <div className="relative z-10 flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-bear-red font-black mb-1 flex items-center gap-1.5">
                Stress Test Scenario
              </span>
              <p className="text-2xl font-mono font-bold text-bear-red drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                −₹{rm.stressTestLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-[10px] font-medium text-on-surface-variant mt-1.5 leading-snug">
                Est. max drawdown if all current open exposures instantly decline by 20%
              </p>
            </div>
          </div>
        </div>
      </div>
    </TerminalPanel>
  );
}
