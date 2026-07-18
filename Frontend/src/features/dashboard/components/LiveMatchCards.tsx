"use client";

import { useLiveMatches } from "@/features/dashboard/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { LiveIndicator } from "@/components/shared/Primitives";
import {
  formatMatchStartTime,
  isLiveOrBreak,
  isUpcomingMatch,
  sortHomeMatches,
} from "@/features/trading/utils/home-matches";

export function LiveMatchCards() {
  const { data: matches, isLoading } = useLiveMatches();

  if (isLoading || !matches) return null;
  if (matches.length === 0) return null;

  const visible = sortHomeMatches(matches);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {visible.map((match) => {
        const upcoming = isUpcomingMatch(match);
        const live = isLiveOrBreak(match);

        return (
          <Card key={match.id} className="bg-surface-container-lowest border-outline-variant">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-label-sm text-label-sm font-bold text-primary uppercase">
                  {match.title}
                </span>
                {live ? (
                  <LiveIndicator />
                ) : upcoming ? (
                  <span className="rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-100 ring-1 ring-cyan-300/25 bg-cyan-400/10">
                    Upcoming
                  </span>
                ) : null}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{match.homeTeam.shortName}</span>
                  {!upcoming && match.homeScore && (
                    <span className="font-data-tabular">{match.homeScore}</span>
                  )}
                </div>
                <div className="text-xs text-on-surface-variant font-data-tabular">
                  {match.status === "LIVE"
                    ? `${match.currentOver} OVR`
                    : match.status === "INNINGS_BREAK"
                      ? "Innings break"
                      : formatMatchStartTime(match.startTime)}
                </div>
                <div className="flex items-center gap-2">
                  {!upcoming && match.awayScore && (
                    <span className="font-data-tabular">{match.awayScore}</span>
                  )}
                  <span className="font-bold text-lg text-on-surface-variant">{match.awayTeam.shortName}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
