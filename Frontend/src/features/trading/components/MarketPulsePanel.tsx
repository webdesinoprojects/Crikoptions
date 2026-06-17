"use client";

import React from "react";
import { DataSourceBadge } from "@/components/shared/DataSourceBadge";
import { BackendMarket } from "@/lib/adapters/market.adapter";
import { Match } from "@/types";
import { scoreParts } from "../utils/terminal-context";

interface MarketPulsePanelProps {
  match?: Match;
  market?: BackendMarket;
}

export function MarketPulsePanel({ match, market }: MarketPulsePanelProps) {
  const score = scoreParts(match?.homeScore);
  const title = market?.title || `Match Win - ${match?.title ?? "Live Match"}`;

  return (
    <section className="flex h-[150px] flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-black text-on-surface">{title}</h2>
          <p className="mt-1 text-[11px] text-on-surface-variant">
            {match?.status ?? "LIVE"} - {match?.title ?? "Match"} - {score.runs}/{score.wickets} ({match?.currentOver ?? "0.0"} ov)
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded bg-surface-container-high px-2 py-1 text-[11px] font-bold text-on-surface-variant">
            {match?.format ?? "T20"}
          </span>
          <DataSourceBadge source="api" />
        </div>
      </div>

      <div className="mx-4 mb-3 flex-1 overflow-hidden rounded border border-outline-variant bg-surface/70">
        <svg className="h-full w-full" viewBox="0 0 600 110" preserveAspectRatio="none" role="img" aria-label="Market pulse">
          <defs>
            <linearGradient id="pulseFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          <path
            d="M0 84 C80 78 128 72 195 72 C260 72 300 86 345 58 C374 40 420 34 480 56 C532 75 566 88 600 36 L600 110 L0 110 Z"
            fill="url(#pulseFill)"
          />
          <path
            d="M0 84 C80 78 128 72 195 72 C260 72 300 86 345 58 C374 40 420 34 480 56 C532 75 566 88 600 36"
            fill="none"
            stroke="#22d3ee"
            strokeLinecap="round"
            strokeWidth="4"
          />
        </svg>
      </div>
    </section>
  );
}
