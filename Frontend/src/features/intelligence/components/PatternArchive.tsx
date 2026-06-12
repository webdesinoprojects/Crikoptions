"use client";

import React from "react";
import { usePatterns } from "../hooks";
import { motion, Variants } from "framer-motion";
import type { IntelligencePattern } from "../types/intelligence";
import { Skeleton } from "@/components/ui/skeleton";

interface PatternArchiveProps {
  matchId: string;
}

const categoryColors: Record<IntelligencePattern["category"], string> = {
  BATTING: "#4AF626",
  BOWLING: "#0EA5E9",
  MATCH_STATE: "#FFB300",
  PRESSURE: "#FF2A2A",
};

const matchColor = (pct: number) => {
  if (pct >= 75) return "#4AF626";
  if (pct >= 45) return "#0EA5E9";
  return "#FF2A2A";
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export function PatternArchive({ matchId }: PatternArchiveProps) {
  const { data: patterns, isLoading } = usePatterns(matchId);

  return (
    <div className="relative h-full min-h-[600px] font-mono group overflow-hidden border border-white/5 bg-[#020617]">
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>

      <div className="flex justify-between items-center px-4 py-2 bg-black/60 border-b border-white/10 relative z-10">
        <div>
          <h2 className="text-[12px] font-bold text-primary tracking-widest uppercase drop-shadow-[0_0_8px_currentColor]">
            [ PATTERN RECOGNITION ARCHIVE ]
          </h2>
          <p className="text-[9px] text-on-surface-variant uppercase mt-0.5">Backend pattern data</p>
        </div>
      </div>

      <div className="p-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 select-none text-[9px] font-mono">
          {isLoading ? (
            Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full bg-white/5 animate-pulse rounded-none" />
            ))
          ) : patterns && patterns.length > 0 ? (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="col-span-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {patterns.map((pattern) => {
                const catColor = categoryColors[pattern.category] ?? "#94a3b8";
                const mColor = matchColor(pattern.matchPct);
                return (
                  <motion.div
                    variants={itemVariants}
                    key={pattern.id}
                    className={`p-3 border cursor-pointer group/card flex flex-col justify-between rounded-none relative overflow-hidden transition-all duration-300 ${
                      pattern.status === "ACTIVE"
                        ? "border-primary/40 hover:border-[#4AF626] bg-[#020617] hover:shadow-[0_0_15px_rgba(74,246,38,0.15)]"
                        : "border-white/5 opacity-50 hover:opacity-100 bg-black/40 hover:border-white/20"
                    }`}
                  >
                    <div>
                      <div className="text-[9px] font-bold text-on-surface-variant mb-1 uppercase tracking-widest">#{pattern.id}</div>
                      <div className="text-[11px] font-bold text-white mb-1 group-hover/card:text-[#4AF626] transition-colors leading-tight uppercase drop-shadow-[0_0_4px_currentColor]">
                        {pattern.name}
                      </div>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed line-clamp-3 uppercase mt-2">{pattern.description}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 mt-4 pt-2 border-t border-white/10">
                      <span className="text-[9px] font-bold px-1.5 py-1 text-center bg-black/50 border border-white/5 tracking-wider" style={{ color: mColor }}>
                        {pattern.matchPct}% MATCH
                      </span>
                      <span
                        className="text-[9px] font-bold px-1.5 py-1 text-center border tracking-wider"
                        style={{ color: catColor, borderColor: `${catColor}30`, backgroundColor: `${catColor}10` }}
                      >
                        {pattern.category}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="col-span-full flex min-h-[220px] items-center justify-center text-xs text-on-surface-variant">
              No backend pattern archive data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
