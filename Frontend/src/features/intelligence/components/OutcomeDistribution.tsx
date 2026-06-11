"use client";

import React, { useMemo } from "react";
import { useOutcomeDistribution } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";
import { Skeleton } from "@/components/ui/skeleton";

interface OutcomeDistributionProps {
  matchId: string;
}

import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scaleX: 0, originX: 0 },
  visible: { opacity: 1, scaleX: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export function OutcomeDistribution({ matchId }: OutcomeDistributionProps) {
  const { data: outcomes, isLoading } = useOutcomeDistribution(matchId);

  const curveOption = useMemo(() => {
    const bellData = Array.from({ length: 60 }, (_, i) => {
      const x = (i - 30) / 10;
      return [i, Math.exp(-0.5 * x * x) * 100];
    });

    return {
      tooltip: {
        trigger: "axis" as const,
        formatter: "Score distribution range density",
      },
      grid: { top: "5%", left: "2%", right: "2%", bottom: "2%", containLabel: false },
      xAxis: { type: "value" as const, show: false, min: 0, max: 59 },
      yAxis: { type: "value" as const, show: false },
      series: [
        {
          type: "line" as const,
          data: bellData,
          smooth: true,
          symbol: "none",
          lineStyle: { color: "#4AF626", width: 2 },
          areaStyle: {
            color: {
              type: "linear" as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(74, 246, 38, 0.25)" },
                { offset: 1, color: "rgba(74, 246, 38, 0.02)" }
              ]
            }
          },
        },
      ],
    };
  }, []);

  const sentimentColor = (s: string) =>
    s === "BULLISH" ? "#4AF626" : s === "BEARISH" ? "#FF2A2A" : "#0EA5E9";

  return (
    <TerminalPanel
      title="[ OUTCOME DISTRIBUTIONS ]"
      subtitle="Score outcome curves computed from similar match states"
      className="h-[320px] rounded-none font-mono group"
    >
      <div className="flex-1 flex flex-col justify-between min-h-0 select-none">
        {/* Bell curve */}
        <div className="h-20 relative group-hover:scale-[1.02] transition-transform duration-700 ease-out origin-bottom">
          <EChartsWrapper option={curveOption} />
        </div>

        <div className="text-center text-[12px] font-bold text-[#4AF626] mt-2 tracking-widest drop-shadow-[0_0_8px_rgba(74,246,38,0.4)]">
          [ EXPECTED SCORE: 342 RUNS ]
        </div>

        {/* Probability bars */}
        <div className="space-y-3 mt-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full bg-white/5 animate-pulse rounded-none" />
            ))
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-3">
              {outcomes?.map((o) => (
                <div key={o.label}>
                  <div className="flex justify-between items-center text-[11px] mb-1 font-bold tracking-wide">
                    <span className="text-white font-medium">{o.range || o.label}</span>
                    <span className="font-bold drop-shadow-[0_0_4px_currentColor]" style={{ color: sentimentColor(o.sentiment) }}>
                      {o.probability}%
                    </span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-none overflow-hidden border border-white/10">
                    <motion.div
                      variants={itemVariants}
                      className="h-full rounded-none"
                      style={{
                        width: `${o.probability}%`,
                        backgroundColor: sentimentColor(o.sentiment),
                        boxShadow: `0 0 10px ${sentimentColor(o.sentiment)}40`
                      }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </TerminalPanel>
  );
}

