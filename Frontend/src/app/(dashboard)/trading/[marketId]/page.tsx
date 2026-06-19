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
import { useMarketDetail, useMarkets, useMatchScoreStream } from "@/features/trading/hooks";
import { pickPrimaryMarket } from "@/features/trading/utils/market-select";
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
  // Cache key is the short matchId; the backend broadcasts on the hex _id, so
  // pass the resolved hex id as the stream id too.
  useMatchScoreStream(matchId, match?.id);
  const { data: matches = [] } = useLiveMatches();

  // Multiple matches can be LIVE at once. Judge "is this market's match live"
  // from the match resolved by the market's OWN matchId (which `useMatchDetails`
  // fetches and which accepts backend short ids like "2"). Comparing against the
  // home list by id is unreliable because markets store short ids while the home
  // list uses hex _id, so never use that to force a redirect.
  const currentMatchIsLive = match?.status === "LIVE";

  // Fallback target only used when the open market is stale (its match is not live).
  const fallbackLiveMatch = React.useMemo(
    () => matches.find((item) => item.status === "LIVE"),
    [matches]
  );
  const { data: fallbackMarkets = [] } = useMarkets(
    currentMatchIsLive ? "" : fallbackLiveMatch?.id ?? ""
  );
  const fallbackMarket = React.useMemo(() => pickPrimaryMarket(fallbackMarkets), [fallbackMarkets]);

  React.useEffect(() => {
    if (!market || !match) return; // wait for the open market + its match to load
    if (currentMatchIsLive) return; // on a live match's market → stay, whichever it is
    if (!fallbackLiveMatch || !fallbackMarket) return;
    if (fallbackMarket.id === marketId) return;

    router.replace(`/trading/${fallbackMarket.id}`);
  }, [currentMatchIsLive, market, match, marketId, fallbackLiveMatch, fallbackMarket, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-on-surface">
        <div className="text-sm font-semibold animate-pulse text-outline">Loading trading terminal...</div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden bg-background text-on-surface">
      <MatchScheduleStrip matches={matches} selectedMatchId={match?.id ?? matchId} />

      <main className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
        <div className="grid min-h-full grid-cols-1 gap-3 p-3 lg:h-full lg:min-h-0 lg:grid-cols-[300px_minmax(0,1fr)_360px] xl:grid-cols-[340px_minmax(0,1fr)_420px] 2xl:grid-cols-[360px_minmax(0,1fr)_440px]">
          <LiveMatchStatsPanel className="lg:h-full lg:min-h-0" match={match} market={market} />
          <OptionChain className="lg:h-full lg:min-h-0" marketId={marketId} market={market} match={match} />
          <section className="flex min-h-0 flex-col gap-2 overflow-y-auto pr-1 lg:h-full">
            <OrderEntryForm matchId={matchId} marketId={marketId} match={match} />
            <TradingActivityPanel className="min-h-[260px] shrink-0 lg:flex-1" matchId={matchId} marketId={marketId} match={match} market={market} />
          </section>
        </div>
      </main>
    </div>
  );
}
