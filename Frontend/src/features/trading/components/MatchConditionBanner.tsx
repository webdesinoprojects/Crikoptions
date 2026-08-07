"use client";

import React from "react";
import { CloudRain, OctagonAlert } from "lucide-react";
import type { Match } from "@/types";
import { matchConditionNotice } from "@/features/trading/utils/match-conditions";

interface MatchConditionBannerProps {
  match?: Match | null;
  className?: string;
}

/**
 * Explains a weather delay, a shortened match or a revised target. Without it a
 * live-but-untradable fixture reads as broken rather than rain-affected.
 */
export function MatchConditionBanner({ match, className = "" }: MatchConditionBannerProps) {
  const notice = matchConditionNotice(match);
  if (!notice) return null;

  const critical = notice.tone === "critical";
  const Icon = critical ? OctagonAlert : CloudRain;
  const palette = critical
    ? "border-rose-300/25 bg-rose-400/10 text-rose-100"
    : "border-sky-300/25 bg-sky-400/10 text-sky-100";

  return (
    <div
      role="status"
      className={`rounded-xl border px-4 py-3 ${palette} ${className}`.trim()}
    >
      <div className="flex items-start gap-2.5">
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-black">{notice.title}</p>
          <p className="mt-0.5 text-xs font-semibold text-white/70">{notice.detail}</p>
        </div>
      </div>
    </div>
  );
}
