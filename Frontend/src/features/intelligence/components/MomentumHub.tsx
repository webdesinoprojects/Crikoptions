"use client";

import React, { useMemo } from "react";
import { useMomentum } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface MomentumHubProps {
  matchId: string;
}

const trendIcon = (t: string) =>
  t === "RISING" ? "↑" : t === "FALLING" ? "↓" : "→";
const trendColor = (t: string) =>
  t === "RISING" ? "#22c55e" : t === "FALLING" ? "#ef4444" : "#94a3b8";

export function MomentumHub({ matchId }: MomentumHubProps) {
  const { data: momentum, isLoading } = useMomentum(matchId);

  const gaugeOption = useMemo(() => {
    if (!momentum) return {};

    return {
      series: [
        {
          type: "gauge" as const,
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: 100,
          radius: "100%",
          center: ["50%", "65%"],
          pointer: {
            icon: "path://M12.8,0.7l12,20.1c0.6,1,0.3,2.4-0.7,3c-0.3,0.2-0.7,0.3-1,0.3h-24c-1.2,0-2.2-1-2.2-2.2c0-0.4,0.1-0.7,0.3-1l12-20.1C10.6-0.2,12-0.2,12.8,0.7z",
            length: "60%",
            width: 4,
            offsetCenter: [0, 5],
            itemStyle: { color: "#f8fafc" },
          },
          axisLine: {
            lineStyle: {
              width: 6,
              color: [
                [0.3, "#ef4444"], // Bearish
                [0.7, "#f59e0b"], // Neutral
                [1.0, "#22c55e"], // Bullish
              ] as [number, string][],
            },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            fontSize: 14,
            fontFamily: "JetBrains Mono, monospace",
            fontWeight: "bold",
            color: "#f8fafc",
            offsetCenter: [0, "20%"],
            formatter: (v: number) => `Index: ${Math.round(v)}`,
          },
          data: [{ value: momentum.score }],
        },
      ],
    };
  }, [momentum]);

  const metrics = momentum
    ? [
        { label: "Win Prob.", value: `${momentum.winProbability.toFixed(0)}%`, color: "#0ea5e9" },
        { label: "Pressure", value: `${momentum.pressureIndex.toFixed(0)}`, color: "#ef4444" },
        { label: "Run Rate", value: momentum.runRate.toFixed(2), color: "#22c55e" },
        ...(momentum.requiredRunRate
          ? [{ label: "Req. Rate", value: momentum.requiredRunRate.toFixed(2), color: "#f59e0b" }]
          : []),
      ]
    : [];

  return (
    <TerminalPanel
      title="Momentum Engine"
      subtitle="Win probability & tactical pressure index"
      className="h-[280px]"
      headerActions={
        momentum && (
          <motion.span
            key={momentum.trend}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[9px] font-bold px-1.5 py-0.5 rounded border font-mono"
            style={{
              color: trendColor(momentum.trend),
              borderColor: `${trendColor(momentum.trend)}30`,
              backgroundColor: `${trendColor(momentum.trend)}10`,
            }}
          >
            {trendIcon(momentum.trend)} {momentum.trend}
          </motion.span>
        )
      }
    >
      <div className="flex-1 flex flex-col justify-between min-h-0 select-none">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Skeleton className="h-full w-full bg-white/5 animate-pulse" />
          </div>
        ) : (
          <>
            <div className="h-28 relative">
              <EChartsWrapper option={gaugeOption} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
              {metrics.map((m) => (
                <div key={m.label} className="bg-surface-dim rounded px-2 py-1 text-center border border-outline/5">
                  <div className="text-[8px] text-on-surface-variant uppercase tracking-wider mb-0.5">{m.label}</div>
                  <div className="text-[12px] font-data-tabular font-bold" style={{ color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </TerminalPanel>
  );
}
