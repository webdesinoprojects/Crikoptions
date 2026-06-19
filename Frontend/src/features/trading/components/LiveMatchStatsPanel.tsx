"use client";

import React from "react";
import { BackendMarket } from "@/lib/adapters/market.adapter";
import { cn } from "@/lib/utils";
import { Match } from "@/types";
import { useThisOverBalls } from "../hooks/useThisOverBalls";
import { BallEvent, ballClassName, scoreParts } from "../utils/terminal-context";

interface LiveMatchStatsPanelProps {
  match?: Match;
  market?: BackendMarket;
  className?: string;
}

export function LiveMatchStatsPanel({ match, market, className }: LiveMatchStatsPanelProps) {
  const score = scoreParts(match?.homeScore);
  const parsedRuns = Number.parseInt(score.runs, 10);
  const currentScore = match?.currentScore ?? (Number.isFinite(parsedRuns) ? parsedRuns : 0);
  const totalBalls = totalBallsForFormat(match?.format);
  const ballsLeft = Math.max(0, Math.min(totalBalls, match?.ballsLeft ?? totalBalls));
  const ballsBowled = totalBalls - ballsLeft;
  const overs = match?.currentOver ?? oversTextFromBalls(ballsBowled);
  const crr = ballsBowled > 0 ? currentScore / (ballsBowled / 6) : 0;
  const projected = projectedFinal(currentScore, ballsLeft, crr, market);
  const balls = useThisOverBalls(match);
  const compactThisOver = balls.length > 6;

  return (
    <aside
      className={cn(
        "relative flex h-[390px] min-h-[340px] flex-col overflow-hidden rounded-xl border border-cyan-300/12 bg-[#040a17]/92 shadow-[0_20px_70px_rgba(0,0,0,0.34)] backdrop-blur-xl",
        className
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/55 to-transparent" />
      <div className="relative flex items-center justify-between border-b border-white/8 bg-[#071124]/92 px-3 py-2.5">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-wide",
            match?.status === "LIVE" ? "bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/20" : "bg-primary/15 text-primary"
          )}
        >
          {match?.status === "LIVE" && <span className="size-1.5 rounded-full bg-amber-200 shadow-[0_0_10px_rgba(253,230,138,0.9)]" />}
          {match?.status ?? "LIVE"}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-on-surface-variant">
          {match?.format ?? "T20"} - {ordinal(match?.innings ?? 1)} innings
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <section className="border-b border-white/8 p-3.5">
          <div className="grid grid-cols-[1fr_36px_1fr] items-center gap-2 text-center">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-cyan-100/65">
                {match?.homeTeam.shortName ?? "Team A"}
              </div>
              <div className="mt-1 font-data-tabular text-3xl font-black text-teal-200">
                {score.runs}
                <span className="text-sm text-on-surface-variant">/{score.wickets}</span>
              </div>
              <div className="mt-0.5 text-[11px] text-on-surface-variant">{overs} overs</div>
            </div>
            <div className="text-[11px] uppercase text-on-surface-variant">vs</div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-cyan-100/65">
                {match?.awayTeam.shortName ?? "Team B"}
              </div>
              <div className="mt-1 font-data-tabular text-3xl font-black text-on-surface-variant">-</div>
              <div className="mt-0.5 text-[11px] text-on-surface-variant">bat {match?.innings === 2 ? "2nd" : "1st"}</div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <StatBox label="CRR" value={crr.toFixed(2)} />
            <StatBox label="Projected" value={String(projected)} tone="teal" />
          </div>
        </section>

        <section className="border-b border-white/8 p-3.5">
          <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-cyan-100/60">This over</div>
          <div
            className={cn(
              "w-full",
              compactThisOver ? "grid grid-cols-6 gap-1.5" : "flex items-center justify-between gap-2"
            )}
          >
            {balls.map((ball, index) => (
              <span
                key={`${ball.kind}-${ball.label}-${index}`}
                aria-label={ball.kind === "empty" ? `Ball ${index + 1}: not yet bowled` : `Ball ${index + 1}: ${ball.detail ?? ball.label}`}
                title={ball.detail ?? ball.label}
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-full border font-data-tabular font-black",
                  compactThisOver ? "h-6 min-w-6 justify-self-center px-1 text-[8px]" : "h-8 min-w-8 px-1.5 text-[10px]",
                  ballClassName(ball.kind)
                )}
              >
                {ball.label}
              </span>
            ))}
          </div>
        </section>

        <OnFieldPanel balls={balls} match={match} />
      </div>
    </aside>
  );
}

function OnFieldPanel({ balls, match }: { balls: BallEvent[]; match?: Match }) {
  const lastWicket = [...balls].reverse().find((ball) =>
    ["wicket", "bowled", "lbw", "caught", "runOut"].includes(ball.kind)
  );
  const battingSide = match?.innings === 2 ? match?.awayTeam.shortName : match?.homeTeam.shortName;

  return (
    <section className="p-3.5">
      <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-cyan-100/60">On field</div>
      <div className="grid gap-2 text-[12px]">
        <ContextRow label="Striker" value="On strike" />
        <ContextRow label="Bowler" value="Current over" />
        <ContextRow label="Last wicket" value={lastWicket?.detail ?? "No wicket this over"} />
        <ContextRow label="Top performer" value={battingSide ? `${battingSide} run pace` : "Batting side"} />
      </div>
    </section>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-white/8 bg-[#071327]/78 px-2.5 py-2">
      <span className="text-on-surface-variant">{label}</span>
      <span className="truncate text-right font-semibold text-on-surface">{value}</span>
    </div>
  );
}

function StatBox({ label, tone, value }: { label: string; tone?: "teal"; value: string }) {
  return (
    <div className="rounded-lg border border-white/8 bg-[#08152b]/88 p-2.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="text-[10px] uppercase tracking-wide text-cyan-100/60">{label}</div>
      <div className={cn("mt-0.5 font-data-tabular text-base font-black", tone === "teal" ? "text-teal-300" : "text-on-surface")}>
        {value}
      </div>
    </div>
  );
}

function projectedFinal(currentScore: number, ballsLeft: number, crr: number, market?: BackendMarket) {
  if (currentScore === 0 && market?.ltp) return Math.round(market.ltp);
  if (crr <= 0) return currentScore;
  return Math.max(currentScore, Math.round(currentScore + crr * (ballsLeft / 6)));
}

function totalBallsForFormat(format?: string) {
  const upper = (format ?? "T20").toUpperCase();
  return upper.includes("ODI") || upper.includes("ONE") ? 300 : 120;
}

function oversTextFromBalls(balls: number) {
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

function ordinal(value: number) {
  if (value === 1) return "1st";
  if (value === 2) return "2nd";
  if (value === 3) return "3rd";
  return `${value}th`;
}
