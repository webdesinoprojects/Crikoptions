"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries, UTCTimestamp } from "lightweight-charts";
import { useMarketChart } from "../hooks";
import { DataSourceBadge } from "@/components/shared/DataSourceBadge";

interface MarketChartProps {
  marketId: string;
}

export function MarketChart({ marketId }: MarketChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  
  const { data: candles, isLoading } = useMarketChart(marketId, "1D");

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#737685", // outline color
      },
      grid: {
        vertLines: { color: "rgba(115, 118, 133, 0.1)" },
        horzLines: { color: "rgba(115, 118, 133, 0.1)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1, // Normal mode
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00B388", // bull-green
      downColor: "#E63946", // bear-red
      borderVisible: false,
      wickUpColor: "#00B388",
      wickDownColor: "#E63946",
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && candles && candles.length > 0) {
      // lightweight-charts expects data sorted by time ascending
      const sortedCandles = [...candles].sort((a, b) => a.timestamp - b.timestamp);
      const chartData = sortedCandles.map((c) => ({
        time: c.timestamp as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      seriesRef.current.setData(chartData);
    }
  }, [candles]);

  if (isLoading) {
    return <div className="h-[300px] flex items-center justify-center text-outline">Loading chart data...</div>;
  }

  return (
    <div className="w-full flex-grow relative">
      <div className="absolute right-2 top-2 z-10">
        <DataSourceBadge source="api" />
      </div>
      <div className="h-full w-full" ref={chartContainerRef} />
    </div>
  );
}
