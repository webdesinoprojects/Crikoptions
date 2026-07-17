"use client";

import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineStyle,
  createChart,
} from "lightweight-charts";
import type {
  CandlestickData,
  HistogramData,
  IChartApi,
  ISeriesApi,
  MouseEventParams,
  Time,
  UTCTimestamp,
} from "lightweight-charts";
import { Radio, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StrikeCandle } from "../utils/option-chain-candles";
import {
  getInitialLogicalRange,
  isAtLiveEdge,
  shiftLogicalRange,
  translatePriceRange,
} from "../utils/chart-viewport";

interface InteractiveCandlestickChartProps {
  bucketMs: number;
  candles: StrikeCandle[];
}

interface PriceDragState {
  activated: boolean;
  initialRange: { from: number; to: number };
  paneHeight: number;
  startY: number;
}

export function InteractiveCandlestickChart({
  bucketMs,
  candles,
}: InteractiveCandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const candleCacheRef = useRef(new Map<number, CandlestickData<UTCTimestamp>>());
  const volumeCacheRef = useRef(new Map<number, HistogramData<UTCTimestamp>>());
  const candleMetaRef = useRef(new Map<number, StrikeCandle>());
  const dataCountRef = useRef(0);
  const firstTimeRef = useRef<number | null>(null);
  const latestTimeRef = useRef<number | null>(null);
  const dataInitializedRef = useRef(false);
  const atLiveEdgeRef = useRef(true);
  const [atLiveEdge, setAtLiveEdge] = useState(true);
  const [priceAuto, setPriceAuto] = useState(true);

  useEffect(() => {
    try {
      const chartContainer = chartContainerRef.current;
    if (!chartContainer) return;

    const chart = createChart(chartContainer, {
      width: chartContainer.clientWidth || 400,
      height: chartContainer.clientHeight || 300,
      layout: {
        background: { type: ColorType.Solid, color: "#030817" },
        textColor: "#94a3b8",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 10,
        panes: {
          separatorColor: "rgba(148,163,184,0.10)",
          separatorHoverColor: "rgba(34,211,238,0.28)",
          enableResize: true,
        },
      },
      grid: {
        vertLines: { color: "rgba(148,163,184,0.07)", style: LineStyle.Solid },
        horzLines: { color: "rgba(148,163,184,0.09)", style: LineStyle.Solid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "rgba(203,213,225,0.34)",
          labelBackgroundColor: "#071327",
          style: LineStyle.Dashed,
          width: 1,
        },
        horzLine: {
          color: "rgba(203,213,225,0.34)",
          labelBackgroundColor: "#071327",
          style: LineStyle.Dashed,
          width: 1,
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: { time: true, price: true },
        axisDoubleClickReset: { time: true, price: true },
      },
      kineticScroll: { mouse: true, touch: true },
      rightPriceScale: {
        autoScale: true,
        borderColor: "rgba(148,163,184,0.18)",
        scaleMargins: { top: 0.12, bottom: 0.08 },
        minimumWidth: 82,
      },
      timeScale: {
        borderColor: "rgba(148,163,184,0.18)",
        rightOffset: 3,
        barSpacing: 12,
        minBarSpacing: 3,
        timeVisible: true,
        secondsVisible: bucketMs < 60_000,
        shiftVisibleRangeOnNewBar: true,
        rightBarStaysOnScroll: true,
      },
      localization: {
        priceFormatter: formatMoney,
        timeFormatter: (time: Time) => formatChartTime(time, bucketMs),
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#16a34a",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#f87171",
      wickUpColor: "#22c55e",
      wickDownColor: "#f87171",
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
      priceLineColor: "rgba(34,211,238,0.52)",
      priceLineStyle: LineStyle.Dashed,
      priceLineWidth: 1,
      lastValueVisible: true,
    });
    const volumeSeries = chart.addSeries(
      HistogramSeries,
      {
        color: "rgba(148,163,184,0.24)",
        priceFormat: { type: "volume" },
        priceLineVisible: false,
        lastValueVisible: false,
        priceScaleId: '', // Use overlay to avoid pane layout issues
      }
    );

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 }, // Position at bottom 20%
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleVisibleRangeChange = (range: { from: number; to: number } | null) => {
      const nextAtLiveEdge = isAtLiveEdge(range, dataCountRef.current);
      atLiveEdgeRef.current = nextAtLiveEdge;
      setAtLiveEdge((current) => (current === nextAtLiveEdge ? current : nextAtLiveEdge));
    };
    chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

    const handleCrosshairMove = (param: MouseEventParams) => {
      updateTooltip(param, candleSeries, chartContainer, tooltipRef.current, candleMetaRef.current);
    };
    chart.subscribeCrosshairMove(handleCrosshairMove);

    let dragState: PriceDragState | null = null;
    let pendingDeltaY = 0;
    let pricePanFrame = 0;

    const applyPricePan = () => {
      pricePanFrame = 0;
      if (!dragState) return;

      const translated = translatePriceRange(
        dragState.initialRange,
        pendingDeltaY,
        dragState.paneHeight
      );
      const priceScale = candleSeries.priceScale();
      priceScale.setAutoScale(false);
      priceScale.setVisibleRange(translated);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;

      const rect = chartContainer.getBoundingClientRect();
      const paneSize = chart.paneSize(0);
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      if (localX < 0 || localX > paneSize.width || localY < 0 || localY > paneSize.height) return;

      const initialRange = candleSeries.priceScale().getVisibleRange();
      if (!initialRange) return;

      dragState = {
        activated: false,
        initialRange,
        paneHeight: paneSize.height,
        startY: event.clientY,
      };
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragState) return;

      pendingDeltaY = event.clientY - dragState.startY;
      if (!dragState.activated) {
        if (Math.abs(pendingDeltaY) < 4) return;
        dragState.activated = true;
        setPriceAuto(false);
      }

      if (!pricePanFrame) {
        pricePanFrame = window.requestAnimationFrame(applyPricePan);
      }
    };

    const finishPointerGesture = () => {
      if (pricePanFrame) {
        window.cancelAnimationFrame(pricePanFrame);
        applyPricePan();
      }
      dragState = null;
      setPriceAuto(candleSeries.priceScale().options().autoScale);
    };

    const syncPriceAutoState = () => {
      window.requestAnimationFrame(() => {
        setPriceAuto(candleSeries.priceScale().options().autoScale);
      });
    };

    chartContainer.addEventListener("pointerdown", handlePointerDown, true);
    chartContainer.addEventListener("dblclick", syncPriceAutoState, true);
    window.addEventListener("pointermove", handlePointerMove, true);
    window.addEventListener("pointerup", finishPointerGesture, true);
    window.addEventListener("pointercancel", finishPointerGesture, true);

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        chart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(chartContainer);

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chartContainer.removeEventListener("pointerdown", handlePointerDown, true);
      chartContainer.removeEventListener("dblclick", syncPriceAutoState, true);
      window.removeEventListener("pointermove", handlePointerMove, true);
      window.removeEventListener("pointerup", finishPointerGesture, true);
      window.removeEventListener("pointercancel", finishPointerGesture, true);
      resizeObserver.disconnect();
      if (pricePanFrame) window.cancelAnimationFrame(pricePanFrame);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
    } catch (e: any) {
      console.error("[DEBUG] Error in chart init:", e.message, e.stack);
    }
  }, [bucketMs]);

  useEffect(() => {
    try {
      const chart = chartRef.current;
    const candleSeries = candleSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;
    const chartContainer = chartContainerRef.current;
    if (!chart || !candleSeries || !volumeSeries || !chartContainer || candles.length === 0) return;

    const wasAtLiveEdge = atLiveEdgeRef.current;
    const previousLatestTime = latestTimeRef.current;
    const visibleLogicalRange = chart.timeScale().getVisibleLogicalRange();
    const visibleTimeRange = chart.timeScale().getVisibleRange();
    const previousFirstTime = firstTimeRef.current;
    const priceScale = candleSeries.priceScale();
    const wasPriceAuto = priceScale.options().autoScale;

    candles.forEach((candle) => {
      const time = toTimestamp(candle.time);
      candleCacheRef.current.set(Number(time), {
        time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      });
      volumeCacheRef.current.set(Number(time), {
        time,
        value: Math.max(candle.ticks, candle.bidQty + candle.askQty),
        color:
          candle.close >= candle.open
            ? "rgba(34,197,94,0.24)"
            : "rgba(239,68,68,0.24)",
      });
      candleMetaRef.current.set(Number(time), candle);
    });

    const candleData = Array.from(candleCacheRef.current.values()).sort(compareTime);
    const volumeData = Array.from(volumeCacheRef.current.values()).sort(compareTime);
    const firstTime = Number(candleData[0]?.time);
    const latestTime = Number(candleData[candleData.length - 1]?.time);
    const barsAddedBefore =
      previousFirstTime === null
        ? 0
        : Math.max(
            0,
            candleData.findIndex((item) => Number(item.time) === previousFirstTime)
          );
    dataCountRef.current = candleData.length;

    candleSeries.setData(candleData);
    volumeSeries.setData(volumeData);

    const visiblePriceRange = dataInitializedRef.current ? priceScale.getVisibleRange() : null;

    if (!dataInitializedRef.current) {
      dataInitializedRef.current = true;
      const initialRange = getInitialLogicalRange(candleData.length, chartContainer.clientWidth);
      if (initialRange) {
        chart.timeScale().setVisibleLogicalRange(initialRange);
      } else {
        chart.timeScale().fitContent();
      }
      atLiveEdgeRef.current = true;
      setAtLiveEdge(true);
    } else if (wasAtLiveEdge && previousLatestTime !== null && latestTime > previousLatestTime) {
      chart.timeScale().scrollToRealTime();
    } else if (visibleLogicalRange) {
      chart.timeScale().setVisibleLogicalRange(
        shiftLogicalRange(visibleLogicalRange, barsAddedBefore)
      );
    } else if (visibleTimeRange) {
      chart.timeScale().setVisibleRange(visibleTimeRange);
    }

    if (!wasPriceAuto && visiblePriceRange) {
      priceScale.setAutoScale(false);
      priceScale.setVisibleRange(visiblePriceRange);
      setPriceAuto(false);
    } else {
      priceScale.setAutoScale(true);
      setPriceAuto(true);
    }

    firstTimeRef.current = firstTime;
    latestTimeRef.current = latestTime;
    } catch (e: any) {
      console.error("[DEBUG] Error in data update:", e.message, e.stack);
    }
  }, [candles]);

  const goLive = () => {
    chartRef.current?.timeScale().scrollToRealTime();
    atLiveEdgeRef.current = true;
    setAtLiveEdge(true);
  };

  const resetPriceScale = () => {
    candleSeriesRef.current?.priceScale().setAutoScale(true);
    setPriceAuto(true);
  };

  return (
    <div className="relative h-full w-full overflow-hidden touch-none">
      <div ref={chartContainerRef} className="h-full w-full cursor-crosshair" />

      <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5">
        <ChartActionButton
          active={priceAuto}
          label="Auto Y"
          onClick={resetPriceScale}
          title="Reset and automatically fit the price axis"
        >
          <RotateCcw className="h-3 w-3" />
        </ChartActionButton>
        {!atLiveEdge && (
          <ChartActionButton active label="Go Live" onClick={goLive} title="Return to the latest candle">
            <Radio className="h-3 w-3" />
          </ChartActionButton>
        )}
      </div>

      <div
        ref={tooltipRef}
        className="pointer-events-none absolute z-30 hidden min-w-[196px] rounded-md border border-white/12 bg-[#030817]/96 px-3 py-2 font-data-tabular text-[10px] text-slate-200 shadow-[0_18px_44px_rgba(0,0,0,0.42)] backdrop-blur-md"
      />

      <div className="pointer-events-none absolute bottom-7 left-3 z-10 hidden rounded border border-white/8 bg-[#061022]/78 px-2 py-1 font-data-tabular text-[9px] uppercase tracking-wide text-slate-400 sm:block">
        Drag X/Y to pan &middot; Wheel to zoom &middot; Drag axes to scale
      </div>
    </div>
  );
}

