"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Market, Match } from "@/types";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { scoreParts } from "../utils/terminal-context";
import { MatchCard } from "./MatchCard";
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
          <ErrorBoundary>
            <MarketPnLDisplay marketId={marketId} />
          </ErrorBoundary>
        </div>
      )}
    </section>
  );
}
