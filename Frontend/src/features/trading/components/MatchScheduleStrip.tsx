"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Market, Match } from "@/types";
import { cn } from "@/lib/utils";
import { scoreParts } from "../utils/terminal-context";
import { useMarkets } from "../hooks";
import { MarketPnLDisplay } from "./MarketPnLDisplay";

interface MatchScheduleStripProps {
  matches: Match[];
  selectedMatchId?: string;
  marketId?: string;
}

function liveMatchesOnly(matches: Match[]): Match[] {
  return matches
    .filter((match) => match.status?.toUpperCase() === "LIVE")
    .sort((a, b) => new Date(a.startTime ?? 0).getTime() - new Date(b.startTime ?? 0).getTime());
}

const PRIMARY_MARKET_PRIORITY: Record<string, number> = {
  match_depth: 0,
  team_total: 1,
};

function selectPrimaryMarket(markets: Market[]): Market | undefined {
  let primary = markets[0];
  let primaryRank = Number.POSITIVE_INFINITY;

  for (const market of markets) {
    const rank = PRIMARY_MARKET_PRIORITY[(market.type ?? "").toLowerCase()] ?? Number.POSITIVE_INFINITY;
    if (rank < primaryRank) {
      primary = market;
      primaryRank = rank;
      if (rank === 0) break;
    }
  }

  return primary;
}

export function MatchScheduleStrip({ matches, selectedMatchId, marketId }: MatchScheduleStripProps) {
  const visible = React.useMemo(() => liveMatchesOnly(matches), [matches]);

  return (
    <section className="shrink-0 border-b border-white/10 bg-[#030817]/82 backdrop-blur-xl flex items-center justify-between">
      <div className="flex items-center gap-2 overflow-x-auto px-3 py-2.5 min-w-0">
        {visible.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/2.5 px-3 py-2 text-[11px] text-on-surface-variant">
            No live matches
          </div>
        ) : (
          visible.map((match) => (
            <MatchCard key={match.id} match={match} selected={match.id === selectedMatchId} />
          ))
        )}
      </div>
      {marketId && (
        <div className="shrink-0 px-3 py-2.5 pl-0">
          <MarketPnLDisplay marketId={marketId} />
        </div>
      )}
    </section>
  );
}

const MatchCard = React.memo(function MatchCard({ match, selected }: { match: Match; selected: boolean }) {
  const router = useRouter();
  const score = scoreParts(match.homeScore);
  const { data: markets = [] } = useMarkets(match.id);

  const handleClick = React.useCallback(() => {
    if (selected) return;

    const primary = selectPrimaryMarket(markets);

    if (primary?.id) {
      router.push(`/trading/${primary.id}`);
    }
  }, [markets, router, selected]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "group grid h-14 min-w-72 shrink-0 grid-cols-[56px_minmax(0,1fr)_24px] items-center gap-3 overflow-hidden rounded-lg border px-3 text-left transition-all duration-300",
        selected
          ? "cursor-default border-cyan-300/35 bg-cyan-300/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_38px_rgba(8,145,178,0.13)]"
          : "cursor-pointer border-white/10 bg-[#071123]/85 hover:border-cyan-300/25 hover:bg-[#0a172c]"
      )}
    >
      <span className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-amber-400/15 px-2.5 text-[10px] font-black uppercase tracking-wide text-amber-200 ring-1 ring-amber-300/20">
        <span className="size-1.5 rounded-full bg-amber-200 shadow-[0_0_10px_rgba(253,230,138,0.9)]" />
        Live
      </span>
      <div className="min-w-0">
        <div className="truncate text-sm font-black leading-tight text-on-surface">{match.title}</div>
        <div className="font-data-tabular text-sm font-black text-teal-300">
          {score.runs}/{score.wickets} - {match.currentOver ?? "0.0"} ov
        </div>
      </div>
      {selected ? (
        <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" aria-hidden />
      ) : (
        <ChevronRight className="h-4 w-4 text-on-surface-variant transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-cyan-200" aria-hidden />
      )}
    </button>
  );
});
