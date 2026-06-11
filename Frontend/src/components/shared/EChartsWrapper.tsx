"use client";

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { useTheme } from "next-themes";
import * as echarts from "echarts";

interface EChartsWrapperProps {
  option: echarts.EChartsOption;
  style?: React.CSSProperties;
  className?: string;
  onEvents?: Record<string, (params: any) => void>;
}

export function EChartsWrapper({
  option,
  style,
  className,
  onEvents,
}: EChartsWrapperProps) {
  const { resolvedTheme } = useTheme();
  const isDark = true; // Hardcoded true because the workstation is institutional dark theme

  const mergedOption = useMemo(() => {
    const defaultGrid = {
      top: 15,
      bottom: 25,
      left: 35,
      right: 15,
      containLabel: true,
      borderColor: "rgba(255, 255, 255, 0.05)",
      show: true,
    };

    const defaultTooltip = {
      trigger: "axis" as const,
      backgroundColor: "#081225",
      borderColor: "rgba(255, 255, 255, 0.1)",
      textStyle: {
        color: "#f8fafc",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 11,
      },
      padding: [6, 10],
      borderWidth: 1,
      shadowColor: "rgba(0, 0, 0, 0.5)",
      shadowBlur: 10,
    };

    const defaultAxis = {
      axisLine: {
        lineStyle: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      axisTick: {
        lineStyle: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      splitLine: {
        lineStyle: {
          color: "rgba(255, 255, 255, 0.05)",
          type: "dashed" as const,
        },
      },
      axisLabel: {
        color: "#94a3b8",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 10,
      },
    };

    // Construct deep merge of custom option with standard terminal theme defaults
    const finalOption: echarts.EChartsOption = {
      backgroundColor: "transparent",
      textStyle: {
        fontFamily: "Inter, sans-serif",
      },
      grid: option.grid ? { ...defaultGrid, ...option.grid } : defaultGrid,
      tooltip: option.tooltip ? { ...defaultTooltip, ...option.tooltip } : defaultTooltip,
      xAxis: Array.isArray(option.xAxis)
        ? option.xAxis.map((x) => ({ ...defaultAxis, ...x }))
        : option.xAxis
        ? { ...defaultAxis, ...option.xAxis }
        : undefined,
      yAxis: Array.isArray(option.yAxis)
        ? option.yAxis.map((y) => ({ ...defaultAxis, ...y }))
        : option.yAxis
        ? { ...defaultAxis, ...option.yAxis }
        : undefined,
      ...option,
    };

    return finalOption;
  }, [option]);

  return (
    <ReactECharts
      option={mergedOption}
      style={{ height: "100%", width: "100%", ...style }}
      className={className}
      theme="dark"
      onEvents={onEvents}
      notMerge={true}
    />
  );
}
