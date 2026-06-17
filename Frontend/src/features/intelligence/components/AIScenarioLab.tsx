"use client";

import React from "react";
import { useScenarioLab } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface AIScenarioLabProps {
  matchId: string;
}

export function AIScenarioLab({ matchId }: AIScenarioLabProps) {
  const { scenarios, activeScenarioId, setActiveScenarioId, projection, isLoading } = useScenarioLab(matchId);

  return (
    <TerminalPanel
      title="[ AI SCENARIO LAB ]"
      subtitle="Backend scenario projections"
      className="h-[280px] border-primary/20 bg-surface relative rounded-none font-mono"
    >
      <div className="flex-1 flex flex-col justify-between min-h-0 select-none text-[10px]">
        <div className="p-2 rounded-none bg-[#020617] border border-white/20 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 group-hover:bg-primary transition-colors"></div>
          <label className="block text-[8px] font-bold text-on-surface-variant mb-1.5 uppercase tracking-widest pl-2">
            [ BACKEND SCENARIO ]
          </label>
          <div className="relative pl-2">
            <select
              value={activeScenarioId}
              onChange={(e) => setActiveScenarioId(e.target.value)}
              disabled={scenarios.length === 0}
              className="w-full bg-black/60 border border-white/10 text-white text-[12px] rounded-none px-2 py-1.5 focus:outline-none focus:border-primary font-bold font-mono appearance-none hover:border-white/30 transition-colors disabled:opacity-50"
            >
              {scenarios.length === 0 ? (
                <option value="">0</option>
              ) : (
                scenarios.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.label.toUpperCase()}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto my-2 pr-0.5">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full bg-white/5 animate-pulse rounded-none" />
                <Skeleton className="h-8 w-full bg-white/5 animate-pulse rounded-none" />
              </div>
            ) : projection ? (
              <motion.div
                key={activeScenarioId}
                initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-[#020617]/80 border border-primary/40 p-3 space-y-3 rounded-none relative overflow-hidden"
              >
                {projection.marketImpacts.map((market) => (
                  <div key={market.market} className="flex justify-between items-center text-[11px] relative z-10">
                    <span className="text-on-surface-variant font-medium uppercase tracking-wider">{market.market}</span>
                    <div className="text-right flex items-center gap-2">
                      <span
                        className="font-bold text-[12px] drop-shadow-[0_0_4px_currentColor]"
                        style={{ color: market.direction === "UP" ? "#4AF626" : "#FF2A2A" }}
                      >
                        {market.delta}
                      </span>
                      <span className="text-[9px] text-on-surface-variant font-bold border border-white/10 px-1 py-0.5 bg-black/40">
                        {market.confidence}% CONF
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-on-surface-variant">
                No backend scenario projections
              </div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          disabled
          className="w-full py-2 bg-primary/30 text-on-primary font-bold text-[10px] uppercase tracking-widest shrink-0 rounded-none border border-primary/30 opacity-60"
        >
          [ BACKEND SCENARIO DATA: 0 ]
        </button>
      </div>
    </TerminalPanel>
  );
}
