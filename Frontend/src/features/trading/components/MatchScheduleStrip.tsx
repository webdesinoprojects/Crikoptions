"use client";

import React from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useHomeStripMatches } from "@/features/dashboard/hooks";
import { ExitAllPositionsButton } from "./ExitAllPositionsButton";
import { MatchCard } from "./MatchCard";
import { TodayPnLDisplay } from "./TodayPnLDisplay";

interface MatchScheduleStripProps {
  selectedMatchId?: string;
}

export function MatchScheduleStrip({ selectedMatchId }: MatchScheduleStripProps) {
  const { data: visible = [] } = useHomeStripMatches();

  return (
    <section className="flex shrink-0 flex-col border-b border-white/10 bg-[#030817]/82 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto px-2 py-2 sm:px-3 lg:py-2.5">
        {visible.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/2.5 px-3 py-2 text-[11px] text-on-surface-variant">
            No upcoming matches in the home feed
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
