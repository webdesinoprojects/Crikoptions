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
  const { scenarios, activeScenarioId, setActiveScenarioId, projection, isLoading } =
    useScenarioLab(matchId);

  return (
    <TerminalPanel
      title="[ AI SCENARIO LAB ]"
      subtitle="Hypothetical DNA branches and projected event impacts"
      className="h-[280px] border-primary/20 bg-surface relative rounded-none font-mono"
    >
      {/* Watermark symbol background */}
      <div className="absolute -bottom-2 -right-2 opacity-[0.03] pointer-events-none select-none text-[120px] text-primary">
        [🧬]
      </div>

      <div className="flex-1 flex flex-col justify-between min-h-0 select-none text-[10px]">
        {/* Selector dropdown */}
        <div className="p-1.5 rounded-none bg-black/40 border border-white/10">
          <label className="block text-[8px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
            [ HYPOTHETICAL DNA BRANCH ]
          </label>
          <select
            value={activeScenarioId}
            onChange={(e) => setActiveScenarioId(e.target.value)}
            className="w-full bg-black/80 border border-white/10 text-white text-[11px] rounded-none px-2 py-1 focus:outline-none focus:border-[#4AF626] font-bold font-mono"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Projection results */}
        <div className="flex-1 overflow-y-auto my-1.5 pr-0.5">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="space-y-1.5">
                <Skeleton className="h-10 w-full bg-white/5 animate-pulse rounded-none" />
                <Skeleton className="h-6 w-full bg-white/5 animate-pulse rounded-none" />
              </div>
            ) : projection ? (
              <motion.div
                key={activeScenarioId}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="bg-primary/5 border border-primary/45 p-2 space-y-2 rounded-none"
              >
                {/* Market impacts */}
                {projection.marketImpacts.map((m) => (
                  <div key={m.market} className="flex justify-between items-center text-[10px]">
                    <span className="text-on-surface-variant font-medium uppercase">{m.market}</span>
                    <div className="text-right">
                      <span
                        className="font-bold"
                        style={{ color: m.direction === "UP" ? "#4AF626" : "#FF2A2A" }}
                      >
                        {m.delta}
                      </span>
                      <span className="text-[8px] text-on-surface-variant font-bold ml-1.5">
                        ({m.confidence}%)
                      </span>
                    </div>
                  </div>
                ))}

                {/* Win probability shift */}
                <div className="flex justify-between items-center pt-1.5 border-t border-white/10 text-[10px]">
                  <span className="text-on-surface-variant font-medium uppercase">WIN PROB. SHIFT</span>
                  <span
                    className="font-bold"
                    style={{ color: projection.winProbabilityShift > 0 ? "#4AF626" : "#FF2A2A" }}
                  >
                    {projection.winProbabilityShift > 0 ? "+" : ""}{projection.winProbabilityShift}%
                  </span>
                </div>

                {/* Player impacts */}
                <div className="pt-1.5 border-t border-white/10 space-y-1">
                  {projection.playerImpacts.map((p) => (
                    <div key={p.player} className="flex justify-between text-[9px]">
                      <span className="text-on-surface-variant font-medium uppercase">{p.player}</span>
                      <span
                        className="font-bold"
                        style={{ color: p.delta > 0 ? "#4AF626" : "#FF2A2A" }}
                      >
                        {p.delta > 0 ? "+" : ""}{p.delta.toFixed(1)} PTS
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Action button */}
        <button
          onClick={() => setActiveScenarioId(activeScenarioId)}
          className="w-full py-1.5 bg-[#4AF626] text-black font-bold text-[9px] hover:bg-[#3fde1d] active:translate-y-[0.5px] transition-all uppercase tracking-wider shrink-0 rounded-none border border-[#4AF626]"
        >
          [ ▶ RUN DNA SIMULATION ]
        </button>
      </div>
    </TerminalPanel>
  );
}

