"use client";

import React from "react";
import { BackendMarket } from "@/lib/adapters/market.adapter";
import { Match } from "@/types";
import { projectedRange, scoreParts } from "../utils/terminal-context";

interface MatchProjectionsPanelProps {
  match?: Match;
  market?: BackendMarket;
}

export function MatchProjectionsPanel({ match, market }: MatchProjectionsPanelProps) {
  const score = scoreParts(match?.homeScore);
  const parsedRuns = Number.parseInt(score.runs, 10);
  const currentScore = match?.currentScore ?? (Number.isFinite(parsedRuns) ? parsedRuns : 0);
  const totalBalls = totalBallsForFormat(match?.format);
  const ballsLeft = Math.max(0, Math.min(totalBalls, match?.ballsLeft ?? totalBalls));
  const ballsBowled = totalBalls - ballsLeft;
  const crr = ballsBowled > 0 ? currentScore / (ballsBowled / 6) : 0;
  const projected = currentScore > 0 && crr > 0 ? Math.round(currentScore + crr * (ballsLeft / 6)) : Math.round(market?.ltp ?? 0);

  return (
    <section className="flex h-[210px] flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
      <h2 className="text-sm font-black text-on-surface">Match Projections</h2>
      <div className="mt-4 grid gap-3">
        <ProjectionMetric label="Current Run Rate" value={crr.toFixed(2)} kind="line" />
        <ProjectionMetric label="Proj. Total" value={projectedRange(projected)} kind="bars" accent />
      </div>
    </section>
  );
}

function ProjectionMetric({
  accent,
  kind,
  label,
  value,
}: {
  accent?: boolean;
  kind: "line" | "bars";
  label: string;
  value: string;
}) {
  return (
    <div className="flex h-16 items-center justify-between rounded-md border border-outline-variant bg-surface px-3">
      <div>
        <div className="text-[11px] font-semibold text-on-surface-variant">{label}</div>
        <div className={`mt-1 font-data-tabular text-lg font-black ${accent ? "text-cyan-300" : "text-on-surface"}`}>{value}</div>
      </div>
      {kind === "line" ? <MiniLine /> : <MiniBars />}
    </div>
  );
}

function MiniLine() {
  return (
    <svg className="h-8 w-24 text-cyan-300/70" viewBox="0 0 96 32" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 24 L18 18 L34 22 L50 10 L66 14 L82 6 L96 2" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function MiniBars() {
  return (
    <div className="flex h-8 items-end gap-1">
      {[14, 22, 30, 24, 16].map((height, index) => (
        <span
          key={height + index}
          className={`w-2 rounded-t ${index === 2 || index === 3 ? "bg-cyan-400/70" : "bg-slate-500/35"}`}
          style={{ height }}
        />
      ))}
    </div>
  );
}

function totalBallsForFormat(format?: string) {
  const upper = (format ?? "T20").toUpperCase();
  return upper.includes("ODI") || upper.includes("ONE") ? 300 : 120;
}
