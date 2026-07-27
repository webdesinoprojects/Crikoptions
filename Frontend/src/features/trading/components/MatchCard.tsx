"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Match } from "@/types";
import { cn } from "@/lib/utils";
import { battingTeamForMatch, currentInningsScoreParts, teamCode } from "../utils/terminal-context";
import { useMarkets } from "../hooks";
import { selectPrimaryMarket } from "../utils/market-helpers";
import {
  formatMatchStartTime,
  isLiveOrBreak,
  isSimulatorMatch,
  isUpcomingMatch,
  tradingOpensMessage,
} from "../utils/home-matches";

function formatMatchTitle(title?: string) {
  if (!title) return null;
  const parts = title.split(' vs ');
  if (parts.length === 1) return <>{title}</>;
  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && <span className="mx-1 text-cyan-400 font-black italic">vs</span>}
        </React.Fragment>
      ))}
    </>
  );
}

export const MatchCard = React.memo(function MatchCard({ match, selected }: { match: Match; selected: boolean }) {
  const router = useRouter();
  const score = currentInningsScoreParts(match);
  const battingTeam = battingTeamForMatch(match);
  const battingCode = teamCode(battingTeam?.shortName || battingTeam?.name);
  const isChase = (match.innings ?? 1) === 2 && (match.targetScore ?? 0) > 0;
  const isBreak = match.status === "INNINGS_BREAK";
  const upcoming = isUpcomingMatch(match);
  const live = isLiveOrBreak(match);
  const isSim = isSimulatorMatch(match);
  const { data: markets = [] } = useMarkets(match.id);

  const handleClick = React.useCallback(() => {
    if (selected) return;

    const primary = selectPrimaryMarket(markets);
    if (primary?.id) {
      router.push(`/trading/${primary.id}`);
      return;
    }

    // Upcoming (or live without market yet): open match preview — no healthy feed required.
    router.push(`/trading/match/${match.id}`);
  }, [markets, match.id, router, selected]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "group grid min-h-[56px] min-w-[220px] shrink-0 grid-cols-[auto_minmax(0,1fr)_20px] items-center gap-2.5 overflow-hidden rounded-lg border py-2.5 px-2.5 text-left transition-all duration-300 sm:min-h-[64px] sm:min-w-72 sm:grid-cols-[auto_minmax(0,1fr)_24px] sm:gap-3.5 sm:py-3 sm:px-3.5",
        selected
          ? "cursor-default border-cyan-300/35 bg-cyan-300/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_38px_rgba(8,145,178,0.13)]"
          : "cursor-pointer border-white/10 bg-[#071123]/85 hover:border-cyan-300/25 hover:bg-[#0a172c]"
      )}
    >
      <span
        className={cn(
          "inline-flex h-8 items-center justify-center gap-1 rounded-md px-2 text-[9px] font-black uppercase tracking-wide ring-1 sm:h-9 sm:gap-1.5 sm:px-2.5 sm:text-[10px]",
          live
            ? isSim
              ? "bg-purple-500/15 text-purple-200 ring-purple-400/30 border border-purple-400/25"
              : "bg-amber-400/15 text-amber-200 ring-amber-300/20"
            : "bg-cyan-400/10 text-cyan-100 ring-cyan-300/20"
        )}
      >
        {live && (
          <span
            className={cn(
              "size-1.5 rounded-full",
              isSim ? "bg-purple-300 shadow-[0_0_10px_rgba(192,132,252,0.9)]" : "bg-amber-200 shadow-[0_0_10px_rgba(253,230,138,0.9)]"
            )}
          />
        )}
        {isBreak ? "Break" : live ? (isSim ? "PRACTICE LIVE" : "Live") : "Upcoming"}
      </span>
      <div className="min-w-0 flex flex-col justify-center">
        <div className="truncate text-[12px] font-black leading-tight text-on-surface sm:text-[13px]">
          {formatMatchTitle(match.title)}
        </div>
        {upcoming ? (
          <>
            <div className="mt-0.5 flex items-center gap-1.5 font-data-tabular text-[11px] font-bold text-cyan-200/85 sm:text-[12px]">
              <span>{formatMatchStartTime(match.startTime)}</span>
              {match.format && (
                <>
                  <span className="text-cyan-500/40">•</span>
                  <span>{match.format}</span>
                </>
              )}
            </div>
            <div className="mt-1 truncate text-[9px] font-semibold tracking-wide text-amber-300/70 sm:text-[10px]">
              {tradingOpensMessage(match)}
            </div>
          </>
        ) : (
          <>
            <div className="mt-0.5 font-data-tabular text-[12px] font-black text-teal-300 sm:text-[13px]">
              {battingCode} {score.runs}/{score.wickets} - {match.currentOver ?? "0.0"} ov
            </div>
            {isBreak && (
              <div className="mt-0.5 truncate font-data-tabular text-[10px] font-semibold text-cyan-100/85 sm:text-[11px]">
                Innings break
              </div>
            )}
            {isChase && (
              <div className="mt-0.5 truncate font-data-tabular text-[10px] font-semibold text-amber-200/90 sm:text-[11px]">
                Target {match.targetScore}
              </div>
            )}
          </>
        )}
      </div>
      {selected ? (
        <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" aria-hidden />
      ) : (
        <ChevronRight className="h-4 w-4 text-on-surface-variant transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-cyan-200" aria-hidden />
      )}
    </button>
  );
});
