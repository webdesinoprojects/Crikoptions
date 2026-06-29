import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveMatches, useLiveTicker } from "@/features/dashboard/hooks";
import { useMarkets } from "@/features/trading/hooks";
import Link from "next/link";
import { useThisOverBalls } from "@/features/trading/hooks/useThisOverBalls";
import { ballClassName, scoreParts } from "@/features/trading/utils/terminal-context";

export function LiveMatchArena() {
  const { data: liveMatches, isLoading } = useLiveMatches();
  const { data: tickers } = useLiveTicker();

  const match = liveMatches?.find(m => m.status === "LIVE") || null;
  const { data: matchMarkets } = useMarkets(match?.id || "");
  
  const liveMarketId = matchMarkets?.[0]?.id;
  const tradingHref = liveMarketId ? `/trading/${liveMarketId}` : (tickers?.[0]?.id ? `/trading/${tickers[0].id}` : "/dashboard");
  
  const balls = useThisOverBalls(match || undefined);
  
  const title = match?.title || "No Live Match";
  const scoreParsed = scoreParts(match?.homeScore);
  const currentScore = match?.currentScore ?? (Number.isFinite(Number.parseInt(scoreParsed.runs, 10)) ? Number.parseInt(scoreParsed.runs, 10) : 0);
  const wickets = match?.wicketsLost ?? (Number.isFinite(Number.parseInt(scoreParsed.wickets, 10)) ? Number.parseInt(scoreParsed.wickets, 10) : 0);
  
  const currentOver = match?.currentOver || "0.0";
  const target = match?.targetScore || 0;
  const need = match?.targetScore && match?.currentScore ? match.targetScore - match.currentScore : 0;
  
  const format = (match?.format || "T20").toUpperCase();
  const totalBalls = format.includes("ODI") || format.includes("ONE") ? 300 : 120;
  const ballsLeft = match?.ballsLeft ?? totalBalls;
  const ballsBowled = totalBalls - ballsLeft;
  
  const crr = ballsBowled > 0 ? (currentScore / (ballsBowled / 6)).toFixed(2) : "0.00";
  const rrr = need > 0 && ballsLeft > 0 ? ((need / ballsLeft) * 6).toFixed(2) : "0.00";
  
  const lastBall = balls.length > 0 ? balls.filter(b => b.kind !== "empty").pop() : null;
  let commentarySummary = "Match is about to begin";
  if (lastBall) {
    if (["wicket", "bowled", "lbw", "caught", "runOut"].includes(lastBall.kind)) {
      commentarySummary = "WICKET - big moment in the match!";
    } else if (lastBall.kind === "four") {
      commentarySummary = "FOUR runs - brilliantly timed";
    } else if (lastBall.kind === "six") {
      commentarySummary = "SIX - massive hit into the stands!";
    } else if (lastBall.kind === "dot") {
      commentarySummary = "Dot ball - solid defense";
    } else {
      commentarySummary = `${lastBall.label} run${lastBall.label === "1" ? "" : "s"} taken`;
    }
  }

  // Filter out empty balls for timeline display, but keep at most 6 if none bowled yet
  const displayBalls = balls.filter(b => b.kind !== "empty");
  const timelineBalls = displayBalls.length > 0 ? displayBalls : balls.slice(0, 6);

  const homeCode = match?.homeTeam?.shortName || match?.homeTeam?.name?.substring(0,3)?.toUpperCase() || "TBA";
  const awayCode = match?.awayTeam?.shortName || match?.awayTeam?.name?.substring(0,3)?.toUpperCase() || "TBA";
  const battingCode = match?.innings === 2 ? awayCode : homeCode;

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
            {match?.innings ? `${match.innings}ND INNINGS` : "1ST INNINGS"}
          </div>
        </div>

        {/* Main Scorecard Glass Pane */}
        <div className="relative w-full overflow-hidden rounded-xl border border-white/5 bg-black/20 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:max-w-sm sm:rounded-2xl sm:p-5 md:mt-4">
          {/* Subtle gradient shine inside the glass pane */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
          
          {/* Team Score */}
          <div className="relative z-10 mb-4 grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[48px_minmax(0,1fr)] sm:gap-4">
            <div className="flex h-11 w-11 items-center justify-center break-words rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/20 px-1 text-center font-display text-xl font-black leading-none text-[#d4af37] sm:h-12 sm:w-12 sm:text-2xl">
              {battingCode}
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-1">
                <span className="break-words font-display text-2xl font-black leading-none text-white sm:text-3xl">
                  {currentScore}/{wickets}
                </span>
                <span className="mb-0.5 whitespace-nowrap text-xs font-medium text-white/70 sm:text-sm">{currentOver} OV</span>
              </div>
              <div className="text-xs text-white/50 mt-1">Target {target > 0 ? target : "--"}</div>
            </div>
          </div>

          {/* Match Equation */}
          <div className="relative z-10 mb-4 grid grid-cols-3 gap-2 border-y border-white/5 py-3 text-[11px] sm:mb-5 sm:text-xs">
            <div className="text-white">Need <span className="text-cyan-400 font-black">{target > 0 ? need : "--"}</span> from <span className="text-cyan-400 font-black">{target > 0 ? ballsLeft : "--"}</span></div>
            <div className="text-right text-white/60">CRR <span className="text-white font-bold">{crr}</span></div>
            <div className="text-right text-white/60">RRR <span className="text-white font-bold">{target > 0 ? rrr : "--"}</span></div>
          </div>

          {/* Batsmen */}
          {match?.liveContext ? (
            <div className="relative z-10 mb-4 grid grid-cols-1 gap-2 sm:mb-5 sm:grid-cols-2 sm:gap-4">
              <div className="flex justify-between items-center bg-white/[0.02] rounded px-2 py-1.5">
                <span className="text-xs font-bold text-cyan-400 truncate pr-1">{match.liveContext.striker.name}*</span>
                <div className="text-xs font-data-tabular shrink-0">
                  <span className="text-white font-bold">{match.liveContext.striker.runs}</span> <span className="text-white/50">({match.liveContext.striker.balls})</span>
                </div>
              </div>
              <div className="flex justify-between items-center bg-white/[0.02] rounded px-2 py-1.5">
                <span className="text-xs font-bold text-cyan-400 truncate pr-1">{match.liveContext.nonStriker.name}</span>
                <div className="text-xs font-data-tabular shrink-0">
                  <span className="text-white font-bold">{match.liveContext.nonStriker.runs}</span> <span className="text-white/50">({match.liveContext.nonStriker.balls})</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative z-10 mb-4 py-2 text-[10px] leading-relaxed text-amber-200/80">
              Player context is not set for this match yet.
            </div>
          )}

          {/* Over Timeline */}
          <div className="relative z-10 mb-4 flex flex-wrap gap-2">
            {timelineBalls.map((ball, i) => (
              <div
                key={i}
                className={cn(
                  "flex h-7 min-w-7 px-1.5 items-center justify-center rounded-lg text-[12px] font-black transition-all sm:h-8 sm:min-w-8 sm:px-2 sm:text-[13px] border",
                  ballClassName(ball.kind),
                  ball.kind === "empty" ? "bg-white/5 text-white/30 border-transparent shadow-none" : ""
                )}
              >
                {ball.label}
              </div>
            ))}
          </div>

          {/* Commentary */}
          <div className="text-[11px] text-white/60 bg-black/20 p-2.5 rounded-lg border border-white/5 relative z-10">
            {lastBall && (
              <>
                <span className="text-white font-bold mr-1">{currentOver}</span>
                <span className="text-cyan-400 font-bold mr-1">{lastBall.label} -</span>
              </>
            )}
            {commentarySummary}
          </div>
        </div>

        {/* Bottom Market Cards */}
        <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2 sm:gap-3 md:mt-auto md:grid-cols-4 md:gap-4 md:pt-6">
          <MarketMiniCard title={`${battingCode} WIN`} value="--" trend="--" isUp />
          <MarketMiniCard title="MATCH WINNER" value="--" trend="--" isUp />
          <MarketMiniCard title="NEXT WICKET" value="--" trend="--" isUp={false} />
          
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
          {isUp ? "UP" : "DN"} {trend}
        </div>
      </div>
    </div>
  );
}
