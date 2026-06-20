"use client";

import { useLiveMatches } from "@/features/dashboard/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { LiveIndicator } from "@/components/shared/Primitives";

export function LiveMatchCards() {
  const { data: matches, isLoading } = useLiveMatches();

  if (isLoading || !matches) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {matches.map((match) => (
        <Card key={match.id} className="bg-surface-container-lowest border-outline-variant">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-label-sm text-label-sm font-bold text-primary uppercase">
                {match.title}
              </span>
              {match.status === "LIVE" && <LiveIndicator />}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{match.homeTeam.shortName}</span>
                {match.homeScore && <span className="font-data-tabular">{match.homeScore}</span>}
              </div>
              <div className="text-xs text-on-surface-variant font-data-tabular">
                {match.status === "LIVE" ? `${match.currentOver} OVR` : new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center gap-2">
                {match.awayScore && <span className="font-data-tabular">{match.awayScore}</span>}
                <span className="font-bold text-lg text-on-surface-variant">{match.awayTeam.shortName}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
