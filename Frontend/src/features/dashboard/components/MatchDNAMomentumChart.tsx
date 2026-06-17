"use client";

import React, { useMemo } from "react";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";
import { useLiveMatches } from "@/features/dashboard/hooks";

export function MatchDNAMomentumChart() {
  const { data: matches = [] } = useLiveMatches();

  const labels = matches.map((match) => match.title || "0");
  const values = matches.map((match) => {
    const score = Number.parseFloat(match.homeScore?.split("/")[0] ?? "0") || 0;
    const wickets = Number.parseFloat(match.homeScore?.split("/")[1] ?? "0") || 0;
    const over = Number.parseFloat(match.currentOver ?? "0") || 0;
    const runRate = over > 0 ? score / over : 0;
    return Math.max(0, Math.min(100, Math.round(runRate * 10 - wickets * 5)));
  });

  const option = useMemo(() => {
    return {
      tooltip: { trigger: "axis" as const, formatter: "{b}: Momentum {c}%" },
      xAxis: {
        type: "category" as const,
        boundaryGap: false,
        data: labels,
        name: "MATCH",
        nameLocation: "middle" as const,
        nameGap: 20,
      },
      yAxis: {
        type: "value" as const,
        min: 0,
        max: 100,
        name: "MOMENTUM INDEX",
        nameGap: 15,
      },
      series: [
        {
          name: "Momentum",
          type: "line" as const,
          smooth: true,
          data: values,
          symbol: "circle",
          lineStyle: { color: "#0ea5e9", width: 2 },
          areaStyle: {
            color: {
              type: "linear" as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(14, 165, 233, 0.2)" },
                { offset: 1, color: "rgba(14, 165, 233, 0)" },
              ],
            },
          },
        },
      ],
    };
  }, [labels, values]);

  return (
    <TerminalPanel title="Match DNA Momentum Chart" subtitle="Derived from backend match score state" className="h-[280px]">
      <div className="flex-1 min-h-0 relative">
        {values.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-on-surface-variant">
            No backend match momentum data
          </div>
        ) : (
          <EChartsWrapper option={option} />
        )}
      </div>
    </TerminalPanel>
  );
}
