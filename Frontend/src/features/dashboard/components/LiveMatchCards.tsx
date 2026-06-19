"use client";

import { useRouter } from "next/navigation";
import { useLiveMatches } from "@/features/dashboard/hooks";
import { useMarkets } from "@/features/trading/hooks";
import { pickPrimaryMarket } from "@/features/trading/utils/market-select";
import { Card, CardContent } from "@/components/ui/card";
import { LiveIndicator } from "@/components/shared/Primitives";
import { Match } from "@/types";

export function LiveMatchCards() {
  const { data: matches, isLoading } = useLiveMatches();

  if (isLoading || !matches) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {matches.map((match) => (
        <LiveMatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}

function LiveMatchCard({ match }: { match: Match }) {
  const router = useRouter();
  // Each live match has its own markets; resolve this match's primary market so
  // clicking opens the correct terminal even when several matches are live.
  const { data: markets = [] } = useMarkets(match.id);
  const primaryMarket = pickPrimaryMarket(markets);
  const tradable = match.status === "LIVE" && !!primaryMarket?.id;

  const openMatch = () => {
    if (primaryMarket?.id) {
      router.push(`/trading/${primaryMarket.id}`);
    }
  };

  return (
    <Card
      onClick={tradable ? openMatch : undefined}
      role={tradable ? "button" : undefined}
      tabIndex={tradable ? 0 : undefined}
      onKeyDown={(event) => {
        if (tradable && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          openMatch();
        }
      }}
      className={`bg-surface-container-lowest border-outline-variant transition-colors ${
        tradable ? "cursor-pointer hover:border-primary/60 hover:bg-surface-container" : ""
      }`}
    >
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
            {match.status === "LIVE"
              ? `${match.currentOver} OVR`
              : new Date(match.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>

          <div className="flex items-center gap-2">
            {match.awayScore && <span className="font-data-tabular">{match.awayScore}</span>}
            <span className="font-bold text-lg text-on-surface-variant">{match.awayTeam.shortName}</span>
          </div>
        </div>

        {tradable && (
          <div className="mt-3 text-right text-[11px] font-bold uppercase tracking-wide text-primary">
            Trade now →
          </div>
        )}
      </CardContent>
    </Card>
  );
}
