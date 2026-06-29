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
    <div className="group relative min-h-[560px] w-full overflow-hidden rounded-xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:rounded-2xl md:h-[480px] md:min-h-0">
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
      <div className="relative z-10 flex min-h-[560px] w-full flex-col gap-4 p-4 sm:p-5 md:h-full md:min-h-0 md:justify-between md:gap-0 md:p-6">
        
        {/* Top Header / Live Indicator */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="bg-error px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white animate-pulse">
            LIVE
          </div>
          <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white sm:text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
            {match?.innings ? `${match.innings}ND INNINGS` : "2ND INNINGS"}
          </div>
        </div>

        {/* Main Scorecard Glass Pane */}
        <div className="relative w-full overflow-hidden rounded-xl border border-white/5 bg-black/20 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:max-w-sm sm:rounded-2xl sm:p-5 md:mt-4">
          {/* Subtle gradient shine inside the glass pane */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
          
          {/* Team Score */}
          <div className="relative z-10 mb-4 grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[48px_minmax(0,1fr)] sm:gap-4">
            <div className="flex h-11 w-11 items-center justify-center break-words rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/20 px-1 text-center font-display text-xl font-black leading-none text-[#d4af37] sm:h-12 sm:w-12 sm:text-2xl">
              {match?.homeTeam?.shortName || "RCB"}
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-1">
                <span className="break-words font-display text-2xl font-black leading-none text-white sm:text-3xl">{score}</span>
                <span className="mb-0.5 whitespace-nowrap text-xs font-medium text-white/70 sm:text-sm">{currentOver} OV</span>
              </div>
              <div className="text-xs text-white/50 mt-1">Target {target}</div>
            </div>
          </div>

          {/* Match Equation */}
          <div className="relative z-10 mb-4 grid grid-cols-3 gap-2 border-y border-white/5 py-3 text-[11px] sm:mb-5 sm:text-xs">
            <div className="text-white">Need <span className="text-cyan-400 font-black">{need}</span> from <span className="text-cyan-400 font-black">{ballsLeft}</span></div>
            <div className="text-right text-white/60">CRR <span className="text-white font-bold">{crr}</span></div>
            <div className="text-right text-white/60">RRR <span className="text-white font-bold">{rrr}</span></div>
          </div>

          {/* Batsmen */}
          <div className="relative z-10 mb-4 grid grid-cols-1 gap-2 sm:mb-5 sm:grid-cols-2 sm:gap-4">
            <div className="flex justify-between items-center bg-white/[0.02] rounded px-2 py-1.5">
              <span className="text-xs font-bold text-cyan-400 truncate pr-1">{match?.liveContext?.striker?.name || "V. Kohli"}*</span>
              <div className="text-xs font-data-tabular shrink-0">
                <span className="text-white font-bold">{match?.liveContext?.striker?.runs || 71}</span> <span className="text-white/50">({match?.liveContext?.striker?.balls || 46})</span>
              </div>
            </div>
            <div className="flex justify-between items-center bg-white/[0.02] rounded px-2 py-1.5">
              <span className="text-xs font-bold text-cyan-400 truncate pr-1">{match?.liveContext?.nonStriker?.name || "D. Karthik"}</span>
              <div className="text-xs font-data-tabular shrink-0">
                <span className="text-white font-bold">{match?.liveContext?.nonStriker?.runs || 12}</span> <span className="text-white/50">({match?.liveContext?.nonStriker?.balls || 7})</span>
              </div>
            </div>
          </div>

          {/* Over Timeline */}
          <div className="relative z-10 mb-4 flex flex-wrap gap-2">
            {["1", "4", "0", "6", "W", "2"].map((ball, i) => (
              <div
                key={i}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-black transition-all sm:h-8 sm:w-8 sm:text-[13px]",
                  ball === "4" ? "bg-cyan-500/20 text-cyan-400 shadow-[inset_0_0_8px_rgba(6,182,212,0.2)]" :
                  ball === "6" ? "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 shadow-[0_0_12px_rgba(212,175,55,0.4)]" :
                  ball === "W" ? "bg-error/20 text-error border border-error/40 shadow-[0_0_12px_rgba(239,68,68,0.4)]" :
                  "bg-white/5 text-white/80 border border-transparent"
                )}
              >
                {ball}
              </div>
            ))}
          </div>

          {/* Commentary */}
          <div className="text-[11px] text-white/60 bg-black/20 p-2.5 rounded-lg border border-white/5 relative z-10">
            <span className="text-white font-bold mr-1">{currentOver}</span>
            <span className="text-cyan-400 font-bold mr-1">TWO -</span>
            driven into the gap at cover
          </div>
        </div>

        {/* Bottom Market Cards */}
        <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2 sm:gap-3 md:mt-auto md:grid-cols-4 md:gap-4 md:pt-6">
          <MarketMiniCard title={`${match?.homeTeam?.shortName || "RCB"} WIN`} value="64.2%" trend="+6.8%" isUp />
          <MarketMiniCard title="KOHLI 75+" value="Rs 72" trend="+18.4%" isUp />
          <MarketMiniCard title="NEXT WICKET <18 OV" value="Rs 38" trend="-5.2%" isUp={false} />
          
          <Link href={tradingHref} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/50 bg-cyan-500 text-xs font-black uppercase tracking-widest text-[#000d1a] shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-colors hover:bg-cyan-400 md:h-full">
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
    <div className="group flex min-w-0 flex-col justify-between rounded-xl border border-white/5 bg-[#0a1428]/55 p-3 shadow-inner backdrop-blur-xl transition-colors hover:bg-[#0a1428]/70 sm:rounded-2xl sm:p-3.5">
      <div className="text-[10px] text-on-surface-variant font-bold tracking-wider uppercase mb-2 line-clamp-1 group-hover:text-cyan-100 transition-colors">
        {title}
      </div>
      <div className="flex min-w-0 items-end justify-between gap-2">
        <div className="min-w-0 truncate font-data-tabular text-lg font-black text-white sm:text-xl">{value}</div>
        <div className={cn("flex shrink-0 items-center font-data-tabular text-[11px] font-bold sm:text-xs", isUp ? "text-bull-green" : "text-bear-red")}>
          {isUp ? "▲" : "▼"} {trend}
        </div>
      </div>
    </div>
  );
}
