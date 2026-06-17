"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Match } from "@/types";
import { cn } from "@/lib/utils";
import { scoreParts } from "../utils/terminal-context";
import { useMarkets } from "../hooks";

interface MatchScheduleStripProps {
  matches: Match[];
  selectedMatchId?: string;
}

// The strip enforces a single-LIVE-at-a-time rule:
// - Among all matches, only the one with the earliest `startTime` that is LIVE is treated as the TRUE live match.
// - If multiple matches have status LIVE (data inconsistency), the first one (by startTime) wins.
// - Other "LIVE" matches are displayed as "ACTIVE" to avoid confusing the user.
function normalizeLiveMatches(matches: Match[]): Array<Match & { displayStatus: string }> {
  let liveClaimed = false;
  const sorted = [...matches].sort((a, b) => {
    const pa = statusPriority(a.status);
    const pb = statusPriority(b.status);
    if (pa !== pb) return pa - pb;
    return new Date(a.startTime ?? 0).getTime() - new Date(b.startTime ?? 0).getTime();
  });

  return sorted.map((match) => {
    const isLive = match.status?.toUpperCase() === "LIVE";
    if (isLive && !liveClaimed) {
      liveClaimed = true;
      return { ...match, displayStatus: "LIVE" };
    }
    if (isLive && liveClaimed) {
      // Second+ LIVE match — downgrade to "ACTIVE" in the UI
      return { ...match, displayStatus: "ACTIVE" };
    }
    return { ...match, displayStatus: match.status ?? "UPCOMING" };
  });
}

function statusPriority(status?: string) {
  const s = (status ?? "").toLowerCase();
  if (s === "live") return 0;
  if (s === "upcoming") return 1;
  return 2;
}

export function MatchScheduleStrip({ matches, selectedMatchId }: MatchScheduleStripProps) {
  const normalized = React.useMemo(() => normalizeLiveMatches(matches), [matches]);
  const visible = normalized.slice(0, 5);

  return (
    <section className="shrink-0 border-b border-outline-variant bg-surface-container-lowest">
      <div className="flex items-center gap-2 overflow-x-auto px-3 py-2">
        {visible.length === 0 ? (
          <div className="rounded-md border border-outline-variant bg-surface px-3 py-2 text-[11px] text-on-surface-variant">
            No upcoming matches
          </div>
        ) : (
          visible.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              displayStatus={match.displayStatus}
              selected={match.id === selectedMatchId}
            />
          ))
        )}
      </div>
    </section>
  );
}

function MatchCard({
  match,
  displayStatus,
  selected,
}: {
  match: Match;
  displayStatus: string;
  selected: boolean;
}) {
  const router = useRouter();
  const isLive = displayStatus === "LIVE";
  const score = scoreParts(match.homeScore);
  const label = isLive ? "LIVE" : displayStatus === "ACTIVE" ? "ACTIVE" : formatStartLabel(match.startTime);
  const { data: markets = [] } = useMarkets(match.id);

  const handleClick = () => {
    if (selected) return;
    // Pick the primary market for this match
    const primary =
      markets.find((m) => (m.type ?? "").toLowerCase() === "match_depth") ??
      markets.find((m) => (m.type ?? "").toLowerCase() === "team_total") ??
      markets[0];
    if (primary?.id) {
      router.push(`/trading/${primary.id}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "grid h-12 min-w-[200px] shrink-0 grid-cols-[44px_minmax(0,1fr)] items-center gap-2 rounded-md border bg-surface px-2.5 text-left transition-colors",
        selected
          ? "border-teal-400/35 bg-teal-400/8"
          : "border-outline-variant hover:border-outline hover:bg-surface-container cursor-pointer"
      )}
    >
      <span
        className={cn(
          "inline-flex h-6 items-center justify-center rounded px-2 text-[10px] font-black uppercase tracking-wide",
          isLive
            ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/25 animate-pulse"
            : displayStatus === "ACTIVE"
            ? "bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/25"
            : "bg-primary/15 text-primary"
        )}
      >
        {label}
      </span>
      <div className="min-w-0">
        <div className="truncate text-[12px] font-bold text-on-surface">{match.title}</div>
        {isLive ? (
          <div className="font-data-tabular text-[12px] font-bold text-teal-300">
            {score.runs}/{score.wickets} - {match.currentOver ?? "0.0"} ov
          </div>
        ) : (
          <div className="truncate text-[11px] text-on-surface-variant">
            {match.format ?? "T20"} -{" "}
            {match.startTime
              ? new Date(match.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "TBD"}
          </div>
        )}
      </div>
    </button>
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
  if (diffDays === 0) return start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Tomorrow";
  return start.toLocaleDateString([], { month: "short", day: "numeric" });
}
