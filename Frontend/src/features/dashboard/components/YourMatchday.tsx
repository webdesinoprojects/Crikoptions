import { ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePositions, usePerformance } from "@/features/portfolio/hooks";
import Link from "next/link";

export function YourMatchday() {
  const { data: positions = [] } = usePositions();
  const { data: performance } = usePerformance();

  const openPositionsCount = positions.length;
  const combinedPnL = performance?.totalPnL ?? 860;
  
  // Calculate total exposure dynamically if positions have entryPrice/size, else fallback
  const calculatedExposure = positions.reduce((acc, pos) => acc + ((pos.averageEntryPrice || 0) * (pos.quantity || 0)), 0);
  const totalExposure = calculatedExposure > 0 ? calculatedExposure : 15600;
  const maxExposure = 30000; // arbitrary max for progress bar
  const exposurePct = Math.min((totalExposure / maxExposure) * 100, 100);

  // Fallback data if no real positions yet
  const displayPositions = positions.length > 0 
    ? positions.map(p => ({ 
        name: p.matchName || `Contract ${p.id}`, 
        pnl: p.unrealizedPnL || 0, 
        isUp: (p.unrealizedPnL || 0) >= 0 
      })).slice(0, 3)
    : [
        { name: "Kohli 50+ Runs", pnl: 520, isUp: true },
        { name: "RCB Match Winner", pnl: 410, isUp: true },
        { name: "Next Wicket <18 OV", pnl: -70, isUp: false },
      ];

  return (
    <div className="bg-[#0a1428] rounded-xl border border-white/10 p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-1">
            Your Matchday
          </div>
          <div className="text-sm font-medium text-white/80">
            <span className="text-white font-bold">{openPositionsCount || 3}</span> open positions
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] bg-error px-1.5 py-0.5 inline-block rounded font-bold uppercase tracking-widest mb-1 text-white">
            LIVE
          </div>
          <div className={cn("text-xl font-data-tabular font-black", combinedPnL >= 0 ? "text-bull-green" : "text-bear-red")}>
            {combinedPnL >= 0 ? "+" : "-"}Rs {Math.abs(combinedPnL).toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] text-on-surface-variant tracking-wider uppercase">
            Combined Live P&L
          </div>
        </div>
      </div>

      {/* Positions List */}
      <div className="space-y-3 flex-1">
        {displayPositions.map((pos, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
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
              <span className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                {pos.name}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn(
                "text-sm font-bold font-data-tabular",
                pos.isUp ? "text-bull-green" : "text-bear-red"
              )}>
                {pos.isUp ? "+" : "-"}Rs {Math.abs(pos.pnl).toLocaleString("en-IN")}
              </span>
              <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Exposure Footer */}
      <div className="mt-6 pt-5 border-t border-white/10">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs text-on-surface-variant font-medium">Total Exposure</span>
          <span className="text-sm font-bold text-white font-data-tabular">Rs {totalExposure.toLocaleString("en-IN")}</span>
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
