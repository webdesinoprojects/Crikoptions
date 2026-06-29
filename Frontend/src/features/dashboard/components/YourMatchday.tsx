import { ChevronRight, TrendingUp, TrendingDown, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePositions, usePerformance } from "@/features/portfolio/hooks";
import Link from "next/link";

export function YourMatchday() {
  const { data: positions = [] } = usePositions();
  const { data: performance } = usePerformance();

  const openPositionsCount = positions.length;
  const combinedPnL = performance?.totalPnL ?? 0;
  
  // Calculate total exposure dynamically if positions have entryPrice/size, else fallback
  const calculatedExposure = positions.reduce((acc, pos) => acc + ((pos.averageEntryPrice || 0) * (pos.quantity || 0)), 0);
  const totalExposure = calculatedExposure > 0 ? calculatedExposure : 0;
  const maxExposure = 30000; // arbitrary max for progress bar
  const exposurePct = Math.min((totalExposure / maxExposure) * 100, 100);

  const displayPositions = positions.map(p => ({ 
    name: p.matchName || `Contract ${p.id}`, 
    pnl: p.unrealizedPnL || 0, 
    isUp: (p.unrealizedPnL || 0) >= 0 
  })).slice(0, 3);

  return (
    <div className="flex h-full min-w-0 flex-col rounded-xl border border-white/10 bg-[#0a1428] p-3.5 sm:p-5">
      {/* Header */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <div className="min-w-0">
          <div className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-1">
            Your Matchday
          </div>
          <div className="text-sm font-medium text-white/80">
            <span className="text-white font-bold">{openPositionsCount}</span> open positions
          </div>
        </div>
        <div className="min-w-0 text-left sm:text-right">
          <div className="text-[10px] bg-error px-1.5 py-0.5 inline-block rounded font-bold uppercase tracking-widest mb-1 text-white">
            LIVE
          </div>
          <div className={cn("max-w-full break-words font-data-tabular text-lg font-black leading-tight sm:text-xl", combinedPnL >= 0 ? "text-bull-green" : "text-bear-red")}>
            {combinedPnL >= 0 ? "+" : "-"}Rs {Math.abs(combinedPnL).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-on-surface-variant tracking-wider uppercase">
            Combined Live P&L
          </div>
        </div>
      </div>

      {/* Positions List */}
      <div className="space-y-3 flex-1">
        {displayPositions.length > 0 ? (
          displayPositions.map((pos, i) => (
            <div key={i} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-white/5 bg-white/5 p-2.5 transition-colors hover:bg-white/10 sm:p-3">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                  pos.isUp ? "bg-bull-green/10" : "bg-bear-red/10"
                )}>
                  {pos.isUp ? (
                    <TrendingUp className="w-3.5 h-3.5 text-bull-green" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-bear-red" />
                  )}
                </div>
                <span className="min-w-0 truncate text-xs font-medium text-white transition-colors group-hover:text-cyan-300 sm:text-sm">
                  {pos.name}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <span className={cn(
                  "font-data-tabular text-xs font-bold sm:text-sm",
                  pos.isUp ? "text-bull-green" : "text-bear-red"
                )}>
                  {pos.isUp ? "+" : "-"}Rs {Math.abs(pos.pnl).toLocaleString("en-IN")}
                </span>
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-full min-h-[100px] flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-4 text-center">
            <Inbox className="mb-2 h-6 w-6 text-slate-500" />
            <p className="text-xs text-slate-400">No active positions today</p>
          </div>
        )}
      </div>

      {/* Exposure Footer */}
      <div className="mt-6 pt-5 border-t border-white/10">
        <div className="mb-2 flex items-end justify-between gap-3">
          <span className="text-xs text-on-surface-variant font-medium">Total Exposure</span>
          <span className="text-right font-data-tabular text-xs font-bold text-white sm:text-sm">Rs {totalExposure.toLocaleString("en-IN")}</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-5">
          <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${exposurePct}%` }} />
        </div>
        <Link href="/portfolio" className="w-full py-2.5 rounded-lg border border-cyan-500/30 text-cyan-400 font-bold text-xs uppercase tracking-widest hover:bg-cyan-500/10 transition-colors block text-center">
          View Positions
        </Link>
      </div>
    </div>
  );
}
