"use client";

import { usePerformance } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Target, AlertTriangle, Scale } from "lucide-react";

export function PnLBreakdown() {
  const { data: perf, isLoading } = usePerformance();

  if (isLoading) {
    return (
      <TerminalPanel density="dense" title="PnL Attribution" className="h-full min-h-[320px]" subtitle="Performance ratios">
        <div className="space-y-3 flex-1 flex flex-col mt-2">
          <Skeleton className="h-24 w-full bg-white/5 rounded-xl" />
          <div className="grid grid-cols-2 gap-3 h-24">
            <Skeleton className="h-full w-full bg-white/5 rounded-xl" />
            <div className="space-y-2 h-full">
               <Skeleton className="h-[44px] w-full bg-white/5 rounded-lg" />
               <Skeleton className="h-[44px] w-full bg-white/5 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-20 w-full bg-white/5 rounded-xl" />
        </div>
      </TerminalPanel>
    );
  }

  if (!perf) return null;

  const pf = perf.profitFactor === Infinity ? "∞" : perf.profitFactor === 0 ? "—" : perf.profitFactor.toFixed(2);
  const isGoodPf = perf.profitFactor >= 1.5;

  return (
    <TerminalPanel
      density="dense"
      title="PnL Attribution"
      subtitle="Hedge-fund analytics & efficiency metrics"
      className="h-full min-h-[320px]"
    >
      <div className="flex-1 grid grid-cols-2 gap-3 select-none mt-2">
        {/* Win Rate Bento */}
        <div className="col-span-2 relative rounded-xl border border-white/10 bg-surface-dim/30 p-5 hover:bg-surface-dim/50 transition-all shadow-sm">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-[linear-gradient(90deg,transparent,rgba(16,185,129,0.03))] pointer-events-none rounded-r-xl" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
              <Target className="w-4 h-4 text-bull-green/70" /> Win Rate
            </span>
            <span className="text-[10px] text-on-surface-variant bg-white/5 border border-white/5 px-2 py-0.5 rounded-md font-mono">
              {perf.closedTradesCount} TRADES
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-black tracking-tighter text-white tabular-nums leading-none">
              {perf.winRate.toFixed(1)}<span className="text-2xl text-white/50">%</span>
            </span>
            <div className="h-1.5 flex-1 max-w-[140px] bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-bull-green rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all duration-1000" 
                style={{ width: `${perf.winRate}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Profit Factor Bento */}
        <div className="col-span-1 rounded-xl border border-white/10 bg-surface-dim/30 p-4 hover:bg-surface-dim/50 transition-all flex flex-col justify-between group">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 group-hover:text-primary transition-colors" /> Profit Factor
          </span>
          <div className={`mt-3 text-3xl font-black tracking-tighter tabular-nums leading-none ${isGoodPf ? "text-primary drop-shadow-[0_0_12px_rgba(14,165,233,0.4)]" : "text-white"}`}>
            {pf}
          </div>
        </div>

        {/* Averages */}
        <div className="col-span-1 grid grid-rows-2 gap-2">
          <div className="rounded-lg border border-bull-green/20 bg-gradient-to-r from-bull-green/5 to-transparent p-3 flex flex-col justify-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-bull-green/70 mb-0.5">Avg Win</span>
            <span className="text-base font-bold text-bull-green tabular-nums leading-none drop-shadow-sm">
              {perf.avgWin > 0 ? `+₹${perf.avgWin.toFixed(0)}` : "—"}
            </span>
          </div>
          <div className="rounded-lg border border-bear-red/20 bg-gradient-to-r from-bear-red/5 to-transparent p-3 flex flex-col justify-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-bear-red/70 mb-0.5">Avg Loss</span>
            <span className="text-base font-bold text-bear-red tabular-nums leading-none drop-shadow-sm">
              {perf.avgLoss > 0 ? `-₹${perf.avgLoss.toFixed(0)}` : "—"}
            </span>
          </div>
        </div>

        {/* Daily PnL Highlight */}
        <div className="col-span-2 rounded-xl border border-white/10 bg-surface-dim/30 p-4 hover:bg-surface-dim/50 transition-all flex items-center justify-between">
          <div className="flex flex-col">
             <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5 mb-1">
               <Activity className="w-3.5 h-3.5" /> Daily PnL
             </span>
             <span className={`text-xl font-black tracking-tighter tabular-nums leading-none ${perf.dailyPnL >= 0 ? "text-bull-green drop-shadow-sm" : "text-bear-red drop-shadow-sm"}`}>
                {perf.dailyPnL >= 0 ? "+" : "-"}₹{Math.abs(perf.dailyPnL).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
             </span>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <div className="flex flex-col text-right">
             <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Total PnL</span>
             <span className={`text-lg font-bold tabular-nums leading-none ${perf.totalPnL >= 0 ? "text-bull-green" : "text-bear-red"}`}>
                {perf.totalPnL >= 0 ? "+" : "-"}₹{Math.abs(perf.totalPnL).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
             </span>
          </div>
        </div>
      </div>
    </TerminalPanel>
  );
}
