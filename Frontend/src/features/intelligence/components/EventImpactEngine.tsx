"use client";

import React from "react";
import { useEventImpacts } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { motion, Variants } from "framer-motion";
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function EventImpactEngine({ matchId }: EventImpactEngineProps) {
  const { data: impacts, isLoading } = useEventImpacts(matchId);

  return (
    <TerminalPanel
      title="[ EVENT IMPACT ENGINE ]"
      subtitle="Estimated volatility delta shifts triggered per game event"
      className="h-[320px] rounded-none font-mono"
    >
      <div className="flex-1 overflow-y-auto min-h-0 select-none text-[10px] pr-2">
        {isLoading ? (
          <div className="space-y-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full bg-white/5 animate-pulse rounded-none" />
            ))}
          </div>
        ) : impacts && impacts.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col"
          >
            {impacts?.map((impact, i) => (
              <motion.div
                variants={itemVariants}
                key={impact.event}
                className={`flex items-center gap-3 px-3 py-2 border-b border-white/5 hover:bg-white/5 transition-colors cursor-default group relative overflow-hidden ${
                  i % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite] pointer-events-none"></div>
                <span className="text-[12px] w-6 text-center shrink-0 opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all">
                  {eventIcons[impact.event] || "•"}
                </span>
                <span className="flex-1 font-bold text-white truncate uppercase tracking-wider group-hover:text-primary transition-colors">
                  {impact.label}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-16 h-1.5 bg-black/50 border border-white/10 rounded-none overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(impact.volatilityDelta * 4, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                      className="h-full rounded-none"
                      style={{
                        backgroundColor: impact.direction === "UP" ? "#FF2A2A" : "#4AF626",
                        boxShadow: `0 0 6px ${impact.direction === "UP" ? "#FF2A2A" : "#4AF626"}60`
                      }}
                    />
                  </div>
                  <span
                    className="font-bold w-12 text-right text-[11px] drop-shadow-[0_0_4px_currentColor]"
                    style={{ color: impact.direction === "UP" ? "#FF2A2A" : "#4AF626" }}
                  >
                    {impact.direction === "UP" ? "▲" : "▼"} {impact.volatilityDelta}%
                  </span>
                </div>
                <span className="text-on-surface-variant w-16 text-right font-bold border-l border-white/10 pl-3">
                  CONF: {impact.confidence}%
                </span>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-on-surface-variant">
            No backend event impact data
          </div>
        )}
      </div>
    </TerminalPanel>
  );
}
