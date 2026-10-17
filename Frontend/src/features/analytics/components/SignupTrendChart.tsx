"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";
import type { DayCount } from "../services/analytics.service";

// Validated against the #030712 admin surface in dark mode: inside the
// lightness band and above 3:1 contrast. Single series, so no legend —
// the panel heading names it.
const SERIES_COLOR = "#0284c7";

export function SignupTrendChart({ data }: { data: DayCount[] }) {
  const option = useMemo<EChartsOption>(() => {
    const labels = data.map((d) =>
      new Date(`${d.date}T00:00:00Z`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    );
    const counts = data.map((d) => d.count);
    const peak = Math.max(...counts, 0);

    return {
      grid: { top: 16, bottom: 24, left: 8, right: 12, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "line", lineStyle: { color: "rgba(255,255,255,0.2)" } },
        valueFormatter: (value) => `${value} signup${value === 1 ? "" : "s"}`,
      },
      xAxis: {
        type: "category",
        data: labels,
        boundaryGap: false,
        // 30 points is too many to label; show roughly every fifth.
        axisLabel: { interval: Math.max(0, Math.floor(data.length / 6) - 1) },
      },
      yAxis: {
        type: "value",
        // Integer ticks only — fractional people are not a thing.
        minInterval: 1,
        // A flat-zero series still needs a sane axis.
        max: peak < 4 ? 4 : undefined,
      },
      series: [
        {
          name: "Signups",
          type: "line",
          data: counts,
          smooth: false,
          showSymbol: false,
          // Visible on hover only, so 30 points stay uncluttered.
          symbolSize: 8,
          lineStyle: { width: 2, color: SERIES_COLOR },
          itemStyle: { color: SERIES_COLOR },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(2,132,199,0.28)" },
                { offset: 1, color: "rgba(2,132,199,0)" },
              ],
            },
          },
        },
      ],
    };
  }, [data]);

  return (
    <div className="h-56 w-full">
      <EChartsWrapper option={option} />
    </div>
  );
}
