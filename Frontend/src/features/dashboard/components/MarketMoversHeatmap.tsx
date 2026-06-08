"use client";

import React, { useMemo } from "react";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";

export function MarketMoversHeatmap() {
  const option = useMemo(() => {
    // 5x3 heat grid representing player stocks & daily changes
    const hours = ["BAT", "BOWL", "ALL"];
    const days = ["RCB", "CSK", "MI", "SRH", "KKR"];

    const data = [
      [0, 0, 8.4], [1, 0, 12.5], [2, 0, -3.2], [3, 0, 4.1], [4, 0, 6.2], // Batter row
      [0, 1, -1.5], [1, 1, 8.2], [2, 1, 5.5], [3, 1, -6.1], [4, 1, 2.8],  // Bowler row
      [0, 2, -15.4], [1, 2, 0.5], [2, 2, -4.2], [3, 2, 7.8], [4, 2, 11.2], // All-rounder row
    ];

    return {
      tooltip: {
        position: "top" as const,
        formatter: (params: any) => {
          const value = params.value[2];
          const colorClass = value >= 0 ? "#22c55e" : "#ef4444";
          return `${days[params.value[0]]} ${hours[params.value[1]]}: <span style="color:${colorClass};font-weight:bold;">${value >= 0 ? "+" : ""}${value}%</span>`;
        },
      },
      grid: {
        top: 10,
        bottom: 30,
        left: 50,
        right: 10,
      },
      xAxis: {
        type: "category" as const,
        data: days,
        splitArea: {
          show: true,
        },
      },
      yAxis: {
        type: "category" as const,
        data: hours,
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        min: -15,
        max: 15,
        calculable: true,
        orient: "horizontal" as const,
        left: "center",
        bottom: 0,
        itemWidth: 10,
        itemHeight: 120,
        textStyle: {
          color: "#94a3b8",
          fontSize: 9,
          fontFamily: "JetBrains Mono, monospace",
        },
        inRange: {
          color: ["#ef4444", "#0a1428", "#22c55e"], // Bear-red to dark-blue to Bull-green
        },
      },
      series: [
        {
          name: "Movers Heat",
          type: "heatmap" as const,
          data: data,
          label: {
            show: true,
            formatter: (params: any) => `${params.value[2]}%`,
            fontSize: 9,
            fontFamily: "JetBrains Mono, monospace",
            color: "#f8fafc",
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
  }, []);

  return (
    <TerminalPanel
      title="Market Movers Heatmap"
      subtitle="Z-score pricing variance per squad / category"
      className="h-[260px]"
    >
      <div className="flex-1 min-h-0 relative">
        <EChartsWrapper option={option} />
      </div>
    </TerminalPanel>
  );
}
