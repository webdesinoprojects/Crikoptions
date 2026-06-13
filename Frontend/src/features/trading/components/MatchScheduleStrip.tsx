"use client";

import React from "react";
import { Match } from "@/types";
import { cn } from "@/lib/utils";
import { scoreParts } from "../utils/terminal-context";

interface MatchScheduleStripProps {
  matches: Match[];
  selectedMatchId?: string;
}

export function MatchScheduleStrip({ matches, selectedMatchId }: MatchScheduleStripProps) {
  const visibleMatches = matches.slice(0, 4);

  return (
    <section className="shrink-0 border-b border-outline-variant bg-surface-container-lowest">
      <div className="flex items-center gap-2 overflow-x-auto px-3 py-2">
        {visibleMatches.length === 0 ? (
          <div className="rounded-md border border-outline-variant bg-surface px-3 py-2 text-[11px] text-on-surface-variant">
            No upcoming matches
          </div>
        ) : (
          visibleMatches.map((match) => (
            <MatchCard key={match.id} match={match} selected={match.id === selectedMatchId} />
          ))
        )}

        <button
          type="button"
          className="ml-auto hidden h-10 shrink-0 items-center gap-2 rounded-md border border-outline-variant bg-surface px-4 text-[11px] font-semibold text-on-surface-variant transition-colors hover:text-on-surface lg:flex"
        >
          Add match
        </button>
      </div>
    </section>
  );
}

function MatchCard({ match, selected }: { match: Match; selected: boolean }) {
  const score = scoreParts(match.homeScore);
  const live = match.status === "LIVE";
  const label = live ? "LIVE" : formatStartLabel(match.startTime);

  return (
    <div
      className={cn(
        "grid h-12 min-w-[190px] shrink-0 grid-cols-[44px_minmax(0,1fr)] items-center gap-2 rounded-md border bg-surface px-2.5 text-left",
        selected ? "border-teal-400/35 bg-teal-400/8" : "border-outline-variant"
      )}
    >
      <span
        className={cn(
          "inline-flex h-6 items-center justify-center rounded px-2 text-[10px] font-black uppercase tracking-wide",
          live ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/25" : "bg-primary/15 text-primary"
        )}
      >
        {label}
      </span>
      <div className="min-w-0">
        <div className="truncate text-[12px] font-bold text-on-surface">{match.title}</div>
        {live ? (
          <div className="font-data-tabular text-[12px] font-bold text-teal-300">
            {score.runs}/{score.wickets} - {match.currentOver ?? "0.0"} ov
          </div>
        ) : (
          <div className="truncate text-[11px] text-on-surface-variant">
            {match.format ?? "T20"} - {new Date(match.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatStartLabel(value: string) {
  if (!value) return "Soon";

  const start = new Date(value);
  if (Number.isNaN(start.getTime())) return "Soon";

  const now = new Date();
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.round((startDay - today) / 86_400_000);

  if (diffDays === 0) {
    return start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Tomorrow";
  return start.toLocaleDateString([], { month: "short", day: "numeric" });
}
