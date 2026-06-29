"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Match } from "@/types";
import { cn } from "@/lib/utils";
import { scoreParts } from "../utils/terminal-context";
import { useMarkets } from "../hooks";
import { selectPrimaryMarket } from "../utils/market-helpers";

export const MatchCard = React.memo(function MatchCard({ match, selected }: { match: Match; selected: boolean }) {
  const router = useRouter();
  const score = scoreParts(match.homeScore);
  const { data: markets = [] } = useMarkets(match.id);

  const handleClick = React.useCallback(() => {
    if (selected) return;

    const primary = selectPrimaryMarket(markets);

    if (primary?.id) {
      router.push(`/trading/${primary.id}`);
    }
  }, [markets, router, selected]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-current={selected ? "page" : undefined}
      className={cn(
        "group grid h-[52px] min-w-[220px] shrink-0 grid-cols-[48px_minmax(0,1fr)_20px] items-center gap-2 overflow-hidden rounded-lg border px-2.5 text-left transition-all duration-300 sm:h-14 sm:min-w-72 sm:grid-cols-[56px_minmax(0,1fr)_24px] sm:gap-3 sm:px-3",
        selected
          ? "cursor-default border-cyan-300/35 bg-cyan-300/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_38px_rgba(8,145,178,0.13)]"
          : "cursor-pointer border-white/10 bg-[#071123]/85 hover:border-cyan-300/25 hover:bg-[#0a172c]"
      )}
    >
      <span className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-amber-400/15 px-2 text-[9px] font-black uppercase tracking-wide text-amber-200 ring-1 ring-amber-300/20 sm:h-9 sm:gap-1.5 sm:px-2.5 sm:text-[10px]">
        <span className="size-1.5 rounded-full bg-amber-200 shadow-[0_0_10px_rgba(253,230,138,0.9)]" />
        Live
      </span>
      <div className="min-w-0">
        <div className="truncate text-[12px] font-black leading-tight text-on-surface sm:text-sm">{match.title}</div>
        <div className="font-data-tabular text-[12px] font-black text-teal-300 sm:text-sm">
          {score.runs}/{score.wickets} - {match.currentOver ?? "0.0"} ov
        </div>
      </div>
      {selected ? (
        <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" aria-hidden />
      ) : (
        <ChevronRight className="h-4 w-4 text-on-surface-variant transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-cyan-200" aria-hidden />
      )}
    </button>
  );
});
