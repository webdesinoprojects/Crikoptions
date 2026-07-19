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

export function ComingUp() {
  const { data: matches = [] } = useUpcomingMatches();
  const upcomingMatches = sortHomeMatches(matches).filter(isUpcomingMatch);
  const upcomingMatch = upcomingMatches[0];
  const { data: upcomingMarkets = [] } = useMarkets(upcomingMatch?.id || "");

  const upcomingMarketId = selectPrimaryMarket(upcomingMarkets)?.id;
  const tradingHref = upcomingMarketId
    ? `/trading/${upcomingMarketId}`
    : upcomingMatch
      ? `/trading/match/${upcomingMatch.id}`
      : "/trading";

  if (!upcomingMatch) {
    return (
      <div className="bg-[#0a1428] rounded-xl border border-white/10 p-5 mt-4">
        <div className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-2">
          Coming Up
        </div>
        <p className="text-sm font-semibold text-on-surface-variant">
          No upcoming Sportmonks fixtures in the home feed.
        </p>
      </div>
    );
  }

  const homeTeam = upcomingMatch.homeTeam?.shortName || upcomingMatch.homeTeam?.name || "TBA";
  const awayTeam = upcomingMatch.awayTeam?.shortName || upcomingMatch.awayTeam?.name || "TBA";
  const startTimeDisplay = formatMatchStartTime(upcomingMatch.startTime);
  const extraCount = Math.max(0, upcomingMatches.length - 1);

  return (
    <div className="bg-[#0a1428] rounded-xl border border-white/10 p-5 mt-4">
      <div className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-4">
        Coming Up
      </div>

      <div className="flex items-center gap-4">
        <div className="flex -space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-yellow-500 border-2 border-[#0a1428] flex items-center justify-center font-black text-[#000d1a] text-xs z-10 overflow-hidden">
            {upcomingMatch.homeTeam?.logoUrl ? (
              <img src={upcomingMatch.homeTeam.logoUrl} alt={homeTeam} className="h-full w-full object-contain" />
            ) : (
              homeTeam.slice(0, 3)
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-[#0a1428] flex items-center justify-center font-black text-white text-xs overflow-hidden">
            {upcomingMatch.awayTeam?.logoUrl ? (
              <img src={upcomingMatch.awayTeam.logoUrl} alt={awayTeam} className="h-full w-full object-contain" />
            ) : (
              awayTeam.slice(0, 3)
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-cyan-100 bg-cyan-400/10 ring-1 ring-cyan-300/20">
              Upcoming
            </span>
            <span className="text-sm font-medium text-white/60">{startTimeDisplay}</span>
          </div>
          <div className="truncate text-sm font-bold text-white">
            {homeTeam} vs {awayTeam}
            {upcomingMatch.format ? ` · ${upcomingMatch.format}` : ""}
          </div>
          <div className="text-xs text-on-surface-variant mt-0.5">
            {tradingOpensMessage(upcomingMatch)}
            {extraCount > 0 ? ` · +${extraCount} more` : ""}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={tradingHref}
            className="px-4 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors inline-block text-center"
          >
            Preview
          </Link>
          <button
            type="button"
            className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            aria-label="Notify"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
