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
      title="AI Scenario Lab"
      subtitle="Hypothetical DNA branches and projected event impacts"
      className="h-[280px] border-primary/20 bg-surface relative"
    >
      {/* Watermark symbol background */}
      <div className="absolute -bottom-2 -right-2 opacity-[0.03] pointer-events-none select-none text-[120px] text-primary">
        🧬
      </div>

      <div className="flex-1 flex flex-col justify-between min-h-0 select-none text-[10px]">
        {/* Selector dropdown */}
        <div className="p-1.5 rounded bg-surface-dim border border-outline/5">
          <label className="block text-[8px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
            IF HYPOTHETICAL DNA BRANCH:
          </label>
          <select
            value={activeScenarioId}
            onChange={(e) => setActiveScenarioId(e.target.value)}
            className="w-full bg-surface border border-outline/10 text-white text-[11px] rounded px-2 py-1 focus:outline-none focus:border-primary font-bold font-data-tabular"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Projection results */}
        <div className="flex-1 overflow-y-auto my-1.5 pr-0.5">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="space-y-1.5">
                <Skeleton className="h-10 w-full bg-white/5 animate-pulse" />
                <Skeleton className="h-6 w-full bg-white/5 animate-pulse" />
              </div>
            ) : projection ? (
              <motion.div
                key={activeScenarioId}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="bg-primary/5 rounded border border-primary/20 p-2 space-y-2"
              >
                {/* Market impacts */}
                {projection.marketImpacts.map((m) => (
                  <div key={m.market} className="flex justify-between items-center text-[10px]">
                    <span className="text-on-surface-variant font-medium">{m.market}</span>
                    <div className="text-right">
                      <span
                        className="font-data-tabular font-bold"
                        style={{ color: m.direction === "UP" ? "#22c55e" : "#ef4444" }}
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
                <div className="flex justify-between items-center pt-1.5 border-t border-outline/5 text-[10px]">
                  <span className="text-on-surface-variant font-medium">Win Prob. Shift</span>
                  <span
                    className="font-data-tabular font-bold"
                    style={{ color: projection.winProbabilityShift > 0 ? "#22c55e" : "#ef4444" }}
                  >
                    {projection.winProbabilityShift > 0 ? "+" : ""}{projection.winProbabilityShift}%
                  </span>
                </div>

                {/* Player impacts */}
                <div className="pt-1.5 border-t border-outline/5 space-y-1">
                  {projection.playerImpacts.map((p) => (
                    <div key={p.player} className="flex justify-between text-[9px]">
                      <span className="text-on-surface-variant font-medium">{p.player}</span>
                      <span
                        className="font-data-tabular font-bold"
                        style={{ color: p.delta > 0 ? "#22c55e" : "#ef4444" }}
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
          className="w-full py-1 rounded bg-primary text-on-primary font-bold text-[9px] hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-wider shrink-0"
        >
          ▶ Run DNA Simulation
        </button>
      </div>
    </TerminalPanel>
  );
}
