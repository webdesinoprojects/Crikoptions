import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveMatches, useLiveTicker } from "@/features/dashboard/hooks";
import { useMarkets } from "@/features/trading/hooks";
import Link from "next/link";

export function LiveMatchArena() {
  const { data: liveMatches, isLoading } = useLiveMatches();
  const { data: tickers } = useLiveTicker();

  // Try to find a live match or fallback to a hardcoded representation for the UI mockup
  const match = liveMatches?.find(m => m.status === "LIVE") || null;
  const { data: matchMarkets } = useMarkets(match?.id || "");
  
  const liveMarketId = matchMarkets?.[0]?.id;
  const tradingHref = liveMarketId ? `/trading/${liveMarketId}` : (tickers?.[0]?.id ? `/trading/${tickers[0].id}` : "/dashboard");
  
  const title = match?.title || "RCB vs KKR";
  const score = match?.homeScore || "142/4";
  const currentOver = match?.currentOver || "16.2";
  const target = match?.targetScore || 176;
  const need = match?.targetScore && match?.currentScore ? match.targetScore - match.currentScore : 34;
  const ballsLeft = match?.ballsLeft || 22;
  const crr = match?.currentOver && match?.currentScore ? (match.currentScore / parseFloat(match.currentOver)).toFixed(2) : "8.69";
  const rrr = need > 0 && ballsLeft > 0 ? ((need / ballsLeft) * 6).toFixed(2) : "9.27";

  return (
    <div className="relative w-full h-[400px] md:h-[480px] rounded-2xl overflow-hidden border border-white/10 group">
      {/* Background Image */}
      <img
        src="/stadium.png"
        alt="Live Match Stadium"
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
      />
      
      {/* Heavy Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#000d1a] via-[#000d1a]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#000d1a] via-transparent to-transparent" />

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-6">
        
        {/* Top Header / Live Indicator */}
        <div className="flex items-center gap-3">
          <div className="bg-error px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white animate-pulse">
            LIVE
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-white tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
            {match?.innings ? `${match.innings}ND INNINGS` : "2ND INNINGS"}
          </div>
        </div>

        {/* Main Scorecard Glass Pane */}
        <div className="mt-4 w-full max-w-sm bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-2xl">
          {/* Team Score */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/30 flex items-center justify-center font-display text-2xl font-black text-[#d4af37] text-center leading-none px-1 break-words">
              {match?.homeTeam?.shortName || "RCB"}
            </div>
            <div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black font-display text-white leading-none">{score}</span>
                <span className="text-sm font-medium text-white/70 mb-0.5">{currentOver} OV</span>
              </div>
              <div className="text-xs text-white/50 mt-1">Target {target}</div>
            </div>
          </div>

          {/* Match Equation */}
          <div className="flex items-center justify-between text-xs mb-5 py-2 border-y border-white/10">
            <div className="text-white">Need <span className="text-cyan-400 font-bold">{need}</span> from <span className="text-cyan-400 font-bold">{ballsLeft}</span></div>
            <div className="text-white/60">CRR <span className="text-white font-bold">{crr}</span></div>
            <div className="text-white/60">RRR <span className="text-white font-bold">{rrr}</span></div>
          </div>

          {/* Batsmen */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-cyan-400 truncate pr-1">{match?.liveContext?.striker?.name || "V. Kohli"}*</span>
              <div className="text-xs font-data-tabular shrink-0">
                <span className="text-white font-bold">{match?.liveContext?.striker?.runs || 71}</span> <span className="text-white/50">({match?.liveContext?.striker?.balls || 46})</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-cyan-400 truncate pr-1">{match?.liveContext?.nonStriker?.name || "D. Karthik"}</span>
              <div className="text-xs font-data-tabular shrink-0">
                <span className="text-white font-bold">{match?.liveContext?.nonStriker?.runs || 12}</span> <span className="text-white/50">({match?.liveContext?.nonStriker?.balls || 7})</span>
              </div>
            </div>
          </div>

          {/* Over Timeline */}
          <div className="flex gap-1.5 mb-4">
            {["1", "4", "0", "6", "W", "2"].map((ball, i) => (
              <div
                key={i}
                className={cn(
                  "w-8 h-8 rounded flex items-center justify-center text-xs font-black",
                  ball === "4" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" :
                  ball === "6" ? "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30" :
                  ball === "W" ? "bg-error/20 text-error border border-error/30" :
                  "bg-white/5 text-white/80 border border-white/10"
                )}
              >
                {ball}
              </div>
            ))}
          </div>

          {/* Commentary */}
          <div className="text-[11px] text-white/60 bg-black/40 p-2 rounded border border-white/5">
            <span className="text-white font-bold mr-1">{currentOver}</span>
            <span className="text-cyan-400 font-bold mr-1">TWO -</span>
            driven into the gap at cover
          </div>
        </div>

        {/* Bottom Market Cards */}
        <div className="mt-auto grid grid-cols-1 md:grid-cols-4 gap-3 pt-6">
          <MarketMiniCard title={`${match?.homeTeam?.shortName || "RCB"} WIN`} value="64.2%" trend="+6.8%" isUp />
          <MarketMiniCard title="KOHLI 75+" value="Rs 72" trend="+18.4%" isUp />
          <MarketMiniCard title="NEXT WICKET <18 OV" value="Rs 38" trend="-5.2%" isUp={false} />
          
          <Link href={tradingHref} className="h-full w-full bg-cyan-500 hover:bg-cyan-400 text-[#000d1a] font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-cyan-300/50">
            Watch & Trade
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}

function MarketMiniCard({ title, value, trend, isUp }: { title: string, value: string, trend: string, isUp: boolean }) {
  return (
    <div className="bg-[#0a1428]/80 backdrop-blur-md border border-white/10 hover:border-white/20 transition-colors rounded-xl p-3 flex flex-col justify-between">
      <div className="text-[10px] text-on-surface-variant font-bold tracking-wider uppercase mb-2 line-clamp-1">
        {title}
      </div>
      <div className="flex items-end justify-between">
        <div className="text-xl font-data-tabular font-black text-white">{value}</div>
        <div className={cn("text-xs font-bold font-data-tabular flex items-center", isUp ? "text-bull-green" : "text-bear-red")}>
          {isUp ? "▲" : "▼"} {trend}
        </div>
      </div>
    </div>
  );
}
