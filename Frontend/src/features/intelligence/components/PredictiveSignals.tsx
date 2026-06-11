"use client";

import React from "react";
import { useAISignals } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { motion, Variants } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface PredictiveSignalsProps {
  matchId: string;
}

const actionStyle = (action: string) => {
  if (action === "BUY") return { color: "#4AF626", bg: "rgba(74,246,38,0.1)", label: "BUY" };
  if (action === "SELL") return { color: "#FF2A2A", bg: "rgba(255,42,42,0.1)", label: "SELL" };
  return { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", label: "HOLD" };
};

const engineBadge = (engine: string) => {
  if (engine === "DNA") return { color: "#0EA5E9", label: "[DNA-SYNC]" };
  if (engine === "NEURAL") return { color: "#A855F7", label: "[NEURAL]" };
  return { color: "#FFB300", label: "[SENTIMENT]" };
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function PredictiveSignals({ matchId }: PredictiveSignalsProps) {
  const { data: signals, isLoading } = useAISignals(matchId);

  return (
    <TerminalPanel
      title="[ PREDICTIVE AI SIGNALS ]"
      subtitle="DNA and Neural Net quantitative buy/sell triggers"
      className="h-[320px] rounded-none font-mono"
    >
      <div className="flex-1 overflow-y-auto text-xs min-h-0 select-none pr-2">
        <table className="w-full text-left border-collapse font-mono relative">
          <thead className="sticky top-0 bg-[#020617] z-10">
            <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant border-b border-white/10 font-bold">
              <th className="pb-2 font-bold">[ PLAYER ]</th>
              <th className="pb-2 font-bold text-right">[ CONFIDENCE ]</th>
              <th className="pb-2 font-bold text-right">[ LTP ]</th>
              <th className="pb-2 font-bold text-right">[ ENGINE ]</th>
              <th className="pb-2 font-bold text-right">[ ACTION ]</th>
            </tr>
          </thead>
          <motion.tbody 
            variants={containerVariants} 
            initial="hidden" 
            animate="visible" 
            className="divide-y divide-white/5"
          >
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="py-3">
                      <Skeleton className="h-5 w-full bg-white/5 animate-pulse rounded-none" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              signals?.map((sig, i) => {
                const style = actionStyle(sig.action);
                const badge = engineBadge(sig.engine);
                return (
                  <motion.tr 
                    variants={itemVariants}
                    key={sig.id} 
                    className="hover:bg-white/5 group transition-colors cursor-default"
                  >
                    <td className="py-2.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-white uppercase tracking-wider group-hover:text-primary transition-colors">{sig.player}</span>
                        <div className="flex gap-1.5 mt-1">
                          {sig.drivers.map((d) => (
                            <span key={d} className="text-[8px] px-1 bg-black/40 text-on-surface-variant border border-white/10 rounded-none font-mono">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-black/40 border border-white/10 rounded-none overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${sig.confidence}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                            className="h-full rounded-none"
                            style={{ backgroundColor: style.color, boxShadow: `0 0 8px ${style.color}60` }}
                          />
                        </div>
                        <span className="font-bold text-[11px] w-8 text-right drop-shadow-[0_0_4px_currentColor]" style={{ color: style.color }}>
                          {sig.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right text-white text-[12px] font-bold">₹{sig.currentPrice.toFixed(2)}</td>
                    <td className="py-2.5 text-right">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5"
                        style={{ color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className="text-[10px] font-bold px-2 py-1 border rounded-none bg-black/40 drop-shadow-[0_0_6px_currentColor]"
                        style={{ color: style.color, borderColor: `${style.color}40` }}
                      >
                        [{style.label}]
                      </span>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </motion.tbody>
        </table>
      </div>
    </TerminalPanel>
  );
}

