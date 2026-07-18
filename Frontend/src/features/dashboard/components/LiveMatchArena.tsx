import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveMatches, useLiveTicker } from "@/features/dashboard/hooks";
import { useMarkets } from "@/features/trading/hooks";
import Link from "next/link";
import { ballClassName, scoreParts } from "@/features/trading/utils/terminal-context";
import { useStableMatchSnapshot } from "@/features/trading/hooks/useStableMatchSnapshot";
import {
  formatMatchStartTime,
  isLiveOrBreak,
  isUpcomingMatch,
  sortHomeMatches,
  tradingOpensMessage,
} from "@/features/trading/utils/home-matches";
import { selectPrimaryMarket } from "@/features/trading/utils/market-helpers";

export function LiveMatchArena() {
  const { data: liveMatches, isLoading } = useLiveMatches();
  const { data: tickers } = useLiveTicker();
  const homeMatches = React.useMemo(() => sortHomeMatches(liveMatches ?? []), [liveMatches]);
  const upcomingMatches = homeMatches.filter(isUpcomingMatch);

  const match = homeMatches.find(isLiveOrBreak) || null;
  const { data: matchMarkets } = useMarkets(match?.id || "");
  
  const liveMarketId = selectPrimaryMarket(matchMarkets ?? [])?.id;
  const tradingHref = liveMarketId ? `/trading/${liveMarketId}` : (tickers?.[0]?.id ? `/trading/${tickers[0].id}` : "/trading");
  
  const { stableMatch, balls } = useStableMatchSnapshot(match || undefined, liveMarketId);

  if (!stableMatch) {
    if (upcomingMatches.length > 0) {
      return (
        <div className="relative flex min-h-[360px] w-full overflow-hidden rounded-xl bg-[#01040a] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:rounded-2xl sm:p-6">
          <img
            src="/stadium.png"
            alt="Cricket stadium"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#000d1a] via-[#000d1a]/88 to-[#020817]" />
          <div className="relative z-10 flex w-full flex-col gap-4">
            <div>
              <div className="inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-100 ring-1 ring-cyan-300/25 bg-cyan-400/10">
                Upcoming
              </div>
              <h2 className="mt-2 font-display text-xl font-black text-white sm:text-2xl">
                Next Sportmonks fixtures
              </h2>
              <p className="mt-1 text-sm font-semibold text-on-surface-variant">
                No live match right now. Preview scheduled fixtures — trading opens at go-live.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {upcomingMatches.slice(0, 4).map((fixture) => (
                <UpcomingArenaCard key={fixture.id} matchId={fixture.id} title={fixture.title} startTime={fixture.startTime} format={fixture.format} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative flex min-h-[360px] w-full items-center justify-center overflow-hidden rounded-xl bg-[#01040a] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:rounded-2xl">
        <img
          src="/stadium.png"
          alt="Cricket stadium"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#000d1a] via-[#000d1a]/88 to-[#020817]" />
        <div className="relative z-10 max-w-md rounded-2xl border border-white/10 bg-black/25 p-5 text-center backdrop-blur-xl">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
            <span className="material-symbols-outlined text-[22px]">{isLoading ? "sync" : "sports_cricket"}</span>
          </div>
          <h2 className="font-display text-xl font-black text-white">
            {isLoading ? "Loading provider fixtures" : "No Sportmonks fixtures"}
          </h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-on-surface-variant">
            {isLoading
              ? "Checking live and upcoming Sportmonks matches..."
              : "The home feed has no live or upcoming provider matches right now."}
          </p>
          <Link href="/trading" className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-4 text-sm font-black text-cyan-100 hover:bg-cyan-300/15">
            Trading terminal
          </Link>
        </div>
      </div>
    );
  }
  
  const title = stableMatch?.title || "No Live Match";
  const scoreParsed = scoreParts(stableMatch?.homeScore);
  const currentScore = stableMatch?.currentScore ?? (Number.isFinite(Number.parseInt(scoreParsed.runs, 10)) ? Number.parseInt(scoreParsed.runs, 10) : 0);
  const wickets = stableMatch?.wicketsLost ?? (Number.isFinite(Number.parseInt(scoreParsed.wickets, 10)) ? Number.parseInt(scoreParsed.wickets, 10) : 0);
  
  const currentOver = stableMatch?.currentOver || "0.0";
  const target = stableMatch?.targetScore || 0;
  const need = stableMatch?.targetScore && stableMatch?.currentScore ? stableMatch.targetScore - stableMatch.currentScore : 0;
  
  const format = (stableMatch?.format || "T20").toUpperCase();
  const totalBalls = format.includes("ODI") || format.includes("ONE") ? 300 : 120;
  
  const currentOverParts = currentOver.split('.');
  const overs = parseInt(currentOverParts[0] || '0', 10);
  const ballsInOver = parseInt(currentOverParts[1] || '0', 10);
  const actualBallsBowled = (overs * 6) + ballsInOver;
  
  const ballsBowled = actualBallsBowled > 0 ? actualBallsBowled : (totalBalls - (stableMatch?.ballsLeft ?? totalBalls));
  const ballsLeft = stableMatch?.ballsLeft ?? Math.max(0, totalBalls - ballsBowled);
  
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

  const displayBalls = balls.filter(b => b.kind !== "empty");
  const timelineBalls = balls;

  const getTeamCode = (team: any) => {
    if (!team) return "TBA";
    const name = team.shortName || team.name || "TBA";
    if (name.length <= 4) return name.toUpperCase();
    const words = name.trim().split(/\s+/);
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 3).toUpperCase();
  };

  const homeCode = getTeamCode(stableMatch?.homeTeam);
  const awayCode = getTeamCode(stableMatch?.awayTeam);
  const battingCode = stableMatch?.innings === 2 ? awayCode : homeCode;
  const isBreak = stableMatch.status === "INNINGS_BREAK";
  const visibleMarkets = (matchMarkets ?? []).slice(0, 3);

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
          <div className={cn("rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white", isBreak ? "bg-amber-500" : "bg-error animate-pulse")}>
            {isBreak ? "INNINGS BREAK" : "LIVE"}
          </div>
          <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white sm:text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
            {stableMatch?.innings ? `${ordinal(stableMatch.innings)} INNINGS` : "1ST INNINGS"}
          </div>
        </div>

        {/* Main Scorecard Glass Pane */}
        <div className="relative w-full overflow-hidden rounded-xl border border-white/5 bg-black/20 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:max-w-sm sm:rounded-2xl sm:p-5 md:mt-4">
          {/* Subtle gradient shine inside the glass pane */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
          
          {/* Team Score */}
          <div className="relative z-10 mb-4 grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[48px_minmax(0,1fr)] sm:gap-4">
            <div className="flex h-11 w-11 items-center justify-center break-words rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/20 text-center font-display text-xl font-black leading-none text-[#d4af37] sm:h-12 sm:w-12 sm:text-2xl overflow-hidden p-1">
              {stableMatch?.innings === 2 && stableMatch?.awayTeam?.logoUrl ? (
                <img src={stableMatch.awayTeam.logoUrl} alt={battingCode} className="h-full w-full object-contain" />
              ) : stableMatch?.innings !== 2 && stableMatch?.homeTeam?.logoUrl ? (
                <img src={stableMatch.homeTeam.logoUrl} alt={battingCode} className="h-full w-full object-contain" />
              ) : (
                battingCode
              )}
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

          {/* Live Context (Batsmen & Bowler) */}
          {stableMatch?.liveContext ? (
            <div className="relative z-10 mb-4 flex flex-col gap-2 sm:mb-5">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="flex justify-between items-center bg-white/[0.02] rounded px-2 py-1.5 border border-white/5">
                  <span className="text-[11px] font-bold text-cyan-400 truncate pr-1">{stableMatch.liveContext.striker.name}*</span>
                  <div className="text-[11px] font-data-tabular shrink-0">
                    <span className="text-white font-bold">{stableMatch.liveContext.striker.runs}</span> <span className="text-white/50">({stableMatch.liveContext.striker.balls})</span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white/[0.02] rounded px-2 py-1.5 border border-white/5">
                  <span className="text-[11px] font-bold text-cyan-400/80 truncate pr-1">{stableMatch.liveContext.nonStriker.name}</span>
                  <div className="text-[11px] font-data-tabular shrink-0">
                    <span className="text-white font-bold">{stableMatch.liveContext.nonStriker.runs}</span> <span className="text-white/50">({stableMatch.liveContext.nonStriker.balls})</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center bg-white/[0.02] rounded px-2 py-1.5 border border-amber-500/10">
                <div className="flex items-center gap-1.5 truncate pr-1">
                  <span className="text-[9px] uppercase tracking-wider text-amber-500/70 shrink-0">Bowling</span>
                  <span className="text-[11px] font-bold text-amber-400 truncate">{stableMatch.liveContext.bowler.name}</span>
                </div>
                <div className="text-[11px] font-data-tabular shrink-0">
                  <span className="text-white font-bold">{stableMatch.liveContext.bowler.wickets}</span>
                  <span className="text-white/50 mx-0.5">-</span>
                  <span className="text-white font-bold">{stableMatch.liveContext.bowler.runs}</span> 
                  <span className="text-white/50 ml-1">({Math.floor(stableMatch.liveContext.bowler.balls / 6)}.{stableMatch.liveContext.bowler.balls % 6})</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative z-10 mb-4 flex flex-col gap-2 sm:mb-5 opacity-40">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="h-[28px] bg-white/[0.05] rounded border border-white/5 animate-pulse" />
                <div className="h-[28px] bg-white/[0.05] rounded border border-white/5 animate-pulse" />
              </div>
              <div className="h-[28px] bg-white/[0.05] rounded border border-amber-500/10 animate-pulse" />
            </div>
          )}

          {/* Over Timeline */}
          <div className="relative z-10 mb-4 flex flex-wrap gap-2">
            {timelineBalls.map((ball, i) => (
              <div
                key={`${stableMatch?.id}-${stableMatch?.innings}-${currentOver}-${i}`}
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
          {visibleMarkets.length > 0 ? (
            visibleMarkets.map((m) => {
              const openPrice = m.open ?? 0;
              const ltp = m.ltp ?? 0;
              const trendVal = openPrice > 0 ? (((ltp - openPrice) / openPrice) * 100) : 0;
              const trend = Math.abs(trendVal).toFixed(1) + "%";
              const isUp = ltp >= openPrice;
              return (
                <MarketMiniCard
                  key={m.id}
                  title={m.title}
                  value={ltp > 0 ? `₹${ltp.toFixed(2)}` : "--"}
                  trend={trend}
                  isUp={isUp}
                />
              );
            })
          ) : (
            <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs font-bold text-amber-100 md:col-span-3">
              No provider market is open for this match state.
            </div>
          )}
          
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

function UpcomingArenaCard({
  matchId,
  title,
  startTime,
  format,
}: {
  matchId: string;
  title: string;
  startTime: string;
  format?: string;
}) {
  const { data: markets = [] } = useMarkets(matchId);
  const marketId = selectPrimaryMarket(markets)?.id;
  const href = marketId ? `/trading/${marketId}` : `/trading/match/${matchId}`;

  return (
    <Link
      href={href}
      className="rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl transition hover:border-cyan-300/25 hover:bg-black/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-cyan-100 bg-cyan-400/10 ring-1 ring-cyan-300/20">
          Upcoming
        </span>
        <span className="font-data-tabular text-[11px] font-semibold text-white/70">
          {formatMatchStartTime(startTime)}
        </span>
      </div>
      <div className="mt-2 truncate text-sm font-black text-white">{title}</div>
      <div className="mt-1 text-[11px] font-semibold text-amber-200/85">
        {format ? `${format} · ` : ""}
        {tradingOpensMessage()}
      </div>
    </Link>
  );
}

function ordinal(value: number) {
  if (value === 1) return "1ST";
  if (value === 2) return "2ND";
  if (value === 3) return "3RD";
  return `${value}TH`;
}
