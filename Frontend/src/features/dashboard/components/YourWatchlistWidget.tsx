import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLiveTicker } from "@/features/dashboard/hooks";

export function YourWatchlistWidget() {
  const { data: tickers } = useLiveTicker();
  const tradingHref = tickers?.[0]?.id ? `/trading/${tickers[0].id}` : "/dashboard";
  const trackedItems = [
    { id: "VK", color: "text-[#d4af37]", border: "border-[#d4af37]/30", bg: "bg-[#d4af37]/10", contract: "Kohli 75+ Runs", price: 72, trend: "+18.4%", isUp: true, isPreMatch: false },
    { id: "RCB", color: "text-error", border: "border-error/30", bg: "bg-error/10", contract: "RCB Match Winner", price: 64, trend: "-3.0%", isUp: false, isPreMatch: false },
    { id: "BB", color: "text-purple-400", border: "border-purple-400/30", bg: "bg-purple-400/10", contract: "Bumrah 2+ Wickets", price: 58, trend: "+4.2%", isUp: true, isPreMatch: false },
    { id: "CSK", color: "text-yellow-400", border: "border-yellow-400/30", bg: "bg-yellow-400/10", contract: "CSK Powerplay 50+", price: 41, trend: "PRE-MATCH", isUp: null, isPreMatch: true },
  ];

  return (
    <div className="bg-[#0a1428] rounded-xl border border-white/10 flex flex-col h-full">
      <div className="p-5 border-b border-white/10 flex justify-between items-end">
        <h3 className="text-sm font-bold tracking-widest text-white uppercase">Your Watchlist</h3>
        <span className="text-[10px] text-on-surface-variant font-bold tracking-widest uppercase">
          5 Tracked
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {trackedItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={cn("w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-black", item.color, item.border, item.bg)}>
                  {item.id}
                </div>
                <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                  {item.contract}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm font-data-tabular font-bold text-white">₵{item.price}</div>
                  <div className={cn(
                    "text-[10px] font-bold font-data-tabular uppercase tracking-wider",
                    item.isPreMatch ? "text-on-surface-variant" : (item.isUp ? "text-bull-green" : "text-bear-red")
                  )}>
                    {item.trend}
                  </div>
                </div>
                <button className="text-[#d4af37] hover:text-yellow-300 transition-colors">
                  <Star className={cn("w-5 h-5", item.id !== "CSK" ? "fill-current" : "")} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/10">
        <Link href={tradingHref} className="w-full py-2.5 rounded border border-white/10 hover:bg-white/5 text-xs font-bold text-cyan-400 uppercase tracking-widest transition-colors block text-center">
          Manage Watchlist
        </Link>
      </div>
    </div>
  );
}
