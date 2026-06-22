"use client";

import { usePerformance } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Target, AlertTriangle, Scale } from "lucide-react";

export function PnLBreakdown() {
  const { data: perf, isLoading } = usePerformance();

  if (isLoading) {
    return (
      <TerminalPanel density="dense" title="PnL Attribution" className="h-[300px]" subtitle="Performance ratios">
        <div className="space-y-2 flex-1 flex flex-col justify-center">
          <Skeleton className="h-6 w-full bg-white/5" />
          <Skeleton className="h-6 w-[80%] bg-white/5" />
          <Skeleton className="h-6 w-[90%] bg-white/5" />
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
      className="h-[300px]"
    >
      <div className="flex-1 grid grid-cols-2 gap-2 select-none min-h-0 overflow-y-auto">
        {/* Win Rate Bento */}
        <div className="col-span-2 relative overflow-hidden rounded-lg border border-white/5 bg-surface-dim/40 p-4 hover:bg-surface-dim/60 transition-colors">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-[linear-gradient(90deg,transparent,rgba(16,185,129,0.05))] pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Win Rate
            </span>
            <span className="text-[10px] text-on-surface-variant bg-white/5 px-2 py-0.5 rounded">
              {perf.closedTradesCount} trades
            </span>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">{perf.winRate.toFixed(1)}%</span>
            <div className="h-2 flex-1 max-w-[100px] mb-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-bull-green rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" style={{ width: `${perf.winRate}%` }} />
            </div>
          </div>
        </div>

        {/* Profit Factor Bento */}
        <div className="col-span-1 rounded-lg border border-white/5 bg-surface-dim/40 p-3 hover:bg-surface-dim/60 transition-colors flex flex-col justify-between">
          <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
            <Scale className="w-3 h-3" /> Profit Factor
          </span>
          <div className={`mt-2 text-2xl font-bold tracking-tight ${isGoodPf ? "text-primary drop-shadow-[0_0_8px_rgba(14,165,233,0.3)]" : "text-white"}`}>
            {pf}
          </div>
        </div>

        {/* Averages */}
        <div className="col-span-1 grid grid-rows-2 gap-2">
          <div className="rounded-lg border border-bull-green/10 bg-bull-green/5 p-2 flex flex-col justify-center">
            <span className="text-[8px] font-black uppercase tracking-widest text-bull-green/70">Avg Win</span>
            <span className="text-sm font-bold text-bull-green">
              {perf.avgWin > 0 ? `+₹${perf.avgWin.toFixed(0)}` : "—"}
            </span>
          </div>
          <div className="rounded-lg border border-bear-red/10 bg-bear-red/5 p-2 flex flex-col justify-center">
            <span className="text-[8px] font-black uppercase tracking-widest text-bear-red/70">Avg Loss</span>
            <span className="text-sm font-bold text-bear-red">
              {perf.avgLoss > 0 ? `-₹${perf.avgLoss.toFixed(0)}` : "—"}
            </span>
          </div>
        </div>

        {/* Daily PnL Highlight */}
        <div className="col-span-2 rounded-lg border border-white/5 bg-surface-dim/40 p-3 hover:bg-surface-dim/60 transition-colors flex items-center justify-between">
          <div className="flex flex-col">
             <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
               <Activity className="w-3 h-3" /> Daily PnL
             </span>
             <span className={`text-lg font-bold ${perf.dailyPnL >= 0 ? "text-bull-green" : "text-bear-red"}`}>
                {perf.dailyPnL >= 0 ? "+" : "-"}₹{Math.abs(perf.dailyPnL).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
             </span>
          </div>
          <div className="flex flex-col text-right">
             <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">Total PnL</span>
             <span className={`text-sm font-bold ${perf.totalPnL >= 0 ? "text-bull-green" : "text-bear-red"}`}>
                {perf.totalPnL >= 0 ? "+" : "-"}₹{Math.abs(perf.totalPnL).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
             </span>
          </div>
        </div>
      </div>
    </TerminalPanel>
  );
}
