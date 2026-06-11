"use client";

import React, { useMemo } from "react";
import { useDNAEngine } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";
import { motion, Variants } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { DNAHelixFrame } from "./DNAHelixFrame";

interface MatchDNAEngineProps {
  matchId: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 120, damping: 14 } },
};

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
        trigger: "item" as const,
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
          color: ["#020617", "#052e16", "#15803d", "#22c55e", "#4AF626"],
        },
      },
      series: [
        {
          type: "heatmap" as const,
          data: heatmapData,
          itemStyle: { borderRadius: 0, borderColor: "#020617", borderWidth: 1 },
          progressive: 0,
        },
      ],
    };
  }, [heatmapData]);

  return (
    <TerminalPanel
      title="[ MATCH DNA ENGINE ]"
      subtitle="Correlation matrix mapping active play state to 10k+ historical games"
      className="h-[320px] rounded-none font-mono relative overflow-hidden group"
    >
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 select-none pr-8">
        {/* Heatmap */}
        <div className="col-span-8 bg-[#020617]/40 rounded-none p-2 border border-white/10 relative flex flex-col min-h-0 overflow-hidden">
          <span className="absolute top-2 left-2 z-10 text-[8px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 border border-primary/45 rounded-none">
            [ SIMILARITY GRID ]
          </span>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center animate-pulse">
              <Skeleton className="h-full w-full bg-white/5 rounded-none" />
            </div>
          ) : (
            <div className="flex-1 min-h-0 mt-4 relative group-hover:scale-[1.01] transition-transform duration-700 ease-out origin-center">
              <EChartsWrapper option={heatmapOption} />
            </div>
          )}
        </div>

        {/* Similar Matches */}
        <div className="col-span-4 flex flex-col gap-3 overflow-y-auto pr-1">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
            [ TOP FINGERPRINTS ]
          </span>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-white/5 animate-pulse rounded-none" />
            ))
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-2"
            >
              {matches.slice(0, 3).map((m, i) => (
                <motion.div
                  key={m.matchId}
                  variants={itemVariants}
                  className={`p-3 border cursor-pointer hover:border-[#4AF626] flex flex-col gap-1 rounded-none hover:bg-black group/card relative overflow-hidden transition-colors ${
                    i === 0 ? "bg-primary/5 border-primary/45" : "bg-black/30 border-white/5"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/card:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className={i === 0 ? "text-[#4AF626]" : "text-on-surface-variant group-hover/card:text-white transition-colors"}>
                      {m.similarity}% CORRELATION
                    </span>
                    {m.dnaConfirmed && (
                      <span className="text-[#4AF626] text-[9px] font-bold border border-[#4AF626]/30 px-1 rounded-none">
                        [DNA:OK]
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white truncate tracking-wide">
                    {m.teamA} v {m.teamB}
                  </div>
                  <div className="text-[10px] text-on-surface-variant truncate font-medium">
                    {m.tournament} // {m.venue}
                  </div>
                  <div
                    className="text-[10px] font-bold mt-1 tracking-wider"
                    style={{ color: m.outcome === "CHASED" ? "#4AF626" : "#FFB300" }}
                  >
                    {m.outcome === "CHASED" ? "CHASED" : "DEFENDED"} // {m.finalScore}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
      <DNAHelixFrame />
    </TerminalPanel>
  );
}

