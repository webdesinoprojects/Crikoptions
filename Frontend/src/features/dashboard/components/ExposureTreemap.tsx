"use client";

import React, { useMemo } from "react";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";

export function ExposureTreemap() {
  const option = useMemo(() => {
    return {
      tooltip: {
        formatter: "{b}: Value ₹{c} ({d}%)",
      },
      series: [
        {
          name: "Portfolio Exposure",
          type: "treemap" as const,
          visibleMin: 300,
          label: {
            show: true,
            formatter: "{b}\n₹{c}",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            color: "#f8fafc",
          },
          upperLabel: {
            show: false,
          },
          itemStyle: {
            borderColor: "#020617",
            borderWidth: 2,
            gapWidth: 1,
          },
          levels: [
            {
              itemStyle: {
                borderColor: "#020617",
                borderWidth: 2,
                gapWidth: 2,
              },
            },
          ],
          data: [
            {
              name: "V. Kohli",
              value: 86400,
              itemStyle: { color: "rgba(14, 165, 233, 0.8)" },
            },
            {
              name: "J. Bumrah",
              value: 62000,
              itemStyle: { color: "rgba(14, 165, 233, 0.6)" },
            },
            {
              name: "M. Dhoni",
              value: 48000,
              itemStyle: { color: "rgba(14, 165, 233, 0.5)" },
            },
            {
              name: "R. Sharma",
              value: 32000,
              itemStyle: { color: "rgba(14, 165, 233, 0.4)" },
            },
            {
              name: "S. Gill",
              value: 12000,
              itemStyle: { color: "rgba(14, 165, 233, 0.25)" },
            },
            {
              name: "Cash/Margin",
              value: 7420,
              itemStyle: { color: "rgba(14, 165, 233, 0.15)" },
            },
          ],
        },
      ],
    };
  }, []);

  return (
    <TerminalPanel
      title="Exposure Treemap"
      subtitle="Institutional asset concentration & margins"
      className="h-[260px]"
    >
      <div className="flex-1 min-h-0 relative">
        <EChartsWrapper option={option} />
      </div>
    </TerminalPanel>
  );
}
