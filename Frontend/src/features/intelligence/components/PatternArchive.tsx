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
  BATTING: "#22c55e",
  BOWLING: "#0ea5e9",
  MATCH_STATE: "#f59e0b",
  PRESSURE: "#ef4444",
};

const matchColor = (pct: number) => {
  if (pct >= 75) return "#22c55e";
  if (pct >= 45) return "#0ea5e9";
  return "#ef4444";
};

export function PatternArchive({ matchId }: PatternArchiveProps) {
  const { data: patterns, isLoading } = usePatterns(matchId);

  return (
    <TerminalPanel
      title="Pattern Recognition Archive"
      subtitle="Identified technical/event play patterns matching historical games"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 select-none text-[10px]">
        {isLoading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-white/5 animate-pulse" />
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
                  className={`p-2 rounded border cursor-pointer group flex flex-col justify-between ${
                    p.status === "ACTIVE"
                      ? "border-primary/20 hover:border-primary/50 bg-primary/5"
                      : "border-outline/5 opacity-50 bg-surface-dim"
                  }`}
                >
                  <div>
                    <div className="text-[8px] font-bold text-on-surface-variant font-data-tabular mb-0.5">{p.id}</div>
                    <div className="text-[10px] font-bold text-white mb-0.5 group-hover:text-primary transition-colors leading-tight truncate">
                      {p.name}
                    </div>
                    <p className="text-[9px] text-on-surface-variant leading-snug line-clamp-2">{p.description}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-outline/5">
                    <span
                      className="text-[8px] font-bold px-1 py-0.5 rounded font-data-tabular"
                      style={{ color: mColor, backgroundColor: `${mColor}15` }}
                    >
                      {p.matchPct}% Match
                    </span>
                    <span
                      className="text-[8px] font-bold px-1 py-0.5 rounded border"
                      style={{ color: catColor, borderColor: `${catColor}30`, backgroundColor: `${catColor}10` }}
                    >
                      {p.category}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {/* Add Pattern CTA */}
            <div className="flex items-center justify-center border border-dashed border-outline/20 hover:border-primary/50 rounded text-on-surface-variant hover:text-primary transition-all cursor-pointer p-3 min-h-[96px]">
              <span className="text-center font-bold text-[9px] uppercase tracking-wider">
                + New Pattern
              </span>
            </div>
          </>
        )}
      </div>
    </TerminalPanel>
  );
}
