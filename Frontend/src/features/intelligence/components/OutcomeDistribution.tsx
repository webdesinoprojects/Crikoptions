"use client";

import React, { useMemo } from "react";
import { useOutcomeDistribution } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";
import { Skeleton } from "@/components/ui/skeleton";

interface OutcomeDistributionProps {
  matchId: string;
}

export function OutcomeDistribution({ matchId }: OutcomeDistributionProps) {
  const { data: outcomes, isLoading } = useOutcomeDistribution(matchId);

  const curveOption = useMemo(() => {
    const bellData = Array.from({ length: 60 }, (_, i) => {
      const x = (i - 30) / 10;
      return [i, Math.exp(-0.5 * x * x) * 100];
    });

    return {
      tooltip: {
        trigger: "axis" as const,
        formatter: "Score distribution range density",
      },
      grid: { top: "5%", left: "2%", right: "2%", bottom: "2%", containLabel: false },
      xAxis: { type: "value" as const, show: false, min: 0, max: 59 },
      yAxis: { type: "value" as const, show: false },
      series: [
        {
          type: "line" as const,
          data: bellData,
          smooth: true,
          symbol: "none",
          lineStyle: { color: "#4AF626", width: 1.5 },
          areaStyle: {
            color: {
              type: "linear" as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(74, 246, 38, 0.2)" },
                { offset: 1, color: "rgba(74, 246, 38, 0.01)" }
              ]
            }
          },
        },
      ],
    };
  }, []);

  const sentimentColor = (s: string) =>
    s === "BULLISH" ? "#4AF626" : s === "BEARISH" ? "#FF2A2A" : "#0EA5E9";

  return (
    <TerminalPanel
      title="[ OUTCOME DISTRIBUTIONS ]"
      subtitle="Score outcome curves computed from similar match states"
      className="h-[280px] rounded-none font-mono"
    >
      <div className="flex-1 flex flex-col justify-between min-h-0 select-none">
        {/* Bell curve */}
        <div className="h-16 relative">
          <EChartsWrapper option={curveOption} />
        </div>

        <div className="text-center text-[9px] font-bold text-[#4AF626] -mt-1">
          [ EXPECTED SCORE: 342 RUNS ]
        </div>

        {/* Probability bars */}
        <div className="space-y-2 mt-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full bg-white/5 animate-pulse rounded-none" />
            ))
          ) : (
            outcomes?.map((o) => (
              <div key={o.label}>
                <div className="flex justify-between items-center text-[10px] mb-0.5 font-bold">
                  <span className="text-on-surface-variant font-medium">{o.range || o.label}</span>
                  <span className="font-bold" style={{ color: sentimentColor(o.sentiment) }}>
                    {o.probability}%
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-none overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-none transition-all duration-700"
                    style={{
                      width: `${o.probability}%`,
                      backgroundColor: sentimentColor(o.sentiment),
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </TerminalPanel>
  );
}

