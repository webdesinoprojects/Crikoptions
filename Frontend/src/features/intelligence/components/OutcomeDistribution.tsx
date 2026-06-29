"use client";

import React, { useMemo } from "react";
import { useOutcomeDistribution } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, Variants } from "framer-motion";

interface OutcomeDistributionProps {
  matchId: string;
}

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
    const data = outcomes?.map((outcome) => outcome.probability) ?? [];
    return {
      tooltip: { trigger: "axis" as const, formatter: "Backend probability distribution" },
      grid: { top: "5%", left: "2%", right: "2%", bottom: "2%", containLabel: false },
      xAxis: { type: "category" as const, show: false, data: outcomes?.map((outcome) => outcome.label) ?? [] },
      yAxis: { type: "value" as const, show: false, min: 0, max: 100 },
      series: [
        {
          type: "line" as const,
          data,
          smooth: true,
          symbol: "none",
          lineStyle: { color: "#4AF626", width: 2 },
        },
      ],
    };
  }, [outcomes]);

  const sentimentColor = (s: string) =>
    s === "BULLISH" ? "#4AF626" : s === "BEARISH" ? "#FF2A2A" : "#0EA5E9";

  return (
    <TerminalPanel
      title="[ OUTCOME DISTRIBUTIONS ]"
      subtitle="Backend outcome probability data"
      className="h-auto lg:h-[320px] rounded-none font-mono group"
    >
      <div className="flex-1 flex flex-col justify-between min-h-0 select-none">
        <div className="h-20 relative">
          {outcomes && outcomes.length > 0 ? (
            <EChartsWrapper option={curveOption} />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-on-surface-variant">
              No backend outcome curve
            </div>
          )}
        </div>

        <div className="text-center text-[12px] font-bold text-[#4AF626] mt-2 tracking-widest drop-shadow-[0_0_8px_rgba(74,246,38,0.4)]">
          [ EXPECTED SCORE: 0 RUNS ]
        </div>

        <div className="space-y-3 mt-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full bg-white/5 animate-pulse rounded-none" />
            ))
          ) : outcomes && outcomes.length > 0 ? (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-3">
              {outcomes.map((o) => (
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
                        boxShadow: `0 0 10px ${sentimentColor(o.sentiment)}40`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <div className="py-8 text-center text-xs text-on-surface-variant">
              No backend outcome distribution
            </div>
          )}
        </div>
      </div>
    </TerminalPanel>
  );
}
