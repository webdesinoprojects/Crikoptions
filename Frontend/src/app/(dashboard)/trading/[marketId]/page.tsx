"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  LiveMatchStatsPanel,
  MatchScheduleStrip,
  OptionChain,
  OrderEntryForm,
  TradingActivityPanel,
} from "@/features/trading/components";
import { useMarketDetail, useMarkets } from "@/features/trading/hooks";
import { useLiveMatches, useMatchDetails } from "@/features/dashboard/hooks";

interface PageProps {
  params: Promise<{ marketId: string }>;
}

export default function TradingTerminalPage({ params }: PageProps) {
  const router = useRouter();
  const { marketId } = React.use(params);
  const { data: market, isLoading } = useMarketDetail(marketId);
  const matchId = market?.matchId ?? "";
  const { data: match } = useMatchDetails(matchId);
  const { data: matches = [] } = useLiveMatches();
  const liveMatch = React.useMemo(() => matches.find((item) => item.status === "LIVE"), [matches]);
  const { data: liveMarkets = [] } = useMarkets(liveMatch?.id ?? "");
  const preferredLiveMarket = React.useMemo(() => pickPrimaryMarket(liveMarkets), [liveMarkets]);

  React.useEffect(() => {
    if (!market || !liveMatch || !preferredLiveMarket) return;
    if (market.matchId === liveMatch.id || preferredLiveMarket.id === marketId) return;

    router.replace(`/trading/${preferredLiveMarket.id}`);
  }, [liveMatch, market, marketId, preferredLiveMarket, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-on-surface">
        <div className="text-sm font-semibold animate-pulse text-outline">Loading trading terminal...</div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden bg-background text-on-surface">
      <MatchScheduleStrip matches={matches} selectedMatchId={matchId} />

      <main className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
        <div className="grid min-h-full grid-cols-1 gap-3 p-3 lg:h-full lg:min-h-0 lg:grid-cols-[250px_minmax(0,1fr)_315px] xl:grid-cols-[280px_minmax(0,1fr)_340px] 2xl:grid-cols-[300px_minmax(0,1fr)_370px]">
          <LiveMatchStatsPanel className="lg:h-full lg:min-h-0" match={match} market={market} />
          <OptionChain className="lg:h-full lg:min-h-0" marketId={marketId} market={market} match={match} />
          <section className="flex min-h-0 flex-col gap-2 overflow-y-auto pr-1 lg:h-full">
            <OrderEntryForm matchId={matchId} marketId={marketId} match={match} />
            <TradingActivityPanel className="min-h-[260px] shrink-0 lg:flex-1" matchId={matchId} marketId={marketId} />
          </section>
        </div>
      </main>
    </div>
  );
}

function pickPrimaryMarket<T extends { id: string; status?: string; type?: string }>(markets: T[]) {
  const activeMarkets = markets.filter((market) => {
    const status = (market.status ?? "").toLowerCase();
    return status !== "closed" && status !== "settled" && status !== "suspended";
  });
  const candidates = activeMarkets.length > 0 ? activeMarkets : markets;

  return (
    candidates.find((market) => (market.type ?? "").toLowerCase() === "match_depth") ??
    candidates.find((market) => (market.type ?? "").toLowerCase() === "team_total") ??
    candidates[0]
  );
}
