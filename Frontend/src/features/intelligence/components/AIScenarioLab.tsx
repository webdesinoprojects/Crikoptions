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
        <div className="p-2 rounded-none bg-[#020617] border border-white/20 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 group-hover:bg-primary transition-colors"></div>
          <label className="block text-[8px] font-bold text-on-surface-variant mb-1.5 uppercase tracking-widest pl-2">
            [ HYPOTHETICAL DNA BRANCH ]
          </label>
          <div className="relative pl-2">
            <select
              value={activeScenarioId}
              onChange={(e) => setActiveScenarioId(e.target.value)}
              className="w-full bg-black/60 border border-white/10 text-white text-[12px] rounded-none px-2 py-1.5 focus:outline-none focus:border-primary font-bold font-mono appearance-none hover:border-white/30 transition-colors cursor-pointer"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
              ▼
            </div>
          </div>
        </div>

        {/* Projection results */}
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
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.02)_2px,rgba(255,255,255,0.02)_4px)] pointer-events-none"></div>

                {/* Market impacts */}
                {projection.marketImpacts.map((m) => (
                  <div key={m.market} className="flex justify-between items-center text-[11px] relative z-10">
                    <span className="text-on-surface-variant font-medium uppercase tracking-wider">{m.market}</span>
                    <div className="text-right flex items-center gap-2">
                      <span
                        className="font-bold text-[12px] drop-shadow-[0_0_4px_currentColor]"
                        style={{ color: m.direction === "UP" ? "#4AF626" : "#FF2A2A" }}
                      >
                        {m.delta}
                      </span>
                      <span className="text-[9px] text-on-surface-variant font-bold border border-white/10 px-1 py-0.5 bg-black/40">
                        {m.confidence}% CONF
                      </span>
                    </div>
                  </div>
                ))}

                {/* Win probability shift */}
                <div className="flex justify-between items-center pt-2.5 border-t border-white/10 text-[11px] relative z-10">
                  <span className="text-on-surface-variant font-medium uppercase tracking-wider">WIN PROB. SHIFT</span>
                  <span
                    className="font-bold text-[13px] drop-shadow-[0_0_6px_currentColor]"
                    style={{ color: projection.winProbabilityShift > 0 ? "#4AF626" : "#FF2A2A" }}
                  >
                    {projection.winProbabilityShift > 0 ? "+" : ""}{projection.winProbabilityShift}%
                  </span>
                </div>

                {/* Player impacts */}
                <div className="pt-2.5 border-t border-white/10 space-y-1.5 relative z-10">
                  {projection.playerImpacts.map((p) => (
                    <div key={p.player} className="flex justify-between text-[10px]">
                      <span className="text-on-surface-variant font-medium uppercase tracking-wide">{p.player}</span>
                      <span
                        className="font-bold drop-shadow-[0_0_4px_currentColor]"
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
          className="w-full py-2 bg-primary text-on-primary font-bold text-[10px] hover:bg-[#0284c7] hover:shadow-[0_0_15px_rgba(14,165,233,0.5)] active:scale-[0.98] transition-all uppercase tracking-widest shrink-0 rounded-none border border-primary/50 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
          <span className="relative z-10">[ ▶ RUN DNA SIMULATION ]</span>
        </button>
      </div>
    </TerminalPanel>
  );
}

