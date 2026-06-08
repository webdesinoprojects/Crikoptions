"use client";

import { useIntelligence } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface IntelligenceFeedProps {
  matchId: string;
}

export function IntelligenceFeed({ matchId }: IntelligenceFeedProps) {
  const { data: intel, isLoading } = useIntelligence(matchId);

  const activePatterns = intel?.patterns.filter((p) => p.status === "ACTIVE") ?? [];
  const topSignals = intel?.signals.slice(0, 4) ?? [];
  const activeImpacts = intel?.eventImpacts.slice(0, 3) ?? [];

  return (
    <div className="flex flex-col gap-4 h-full select-none">
      {/* Panel 1: Synced Tickers */}
      <TerminalPanel
        title="DNA-Synced Tickers"
        subtitle="Live quantitative signal stream"
        className="flex-1 min-h-[200px]"
        bodyClass="p-2 gap-1.5 overflow-y-auto"
      >
        {isLoading ? (
          <div className="space-y-1.5">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[42px] w-full bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {topSignals.map((sig) => (
              <div
                key={sig.id}
                className="px-2 py-1.5 bg-surface-dim border border-outline/5 rounded flex justify-between items-center hover:border-primary/20 transition-colors select-none text-[10px]"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-white truncate">{sig.player}</span>
                  <span className="text-[8px] text-on-surface-variant font-data-tabular">
                    {sig.engine} ENGINE
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className="font-bold font-data-tabular"
                    style={{ color: sig.action === "BUY" ? "#22c55e" : "#ef4444" }}
                  >
                    ₹{sig.currentPrice.toFixed(1)}
                  </div>
                  <span
                    className="text-[8px] font-bold px-1 rounded uppercase font-data-tabular"
                    style={{
                      backgroundColor: sig.action === "BUY" ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                      color: sig.action === "BUY" ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {sig.action} · {sig.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </TerminalPanel>

      {/* Panel 2: Pattern Recognition */}
      <TerminalPanel
        title="Pattern Recognition"
        subtitle="Identified tactical/event matches"
        className="h-[210px]"
        bodyClass="p-2 gap-2 overflow-y-auto"
      >
        {isLoading ? (
          <div className="space-y-1.5">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-[52px] w-full bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            <AnimatePresence>
              {activePatterns.slice(0, 2).map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-2 bg-primary/5 border border-primary/20 rounded flex flex-col gap-1 text-[10px]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="font-bold text-primary truncate uppercase font-display">{p.name}</span>
                    </div>
                    <span className="text-[8px] font-bold px-1 bg-primary/20 text-primary rounded shrink-0 font-data-tabular">
                      {p.matchPct}% MATCH
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-[9px] leading-tight">
                    {p.description}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </TerminalPanel>

      {/* Panel 3: Live Volatility */}
      <TerminalPanel
        title="Live Volatility"
        subtitle="Historical event volatility impact mapping"
        className="h-[170px]"
        bodyClass="p-2 gap-1.5 overflow-y-auto"
      >
        {isLoading ? (
          <div className="space-y-1.5">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-[40px] w-full bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {activeImpacts.map((e) => (
              <div
                key={e.event}
                className="p-2 bg-error/5 border border-error/20 rounded flex gap-2 text-[10px] items-center"
              >
                <span className="text-error font-bold text-xs shrink-0">⚡</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-error uppercase truncate text-[9px]">{e.label}</div>
                  <div className="text-on-surface-variant text-[8px] font-data-tabular">
                    +{e.volatilityDelta}% volatility delta · Conf {e.confidence}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </TerminalPanel>

      {/* Ticker Processing Latency Footer */}
      <div className="pt-2 border-t border-outline/10 text-[9px] font-data-tabular text-on-surface-variant flex flex-col gap-1 shrink-0">
        <div className="flex items-center justify-between">
          <span>DNA PROCESSING LATENCY</span>
          <span className="text-bull-green font-bold">{intel?.processingLatencyMs ?? "—"}ms</span>
        </div>
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
          <div
            className="bg-bull-green h-full rounded-full transition-all duration-300"
            style={{ width: `${100 - ((intel?.processingLatencyMs ?? 20) / 60) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
