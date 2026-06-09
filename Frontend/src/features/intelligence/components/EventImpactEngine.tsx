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
      title="[ EVENT IMPACT ENGINE ]"
      subtitle="Estimated volatility delta shifts triggered per game event"
      className="h-[280px] rounded-none font-mono"
    >
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0 select-none text-[9px]">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full bg-white/5 animate-pulse rounded-none" />
          ))
        ) : (
          impacts?.map((impact, i) => (
            <motion.div
              key={impact.event}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-2 px-2 py-1 bg-black/30 border border-white/5 hover:border-white/15 transition-colors rounded-none"
            >
              <span className="text-[10px] w-6 text-center shrink-0 border-r border-white/5 mr-1 bg-black/20 py-0.5">
                {eventIcons[impact.event] || "•"}
              </span>
              <span className="flex-1 font-bold text-white truncate uppercase">
                {impact.label}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-14 h-1.5 bg-white/5 border border-white/5 rounded-none overflow-hidden">
                  <div
                    className="h-full rounded-none"
                    style={{
                      width: `${Math.min(impact.volatilityDelta * 4, 100)}%`,
                      backgroundColor: impact.direction === "UP" ? "#FF2A2A" : "#4AF626",
                    }}
                  />
                </div>
                <span
                  className="font-bold w-12 text-right text-[10px]"
                  style={{ color: impact.direction === "UP" ? "#FF2A2A" : "#4AF626" }}
                >
                  {impact.direction === "UP" ? "▲" : "▼"} {impact.volatilityDelta}%
                </span>
              </div>
              <span className="text-on-surface-variant w-14 text-right font-bold border-l border-white/5 pl-2">
                CONF: {impact.confidence}%
              </span>
            </motion.div>
          ))
        )}
      </div>
    </TerminalPanel>
  );
}

