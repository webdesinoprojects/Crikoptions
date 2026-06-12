"use client";

import React, { useMemo } from "react";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";
import { AssetHeatmapMask } from "./AssetHeatmapMask";
import { usePositions } from "@/features/portfolio/hooks";

export function ExposureTreemap() {
  const { data: positions = [] } = usePositions();
  const option = useMemo(() => {
    return {
      tooltip: {
        formatter: "{b}: Value Rs {c}",
      },
      series: [
        {
          name: "Portfolio Exposure",
          type: "treemap" as const,
          visibleMin: 0,
          label: {
            show: true,
            formatter: "{b}\nRs {c}",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            color: "#f8fafc",
          },
          itemStyle: {
            borderColor: "#020617",
            borderWidth: 2,
            gapWidth: 1,
          },
          data: positions.map((position) => ({
            name: position.symbol,
            value: position.notional,
            itemStyle: { color: "rgba(14, 165, 233, 0.65)" },
          })),
        },
      ],
    };
  }, [positions]);

  return (
    <TerminalPanel title="Exposure Treemap" subtitle="Backend open-position concentration" className="h-[260px]">
      <div className="flex-1 min-h-0 relative">
        <AssetHeatmapMask />
        {positions.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-on-surface-variant">
            No active exposure
          </div>
        ) : (
          <EChartsWrapper option={option} />
        )}
      </div>
    </TerminalPanel>
  );
}
