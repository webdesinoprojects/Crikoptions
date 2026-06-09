"use client";

import React from "react";
import { useAISignals } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { motion } from "framer-motion";
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

export function PredictiveSignals({ matchId }: PredictiveSignalsProps) {
  const { data: signals, isLoading } = useAISignals(matchId);

  return (
    <TerminalPanel
      title="[ PREDICTIVE AI SIGNALS ]"
      subtitle="DNA and Neural Net quantitative buy/sell triggers"
      className="h-[280px] rounded-none font-mono"
    >
      <div className="flex-1 overflow-y-auto text-xs min-h-0 select-none">
        <table className="w-full text-left border-collapse font-mono">
          <thead>
            <tr className="text-[9px] uppercase tracking-wider text-on-surface-variant border-b border-white/10 font-bold">
              <th className="pb-1.5 font-bold">[ PLAYER ]</th>
              <th className="pb-1.5 font-bold text-right">[ CONFIDENCE ]</th>
              <th className="pb-1.5 font-bold text-right">[ LTP ]</th>
              <th className="pb-1.5 font-bold text-right">[ ENGINE ]</th>
              <th className="pb-1.5 font-bold text-right">[ ACTION ]</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="py-2">
                      <Skeleton className="h-4 w-full bg-white/5 animate-pulse rounded-none" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              signals?.map((sig, i) => {
                const style = actionStyle(sig.action);
                const badge = engineBadge(sig.engine);
                return (
                  <tr key={sig.id} className="hover:bg-white/5 group transition-colors">
                    <td className="py-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-white uppercase">{sig.player}</span>
                        <div className="flex gap-1 mt-0.5">
                          {sig.drivers.map((d) => (
                            <span key={d} className="text-[7px] px-1 bg-black/30 text-on-surface-variant border border-white/5 rounded-none font-mono">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-12 h-1.5 bg-white/5 border border-white/5 rounded-none overflow-hidden">
                          <div
                            className="h-full rounded-none"
                            style={{ width: `${sig.confidence}%`, backgroundColor: style.color }}
                          />
                        </div>
                        <span className="font-bold text-[10px]" style={{ color: style.color }}>
                          {sig.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2 text-right text-white text-[11px] font-bold">₹{sig.currentPrice.toFixed(2)}</td>
                    <td className="py-2 text-right">
                      <span
                        className="text-[8px] font-bold px-1 py-0.5"
                        style={{ color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 border rounded-none bg-black/40"
                        style={{ color: style.color, borderColor: `${style.color}40` }}
                      >
                        [{style.label}]
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </TerminalPanel>
  );
}

