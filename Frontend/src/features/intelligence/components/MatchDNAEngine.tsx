"use client";

import React, { useMemo } from "react";
import { useDNAEngine } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface MatchDNAEngineProps {
  matchId: string;
}

export function MatchDNAEngine({ matchId }: MatchDNAEngineProps) {
  const { data: matches, heatmapMatrix, isLoading } = useDNAEngine(matchId);

  // Build flat ECharts heatmap data
  const heatmapData = useMemo(() => {
    const data: [number, number, number][] = [];
    heatmapMatrix.forEach((row, rowIdx) => {
      row.forEach((val, colIdx) => {
        data.push([colIdx, rowIdx, Math.round(val * 100)]);
      });
    });
    return data;
  }, [heatmapMatrix]);

  const heatmapOption = useMemo(() => {
    return {
      tooltip: {
        trigger: "item",
        formatter: (p: any) =>
          `Over ${p.data[0] + 1}, Match ${p.data[1] + 1}<br/>Similarity: <b>${p.data[2]}%</b>`,
      },
      grid: { top: "5%", left: "2%", right: "2%", bottom: "2%", containLabel: false },
      xAxis: {
        type: "category" as const,
        data: Array.from({ length: 12 }, (_, i) => `M${i + 1}`),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#94a3b8", fontSize: 9, fontFamily: "JetBrains Mono, monospace" },
      },
      yAxis: {
        type: "category" as const,
        data: Array.from({ length: 8 }, (_, i) => `S${i + 1}`),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#94a3b8", fontSize: 9, fontFamily: "JetBrains Mono, monospace" },
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: false,
        show: false,
        inRange: {
          color: ["#020617", "#040d1c", "#081225", "#0ea5e9", "#22c55e"],
        },
      },
      series: [
        {
          type: "heatmap" as const,
          data: heatmapData,
          itemStyle: { borderRadius: 1.5, borderColor: "#020617", borderWidth: 1 },
          progressive: 0,
        },
      ],
    };
  }, [heatmapData]);

  return (
    <TerminalPanel
      title="Match DNA Engine"
      subtitle="Correlation matrix mapping active play state to 10k+ historical games"
      className="h-[280px]"
    >
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 select-none">
        {/* Heatmap */}
        <div className="col-span-8 bg-[#020617]/40 rounded p-2 border border-outline/5 relative flex flex-col min-h-0">
          <span className="absolute top-2 left-2 z-10 text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
            SIMILARITY GRID
          </span>
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center animate-pulse">
              <Skeleton className="h-full w-full bg-white/5" />
            </div>
          ) : (
            <div className="flex-1 min-h-0 mt-4 relative">
              <EChartsWrapper option={heatmapOption} />
            </div>
          )}
        </div>

        {/* Similar Matches */}
        <div className="col-span-4 flex flex-col gap-2 overflow-y-auto">
          <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block">
            Top Fingerprints
          </span>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-white/5 animate-pulse" />
            ))
          ) : (
            matches.slice(0, 3).map((m, i) => (
              <motion.div
                key={m.matchId}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-2 rounded border cursor-pointer hover:border-primary/40 transition-colors flex flex-col gap-0.5 ${
                  i === 0 ? "bg-primary/10 border-primary/30" : "bg-surface-dim border-outline/10"
                }`}
              >
                <div className="flex justify-between items-center text-[9px] font-bold">
                  <span className={i === 0 ? "text-primary" : "text-on-surface-variant"}>
                    {m.similarity}% CORRELATION
                  </span>
                  {m.dnaConfirmed && (
                    <span className="px-1 bg-bull-green/20 text-bull-green rounded text-[8px] font-bold">
                      DNA✓
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-bold text-white truncate">
                  {m.teamA} vs {m.teamB}
                </div>
                <div className="text-[9px] text-on-surface-variant truncate">
                  {m.tournament} • {m.venue}
                </div>
                <div
                  className="text-[9px] font-bold mt-0.5"
                  style={{ color: m.outcome === "CHASED" ? "#22c55e" : "#f59e0b" }}
                >
                  {m.outcome === "CHASED" ? "CHASED" : "DEFENDED"} • {m.finalScore}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </TerminalPanel>
  );
}