function ChartActionButton({
  active,
  children,
  label,
  onClick,
  title,
}: {
  active: boolean;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded border px-2 font-data-tabular text-[9px] font-black uppercase tracking-wide shadow-[0_8px_22px_rgba(0,0,0,0.28)] transition-colors",
        active
          ? "border-cyan-300/25 bg-cyan-300/12 text-cyan-100"
          : "border-white/10 bg-[#061022]/90 text-slate-400 hover:border-cyan-300/20 hover:text-slate-200"
      )}
      onClick={onClick}
      title={title}
    >
      {children}
      {label}
    </button>
  );
}

function updateTooltip(
  param: MouseEventParams,
  candleSeries: ISeriesApi<"Candlestick">,
  chartContainer: HTMLDivElement,
  tooltip: HTMLDivElement | null,
  candleMeta: Map<number, StrikeCandle>
) {
  if (!tooltip || !param.point || param.time == null || param.paneIndex !== 0) {
    if (tooltip) tooltip.style.display = "none";
    return;
  }

  const data = param.seriesData.get(candleSeries);
  if (!data || !("open" in data) || typeof param.time !== "number") {
    tooltip.style.display = "none";
    return;
  }

  const meta = candleMeta.get(Number(param.time));
  const direction = data.close >= data.open ? "UP" : "DOWN";
  const directionColor = direction === "UP" ? "#86efac" : "#fca5a5";
  tooltip.innerHTML = [
    `<div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:6px;font-weight:900">`,
    `<span>${meta ? `${formatClock(meta.startedAt)} - ${formatClock(meta.endedAt)}` : formatChartTime(param.time, 1_000)}</span>`,
    `<span style="color:${directionColor}">${direction}</span>`,
    `</div>`,
    tooltipLine("Open", data.open),
    tooltipLine("High", data.high),
    tooltipLine("Low", data.low),
    tooltipLine("Close", data.close),
  ].join("");

  const tooltipWidth = 212;
  const tooltipHeight = 124;
  const left =
    param.point.x + tooltipWidth + 24 > chartContainer.clientWidth
      ? Math.max(12, param.point.x - tooltipWidth - 16)
      : param.point.x + 16;
  const top = Math.min(
    Math.max(42, param.point.y - tooltipHeight / 2),
    Math.max(42, chartContainer.clientHeight - tooltipHeight - 28)
  );
  tooltip.style.display = "block";
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function tooltipLine(label: string, value: number) {
  return `<div style="display:flex;justify-content:space-between;gap:16px;margin:2px 0"><span style="color:#94a3b8">${label}</span><strong style="color:#f8fafc">Rs ${formatMoney(value)}</strong></div>`;
}

function toTimestamp(timestampMs: number) {
  return Math.floor(timestampMs / 1000) as UTCTimestamp;
}

function compareTime<T extends { time: UTCTimestamp }>(left: T, right: T) {
  return Number(left.time) - Number(right.time);
}

function formatMoney(value: number) {
  if (!Number.isFinite(value)) return "0.00";
  return value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatClock(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatChartTime(time: Time, bucketMs: number) {
  const timestamp =
    typeof time === "number"
      ? time * 1000
      : typeof time === "string"
        ? new Date(`${time}T00:00:00Z`).getTime()
        : Date.UTC(time.year, time.month - 1, time.day);
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: bucketMs < 60_000 ? "2-digit" : undefined,
  });
}
