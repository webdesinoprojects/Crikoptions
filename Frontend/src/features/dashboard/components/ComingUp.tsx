import { Bell } from "lucide-react";
import { useUpcomingMatches } from "@/features/dashboard/hooks";
import { useMarkets } from "@/features/trading/hooks";
import Link from "next/link";
import {
  formatMatchStartTime,
  isUpcomingMatch,
  sortHomeMatches,
  tradingOpensMessage,
} from "@/features/trading/utils/home-matches";
import { selectPrimaryMarket } from "@/features/trading/utils/market-helpers";
import type { Match } from "@/types";
import { useEffect, useRef } from "react";

export function ComingUp() {
  const { data: matches = [] } = useUpcomingMatches();
  const upcomingMatches = sortHomeMatches(matches).filter(isUpcomingMatch);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || upcomingMatches.length <= 2) return;

    let animationFrameId: number;
    let scrollSpeed = 0.35; // Pixels per frame (slow and smooth)
    let position = 0;

    const scroll = () => {
      position += scrollSpeed;
      if (el) {
        el.scrollTop = position;

        // Loop back to the top when reaching the end of the scroll (with 1px buffer)
        if (position >= el.scrollHeight - el.clientHeight - 1) {
          position = 0;
          el.scrollTop = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    // Pause on hover
    const handleMouseEnter = () => {
      cancelAnimationFrame(animationFrameId);
    };

    // Resume from current user scroll position
    const handleMouseLeave = () => {
      position = el.scrollTop;
      animationFrameId = requestAnimationFrame(scroll);
    };

    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);

    // Delay scroll start by 1.5 seconds to allow reading initially
    const delayTimer = setTimeout(() => {
      animationFrameId = requestAnimationFrame(scroll);
    }, 1500);

    return () => {
      clearTimeout(delayTimer);
      cancelAnimationFrame(animationFrameId);
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [upcomingMatches.length]);

  if (upcomingMatches.length === 0) {
    return (
      <div className="bg-[#0a1428] rounded-xl border border-white/10 p-5">
        <div className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-2">
          Coming Up
        </div>
        <p className="text-sm font-semibold text-on-surface-variant">
          No upcoming matches in the home feed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a1428] rounded-xl border border-white/10 p-4 flex flex-col min-h-0">
      <div className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-3 shrink-0 flex items-center justify-between">
        <span>Coming Up</span>
        <span className="text-[10px] text-white/40 font-data-tabular uppercase tracking-normal">
          {upcomingMatches.length} Match{upcomingMatches.length === 1 ? "" : "es"}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="max-h-52 overflow-y-auto space-y-1 pr-1 [scrollbar-color:rgba(255,255,255,0.08)_transparent] [scrollbar-width:thin]"
      >
        {upcomingMatches.map((match) => (
          <UpcomingMatchRow key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}

interface UpcomingMatchRowProps {
  match: Match;
}

function UpcomingMatchRow({ match }: UpcomingMatchRowProps) {
  const { data: markets = [] } = useMarkets(match.id);
  const marketId = selectPrimaryMarket(markets)?.id;
  const tradingHref = marketId
    ? `/trading/${marketId}`
    : `/trading/match/${match.id}`;

  const homeTeam = match.homeTeam?.shortName || match.homeTeam?.name || "TBA";
  const awayTeam = match.awayTeam?.shortName || match.awayTeam?.name || "TBA";
  const startTimeDisplay = formatMatchStartTime(match.startTime);

  return (
    <div className="flex items-center gap-4 py-2.5 border-b border-white/5 last:border-b-0">
      <div className="flex -space-x-3 shrink-0">
        <div className="w-9 h-9 rounded-full bg-yellow-500 border-2 border-[#0a1428] flex items-center justify-center font-black text-[#000d1a] text-xs z-10 overflow-hidden">
          {match.homeTeam?.logoUrl ? (
            <img src={match.homeTeam.logoUrl} alt={homeTeam} className="h-full w-full object-contain" />
          ) : (
            homeTeam.slice(0, 3)
          )}
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-600 border-2 border-[#0a1428] flex items-center justify-center font-black text-white text-xs overflow-hidden">
          {match.awayTeam?.logoUrl ? (
            <img src={match.awayTeam.logoUrl} alt={awayTeam} className="h-full w-full object-contain" />
          ) : (
            awayTeam.slice(0, 3)
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
          <span className="rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-cyan-100 bg-cyan-400/10 ring-1 ring-cyan-300/20">
            Upcoming
          </span>
          <span className="text-[11px] font-medium text-white/50">{startTimeDisplay}</span>
        </div>
        <div className="truncate text-xs font-bold text-white">
          {homeTeam} vs {awayTeam}
          {match.format ? ` · ${match.format}` : ""}
        </div>
        <div className="text-[10px] text-on-surface-variant mt-0.5">
          {tradingOpensMessage(match)}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={tradingHref}
          className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider transition-colors inline-block text-center"
        >
          Preview
        </Link>
        <button
          type="button"
          className="w-7 h-7 rounded bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label="Notify"
        >
          <Bell className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
