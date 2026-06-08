"use client";

import React from "react";
import { useEventImpacts } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface EventImpactEngineProps {
  matchId: string;
}

const eventIcons: Record<string, string> = {
  WICKET: "💀",
  BOUNDARY: "🏏",
  SIX: "🚀",
  POWERPLAY_END: "⚡",
  DEATH_OVER_START: "💥",
  PARTNERSHIP_BROKEN: "🔗",
};

export function EventImpactEngine({ matchId }: EventImpactEngineProps) {
  const { data: impacts, isLoading } = useEventImpacts(matchId);

  return (
    <TerminalPanel
      title="Event Impact Engine"
      subtitle="Estimated volatility delta shifts triggered per game event"
      className="h-[280px]"
    >
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 select-none text-[10px]">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full bg-white/5 animate-pulse" />
          ))
        ) : (
          impacts?.map((impact, i) => (
            <motion.div
              key={impact.event}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-2 px-2 py-1 rounded bg-surface-dim border border-outline/5 hover:border-outline/10 transition-colors"
            >
              <span className="text-xs w-5 text-center shrink-0">{eventIcons[impact.event]}</span>
              <span className="flex-1 font-bold text-white truncate">
                {impact.label}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-14 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(impact.volatilityDelta * 4, 100)}%`,
                      backgroundColor: impact.direction === "UP" ? "#ef4444" : "#22c55e",
                    }}
                  />
                </div>
                <span
                  className="font-data-tabular font-bold w-10 text-right text-[10px]"
                  style={{ color: impact.direction === "UP" ? "#ef4444" : "#22c55e" }}
                >
                  {impact.direction === "UP" ? "+" : "-"}{impact.volatilityDelta}%
                </span>
              </div>
              <span className="font-data-tabular text-on-surface-variant w-8 text-right text-[9px] font-bold">
                {impact.confidence}%
              </span>
            </motion.div>
          ))
        )}
      </div>
    </TerminalPanel>
  );
}
