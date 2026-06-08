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
  if (action === "BUY") return { color: "#22c55e", bg: "rgba(34,197,94,0.1)", label: "BUY" };
  if (action === "SELL") return { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "SELL" };
  return { color: "#94a3b8", bg: "rgba(148,163,184,0.1)", label: "STABLE" };
};

const engineBadge = (engine: string) => {
  if (engine === "DNA") return { color: "#0ea5e9", label: "DNA-SYNC" };
  if (engine === "NEURAL") return { color: "#8b5cf6", label: "NEURAL" };
  return { color: "#f59e0b", label: "SENTIMENT" };
};

export function PredictiveSignals({ matchId }: PredictiveSignalsProps) {
  const { data: signals, isLoading } = useAISignals(matchId);

  return (
    <TerminalPanel
      title="Predictive AI Signals"
      subtitle="DNA and Neural Net quantitative buy/sell triggers"
      className="h-[280px]"
    >
      <div className="flex-1 overflow-y-auto text-xs font-data-tabular min-h-0 select-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[9px] uppercase tracking-wider text-on-surface-variant border-b border-outline/10 font-bold">
              <th className="pb-1.5 font-bold">Player</th>
              <th className="pb-1.5 font-bold text-right">Confidence</th>
              <th className="pb-1.5 font-bold text-right">LTP (₹)</th>
              <th className="pb-1.5 font-bold text-right">Engine</th>
              <th className="pb-1.5 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="py-2">
                      <Skeleton className="h-4 w-full bg-white/5 animate-pulse" />
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
                        <span className="font-bold text-white">{sig.player}</span>
                        <div className="flex gap-1 mt-0.5">
                          {sig.drivers.map((d) => (
                            <span key={d} className="text-[8px] px-1 bg-white/5 text-on-surface-variant rounded font-sans">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${sig.confidence}%`, backgroundColor: style.color }}
                          />
                        </div>
                        <span className="font-bold font-data-tabular" style={{ color: style.color }}>
                          {sig.confidence}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2 text-right text-white">₹{sig.currentPrice.toFixed(2)}</td>
                    <td className="py-2 text-right">
                      <span
                        className="text-[8px] font-bold px-1 py-0.5 rounded"
                        style={{ color: badge.color, backgroundColor: `${badge.color}15`, border: `1px solid ${badge.color}30` }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ color: style.color, backgroundColor: style.bg }}
                      >
                        {style.label}
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
