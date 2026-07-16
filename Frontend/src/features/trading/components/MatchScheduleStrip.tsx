"use client";

import React from "react";
import type { Match } from "@/types";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ExitAllPositionsButton } from "./ExitAllPositionsButton";
import { MatchCard } from "./MatchCard";
import { TodayPnLDisplay } from "./TodayPnLDisplay";

interface MatchScheduleStripProps {
  matches: Match[];
  selectedMatchId?: string;
}

function liveMatchesOnly(matches: Match[]): Match[] {
  return matches
    .filter((match) => isLiveOrBreak(match))
    .sort((a, b) => new Date(a.startTime ?? 0).getTime() - new Date(b.startTime ?? 0).getTime());
}

function isLiveOrBreak(match: Match): boolean {
  const status = match.status?.toUpperCase();
  return status === "LIVE" || status === "INNINGS_BREAK";
}

export function MatchScheduleStrip({ matches, selectedMatchId }: MatchScheduleStripProps) {
  const visible = React.useMemo(() => liveMatchesOnly(matches), [matches]);

  return (
    <section className="flex shrink-0 flex-col border-b border-white/10 bg-[#030817]/82 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto px-2 py-2 sm:px-3 lg:py-2.5">
        {visible.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/2.5 px-3 py-2 text-[11px] text-on-surface-variant">
            No live or innings-break matches
          </div>
        ) : (
          visible.map((match) => (
            <MatchCard key={match.id} match={match} selected={match.id === selectedMatchId} />
          ))
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2 px-3 py-2.5 pl-0">
        <ErrorBoundary>
          <TodayPnLDisplay />
        </ErrorBoundary>
        <ErrorBoundary>
          <ExitAllPositionsButton />
        </ErrorBoundary>
      </div>
    </section>
  );
}
