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
    <div className="flex flex-col gap-4 h-full select-none font-mono">
      {/* Panel 1: Synced Tickers */}
      <TerminalPanel
        title="[ DNA-SYNCED TICKERS ]"
        subtitle="Live quantitative signal stream"
        className="flex-1 min-h-[200px] rounded-none"
        bodyClass="p-2 gap-1 overflow-y-auto"
      >
        {isLoading ? (
          <div className="space-y-1">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[42px] w-full bg-white/5 rounded-none animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {topSignals.map((sig) => (
              <div
                key={sig.id}
                className="px-2 py-1 bg-black/30 border border-white/5 rounded-none flex justify-between items-center hover:border-primary/45 transition-colors select-none text-[9px]"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-white truncate uppercase">{sig.player}</span>
                  <span className="text-[8px] text-on-surface-variant font-mono">
                    {sig.engine} - SYS
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className="font-bold font-mono"
                    style={{ color: sig.action === "BUY" ? "#4AF626" : "#FF2A2A" }}
                  >
                    ₵{sig.currentPrice.toFixed(1)}
                  </div>
                  <span
                    className="text-[8px] font-bold uppercase font-mono"
                    style={{
                      color: sig.action === "BUY" ? "#4AF626" : "#FF2A2A",
                    }}
                  >
                    [{sig.action} : {sig.confidence}%]
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </TerminalPanel>

      {/* Panel 2: Pattern Recognition */}
      <TerminalPanel
        title="[ PATTERN RECOGNITION ]"
        subtitle="Identified tactical/event matches"
        className="h-[210px] rounded-none"
        bodyClass="p-2 gap-1.5 overflow-y-auto"
      >
        {isLoading ? (
          <div className="space-y-1.5">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-[52px] w-full bg-white/5 rounded-none animate-pulse" />
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
                  className="p-2 bg-[#4AF626]/5 border border-primary/45 rounded-none flex flex-col gap-1 text-[9px]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="w-1.5 h-1.5 bg-primary rounded-none" />
                      <span className="font-bold text-primary truncate uppercase">{p.name}</span>
                    </div>
                    <span className="text-[8px] font-bold text-primary shrink-0 border border-primary/30 px-1 py-0.5 rounded-none">
                      [{p.matchPct}% MATCH]
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-[9px] leading-tight uppercase">
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
        title="[ LIVE VOLATILITY ]"
        subtitle="Historical event volatility impact mapping"
        className="h-[170px] rounded-none"
        bodyClass="p-2 gap-1.5 overflow-y-auto"
      >
        {isLoading ? (
          <div className="space-y-1.5">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-[40px] w-full bg-white/5 rounded-none animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {activeImpacts.map((e) => (
              <div
                key={e.event}
                className="p-2 bg-[#FF2A2A]/5 border border-[#FF2A2A]/45 rounded-none flex gap-2 text-[9px] items-center"
              >
                <span className="text-[#FF2A2A] font-bold text-xs shrink-0">⚡</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[#FF2A2A] uppercase truncate text-[9px]">{e.label}</div>
                  <div className="text-on-surface-variant text-[8px]">
                    +VOL: {e.volatilityDelta}% - CONF: {e.confidence}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </TerminalPanel>

      {/* Ticker Processing Latency Footer */}
      <div className="pt-2 border-t border-white/10 text-[9px] text-on-surface-variant flex flex-col gap-1 shrink-0">
        <div className="flex items-center justify-between">
          <span>DNA PROCESSING LATENCY</span>
          <span className="text-[#4AF626] font-bold">{intel?.processingLatencyMs ?? "—"}MS</span>
        </div>
        <div className="w-full bg-white/5 h-1.5 border border-white/5 rounded-none overflow-hidden">
          <div
            className="bg-[#4AF626] h-full rounded-none transition-all duration-300"
            style={{ width: `${100 - ((intel?.processingLatencyMs ?? 20) / 60) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
