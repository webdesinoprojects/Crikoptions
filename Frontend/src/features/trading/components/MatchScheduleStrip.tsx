"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Match } from "@/types";
import { cn } from "@/lib/utils";
import { scoreParts } from "../utils/terminal-context";
import { pickPrimaryMarket } from "../utils/market-select";
import { useMarkets } from "../hooks";

interface MatchScheduleStripProps {
  matches: Match[];
  selectedMatchId?: string;
}

function liveMatchesOnly(matches: Match[]): Match[] {
  return matches
    .filter((match) => match.status?.toUpperCase() === "LIVE")
    .sort((a, b) => new Date(a.startTime ?? 0).getTime() - new Date(b.startTime ?? 0).getTime());
}

export function MatchScheduleStrip({ matches, selectedMatchId }: MatchScheduleStripProps) {
  const visible = React.useMemo(() => liveMatchesOnly(matches), [matches]);

  return (
    <section className="shrink-0 border-b border-outline-variant bg-surface-container-lowest">
      <div className="flex items-center gap-3 overflow-x-auto px-4 py-3">
        {visible.length === 0 ? (
          <div className="rounded-md border border-outline-variant bg-surface px-3 py-2 text-[11px] text-on-surface-variant">
            No live matches
          </div>
        ) : (
          visible.map((match) => (
            <MatchCard key={match.id} match={match} selected={match.id === selectedMatchId} />
          ))
        )}
      </div>
    </section>
  );
}

function MatchCard({ match, selected }: { match: Match; selected: boolean }) {
  const router = useRouter();
  const score = scoreParts(match.homeScore);
  const { data: markets = [] } = useMarkets(match.id);

  const handleClick = () => {
    if (selected) return;

    const primary = pickPrimaryMarket(markets);
    if (primary?.id) {
      router.push(`/trading/${primary.id}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "grid h-16 min-w-[300px] shrink-0 grid-cols-[58px_minmax(0,1fr)_22px] items-center gap-3 rounded-lg border bg-surface px-3 text-left shadow-[0_12px_32px_rgba(0,0,0,0.18)] transition-colors",
        selected
          ? "cursor-default border-teal-400/35 bg-teal-400/8"
          : "cursor-pointer border-outline-variant hover:border-outline hover:bg-surface-container"
      )}
    >
      <span className="inline-flex h-10 items-center justify-center rounded-md bg-amber-500/20 px-3 text-[11px] font-black uppercase tracking-wide text-amber-200 ring-1 ring-amber-500/25">
        LIVE
      </span>
      <div className="min-w-0">
        <div className="truncate text-sm font-black text-on-surface">{match.title}</div>
        <div className="font-data-tabular text-sm font-black text-teal-300">
          {score.runs}/{score.wickets} - {match.currentOver ?? "0.0"} ov
        </div>
      </div>
      {!selected && <ChevronRight className="h-4 w-4 text-on-surface-variant" aria-hidden />}
    </button>
  );
}
