"use client";

import React from "react";
import { usePatterns } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { motion } from "framer-motion";
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

export function PatternArchive({ matchId }: PatternArchiveProps) {
  const { data: patterns, isLoading } = usePatterns(matchId);

  return (
    <TerminalPanel
      title="[ PATTERN RECOGNITION ARCHIVE ]"
      subtitle="Identified technical/event play patterns matching historical games"
      className="rounded-none font-mono"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 select-none text-[9px] font-mono">
        {isLoading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-none" />
          ))
        ) : (
          <>
            {patterns?.map((p, i) => {
              const catColor = categoryColors[p.category] ?? "#94a3b8";
              const mColor = matchColor(p.matchPct);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`p-2 border cursor-pointer group flex flex-col justify-between rounded-none ${
                    p.status === "ACTIVE"
                      ? "border-primary/45 hover:border-[#4AF626]/50 bg-[#4AF626]/5"
                      : "border-white/5 opacity-40 bg-black/20"
                  }`}
                >
                  <div>
                    <div className="text-[8px] font-bold text-on-surface-variant mb-0.5">#{p.id}</div>
                    <div className="text-[10px] font-bold text-white mb-0.5 group-hover:text-[#4AF626] transition-colors leading-tight truncate uppercase">
                      {p.name}
                    </div>
                    <p className="text-[9px] text-on-surface-variant leading-snug line-clamp-2 uppercase">{p.description}</p>
                  </div>

                  <div className="flex flex-col gap-1 mt-2 pt-1 border-t border-white/5">
                    <span
                      className="text-[8px] font-bold px-1 py-0.5 text-center bg-black/30 border border-white/5"
                      style={{ color: mColor }}
                    >
                      {p.matchPct}% MATCH
                    </span>
                    <span
                      className="text-[8px] font-bold px-1 py-0.5 text-center border border-white/5"
                      style={{ color: catColor, borderColor: `${catColor}30`, backgroundColor: `${catColor}10` }}
                    >
                      {p.category}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {/* Add Pattern CTA */}
            <div className="flex items-center justify-center border border-dashed border-white/20 hover:border-[#4AF626]/50 rounded-none text-on-surface-variant hover:text-[#4AF626] transition-all cursor-pointer p-3 min-h-[96px]">
              <span className="text-center font-bold text-[9px] uppercase tracking-wider">
                [ + NEW PATTERN ]
              </span>
            </div>
          </>
        )}
      </div>
    </TerminalPanel>
  );
}

