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
  t === "RISING" ? "#4AF626" : t === "FALLING" ? "#FF2A2A" : "#94a3b8";

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
            itemStyle: { color: "#ffffff" },
          },
          axisLine: {
            lineStyle: {
              width: 6,
              color: [
                [0.3, "#FF2A2A"], // Bearish (hazard red)
                [0.7, "#FFB300"], // Neutral (amber)
                [1.0, "#4AF626"], // Bullish (terminal green)
              ] as [number, string][],
            },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            fontSize: 13,
            fontFamily: "JetBrains Mono, monospace",
            fontWeight: "bold" as const,
            color: "#ffffff",
            offsetCenter: [0, "20%"],
            formatter: (v: number) => `IDX: ${Math.round(v)}`,
          },
          data: [{ value: momentum.score }],
        },
      ],
    };
  }, [momentum]);

  const metrics = momentum
    ? [
        { label: "WIN PROB", value: `${momentum.winProbability.toFixed(0)}%`, color: "#0EA5E9" },
        { label: "PRESSURE", value: `${momentum.pressureIndex.toFixed(0)}`, color: "#FF2A2A" },
        { label: "RUN RATE", value: momentum.runRate.toFixed(2), color: "#4AF626" },
        ...(momentum.requiredRunRate
          ? [{ label: "REQ RATE", value: momentum.requiredRunRate.toFixed(2), color: "#FFB300" }]
          : []),
      ]
    : [];

  return (
    <TerminalPanel
      title="[ MOMENTUM ENGINE ]"
      subtitle="Win probability & tactical pressure index"
      className="h-[280px] rounded-none font-mono"
      headerActions={
        momentum && (
          <motion.span
            key={momentum.trend}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[9px] font-bold px-1.5 py-0.5 border rounded-none font-mono bg-black/40"
            style={{
              color: trendColor(momentum.trend),
              borderColor: `${trendColor(momentum.trend)}40`,
            }}
          >
            [{trendIcon(momentum.trend)} {momentum.trend}]
          </motion.span>
        )
      }
    >
      <div className="flex-1 flex flex-col justify-between min-h-0 select-none">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Skeleton className="h-full w-full bg-white/5 animate-pulse rounded-none" />
          </div>
        ) : (
          <>
            <div className="h-28 relative">
              <EChartsWrapper option={gaugeOption} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
              {metrics.map((m) => (
                <div key={m.label} className="bg-black/30 rounded-none px-2 py-1 text-center border border-white/5">
                  <div className="text-[8px] text-on-surface-variant uppercase tracking-wider mb-0.5">{m.label}</div>
                  <div className="text-[12px] font-bold font-mono" style={{ color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </TerminalPanel>
  );
}

