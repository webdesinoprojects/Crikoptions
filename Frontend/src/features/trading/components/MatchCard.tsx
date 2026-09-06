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
import { matchConditionBadge } from "../utils/match-conditions";

function formatMatchTitle(title?: string) {
  if (!title) return null;
  const parts = title.split(' vs ');
  if (parts.length === 1) return <>{title}</>;
  return (
    <>
      <span>{parts[0]}</span>
      <span className="mx-1 text-cyan-400 font-bold italic text-[11px] sm:text-[12px]">vs</span>
      <span>{parts[1]}</span>
    </>
  );
}

function getTeamBgStyle(code: string) {
  switch (code.toUpperCase()) {
    case "CSK":
      return "bg-[#FDB913] text-[#0A192F] font-black border border-amber-300/60 shadow-[0_0_8px_rgba(253,185,19,0.3)]";
    case "MI":
      return "bg-[#004BA0] text-white font-black border border-blue-400/60 shadow-[0_0_8px_rgba(0,75,160,0.3)]";
    case "RCB":
      return "bg-[#EC1C24] text-white font-black border border-red-400/60 shadow-[0_0_8px_rgba(236,28,36,0.3)]";
    case "KKR":
      return "bg-[#3A225D] text-[#FDB913] font-black border border-purple-400/60 shadow-[0_0_8px_rgba(58,34,93,0.3)]";
    case "ENG":
      return "bg-red-600 text-white font-black border border-red-300/60";
    case "AUS":
      return "bg-amber-400 text-green-950 font-black border border-amber-200/60";
    case "GLA":
      return "bg-indigo-600 text-white font-black border border-indigo-300/60";
    case "EDI":
      return "bg-emerald-600 text-white font-black border border-emerald-300/60";
    default:
      return "bg-cyan-950 text-cyan-200 font-bold border border-cyan-400/30";
  }
}

function TeamBadge({
  code,
  name,
  logoUrl,
  isSim,
  isZIndexHigh = false,
}: {
  code: string;
  name: string;
  logoUrl?: string;
  isSim?: boolean;
  isZIndexHigh?: boolean;
}) {
  const [imgError, setImgError] = React.useState(false);
  const isValidRemoteLogo = logoUrl && (logoUrl.startsWith("http://") || logoUrl.startsWith("https://"));

  if (isSim || imgError || !isValidRemoteLogo) {
    return (
      <div
        title={name}
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] shadow-sm tracking-tighter uppercase transition-transform group-hover:scale-105",
          isZIndexHigh ? "z-10" : "z-0",
          getTeamBgStyle(code)
        )}
      >
        {code}
      </div>
    );
  }

  return (
    <div
      title={name}
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#061122] bg-slate-900 text-[9px] shadow-sm",
        isZIndexHigh ? "z-10" : "z-0"
      )}
    >
      <img
        src={logoUrl}
        alt={name}
        onError={() => setImgError(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export const MatchCard = React.memo(function MatchCard({ match, selected }: { match: Match; selected: boolean }) {
  const router = useRouter();
  const score = currentInningsScoreParts(match);
  const battingTeam = battingTeamForMatch(match);
  const battingCode = teamCode(battingTeam?.shortName || battingTeam?.name);
  const isBreak = match.status === "INNINGS_BREAK";
  const upcoming = isUpcomingMatch(match);
  const live = isLiveOrBreak(match);
  const isSim = isSimulatorMatch(match);
  const conditionBadge = matchConditionBadge(match);
  const { data: markets = [] } = useMarkets(match.id);
  const homeTeam = match.homeTeam?.shortName || match.homeTeam?.name || "TBA";
  const awayTeam = match.awayTeam?.shortName || match.awayTeam?.name || "TBA";
  const homeCode = teamCode(homeTeam);
  const awayCode = teamCode(awayTeam);

  const handleClick = React.useCallback(() => {
    if (selected) return;

    const primary = selectPrimaryMarket(markets);
    if (primary?.id) {
      router.push(`/trading/${primary.id}`);
      return;
    }

    router.push(`/trading/match/${match.id}`);
  }, [markets, match.id, router, selected]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "group relative flex min-h-[58px] min-w-[240px] max-w-[340px] shrink-0 items-center justify-between gap-3 overflow-hidden rounded-xl border px-3 py-2 text-left transition-all duration-300 sm:min-h-[64px] sm:min-w-[275px] sm:px-3.5 sm:py-2.5",
        selected
          ? "cursor-default border-cyan-400/40 bg-[#08182b] shadow-[0_4px_20px_rgba(6,182,212,0.15)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:bg-cyan-400 after:shadow-[0_0_10px_rgba(34,211,238,0.9)]"
          : "cursor-pointer border-white/10 bg-[#061122]/90 hover:border-cyan-300/30 hover:bg-[#0a1b32]"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Logos + Badge column */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="flex -space-x-1.5 shrink-0 items-center">
            <TeamBadge
              code={homeCode}
              name={homeTeam}
              logoUrl={match.homeTeam?.logoUrl}
              isSim={isSim}
              isZIndexHigh
            />
            <TeamBadge
              code={awayCode}
              name={awayTeam}
              logoUrl={match.awayTeam?.logoUrl}
              isSim={isSim}
            />
          </div>
          <span
            className={cn(
              "inline-flex h-3.5 items-center justify-center gap-1 rounded px-1.5 text-[8px] font-black uppercase tracking-wider",
              live
                ? isSim
                  ? "bg-purple-900/60 text-purple-200 border border-purple-400/30"
                  : "bg-amber-500/20 text-amber-200 border border-amber-400/30"
                : "bg-cyan-500/15 text-cyan-200 border border-cyan-400/30"
            )}
          >
            {live && !isBreak && (
              <span
                className={cn(
                  "size-1 rounded-full animate-pulse",
                  isSim ? "bg-purple-300 shadow-[0_0_8px_rgba(192,132,252,0.9)]" : "bg-teal-300 shadow-[0_0_8px_rgba(45,212,191,0.9)]"
                )}
              />
            )}
            {isBreak ? "Break" : live ? (isSim ? "• WARM UP" : "Live") : "UPCOMING"}
          </span>
        </div>

        {/* Content column */}
        <div className="min-w-0 flex flex-col justify-center flex-1">
          <div className="truncate text-[12px] font-black leading-snug text-white sm:text-[13px]">
            {formatMatchTitle(match.title)}
          </div>

          {upcoming ? (
            <>
              <div className="mt-0.5 flex items-center gap-1.5 font-data-tabular text-[11px] font-semibold text-slate-300 sm:text-[11.5px]">
                <span>{formatMatchStartTime(match.startTime)}</span>
                {match.format && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span>{match.format}</span>
                  </>
                )}
              </div>
              <div className="mt-0.5 truncate text-[9px] font-medium tracking-tight text-amber-300/80 sm:text-[9.5px]">
                {tradingOpensMessage(match)}
              </div>
            </>
          ) : (
            <>
              <div className="mt-0.5 flex items-center gap-1.5 font-data-tabular text-[12px] font-black text-cyan-300 sm:text-[13px]">
                <span>{battingCode} {score.runs}/{score.wickets} - {match.currentOver ?? "0.0"} ov</span>
                {live && (
                  <span className="size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)] animate-pulse" />
                )}
              </div>
              {conditionBadge && (
                <div className="mt-0.5 truncate text-[9px] font-semibold tracking-wide text-sky-300/85 sm:text-[10px]">
                  {conditionBadge}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right column indicator */}
      {!selected && (
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-cyan-200" aria-hidden />
      )}
    </button>
  );
});
