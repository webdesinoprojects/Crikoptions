"use client";

import React, { useEffect, useState, useMemo } from "react";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";

export function MatchDNAMomentumChart() {
  const [data, setData] = useState<number[]>([42, 45, 43, 48, 52, 58, 55, 60, 62, 65]);
  const [labels, setLabels] = useState<string[]>([
    "1.0", "2.0", "3.0", "4.0", "5.0", "6.0", "7.0", "8.0", "9.0", "10.0"
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const nextData = [...prev.slice(1)];
        const lastVal = prev[prev.length - 1];
        const change = (Math.random() - 0.48) * 8; // Slight upward bias
        const nextVal = Math.min(100, Math.max(0, parseFloat((lastVal + change).toFixed(1))));
        nextData.push(nextVal);
        return nextData;
      });

      setLabels((prev) => {
        const nextLabels = [...prev.slice(1)];
        const lastLabelVal = parseFloat(prev[prev.length - 1]);
        const nextLabelVal = (lastLabelVal + 1.0).toFixed(1);
        nextLabels.push(nextLabelVal);
        return nextLabels;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const option = useMemo(() => {
    return {
      tooltip: {
        trigger: "axis" as const,
        formatter: "{b} Over: Momentum {c}%",
      },
      xAxis: {
        type: "category" as const,
        boundaryGap: false,
        data: labels,
        name: "OVERS",
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
          data: data,
          symbol: "none",
          lineStyle: {
            color: "#0ea5e9",
            width: 2,
          },
          areaStyle: {
            color: {
              type: "linear" as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(14, 165, 233, 0.2)" },
                { offset: 1, color: "rgba(14, 165, 233, 0)" }
              ]
            }
          },
        },
      ],
    };
  }, [data, labels]);

  return (
    <TerminalPanel
      title="Match DNA Momentum Chart"
      subtitle="Real-time predictive game momentum swing index"
      className="h-[280px]"
    >
      <div className="flex-1 min-h-0 relative">
        <EChartsWrapper option={option} />
      </div>
    </TerminalPanel>
  );
}
