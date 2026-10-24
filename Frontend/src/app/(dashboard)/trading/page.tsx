"use client";

import React from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { FeaturesSectionWithBentoGrid } from "@/components/ui/feature-section-with-bento-grid";
import { useHomeStripMatches } from "@/features/dashboard/hooks";
import { useMarkets } from "@/features/trading/hooks";
import { selectPrimaryMarket } from "@/features/trading/utils/market-helpers";
import { marketListQueryOptions } from "@/features/trading/hooks/useOrderBook";
import { selectAutoOpenMarket } from "@/features/trading/utils/terminal-selection";
import { canTradeMatch } from "@/types/match-trading";
import {
  formatMatchStartTime,
  isLiveOrBreak,
  isUpcomingMatch,
  tradingOpensMessage,
} from "@/features/trading/utils/home-matches";
import type { Match } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function TradingIndexPage() {
  return (
    <React.Suspense fallback={<TradingLoading />}>
      <TradingIndexContent />
    </React.Suspense>
  );
}

function TradingIndexContent() {
  const router = useRouter();
  const fixturesOnly = useSearchParams().get("fixtures") === "1";
  const { data: visible = [], isLoading: matchesLoading } = useHomeStripMatches();
  // Query every eligible live match, rather than letting one closed/blocked
  // fixture prevent selection of another match with an available market.
  // Reuse useMarkets' keys and timing so the card/terminal caches stay shared.
  const candidates = fixturesOnly ? [] : visible.filter(canTradeMatch);
  const marketQueries = useQueries({
    queries: candidates.map((match) => marketListQueryOptions(match.id)),
  });
  const targetMarketId = selectAutoOpenMarket(
    candidates.map((match, index) => ({
      match,
      markets: marketQueries[index]?.isError ? [] : marketQueries[index]?.data ?? [],
    })),
    fixturesOnly
  )?.id;

  React.useEffect(() => {
    if (targetMarketId) router.replace(`/trading/${targetMarketId}`);
  }, [targetMarketId, router]);

  if (matchesLoading || targetMarketId) {
    return <TradingLoading opening={Boolean(targetMarketId)} />;
  }

  if (visible.length === 0) {
    return (
      <main className="noise-overlay relative flex min-h-[calc(100dvh-3.5rem)] flex-grow flex-col overflow-x-hidden bg-[#01040a] p-4 text-on-surface sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.18),transparent_38%),radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.12),transparent_42%)]"
        />
        <FeaturesSectionWithBentoGrid />
      </main>
    );
  }

  return (
    <main className="noise-overlay relative flex min-h-[calc(100dvh-3.5rem)] flex-grow flex-col overflow-hidden bg-[#01040a] p-4 text-on-surface sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.18),transparent_38%),radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.12),transparent_42%)]"
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-black text-white sm:text-2xl">Choose a match</h1>
            <p className="text-sm font-semibold text-on-surface-variant">
              Select a live match, view an innings break, or preview an upcoming fixture.
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {visible.map((match) => (
            <UpcomingFixtureCard key={match.id} match={match} />
          ))}
        </div>
      </section>
    </main>
  );
}

function UpcomingFixtureCard({ match }: { match: Match }) {
  const router = useRouter();
  const { data: markets = [] } = useMarkets(match.id);
  const primary = selectPrimaryMarket(markets);
  const upcoming = isUpcomingMatch(match);
  const live = isLiveOrBreak(match);

  const open = () => {
    if (primary?.id) {
      router.push(`/trading/${primary.id}`);
      return;
    }
    router.push(`/trading/match/${match.id}`);
  };

  return (
    <button
      type="button"
      onClick={open}
      className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#071327]/95 p-4 text-left shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition hover:border-cyan-300/25 hover:bg-[#0a172c]"
    >
      <span
        className={cn(
          "inline-flex h-9 shrink-0 items-center justify-center rounded-md px-2.5 text-[10px] font-black uppercase tracking-wide ring-1",
          live
            ? "bg-amber-400/15 text-amber-200 ring-amber-300/20"
            : "bg-cyan-400/12 text-cyan-100 ring-cyan-300/20"
        )}
      >
        {live ? (match.status === "INNINGS_BREAK" ? "Break" : "Live") : "Upcoming"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-black text-white sm:text-base">{match.title}</div>
        <div className="mt-0.5 font-data-tabular text-xs font-semibold text-on-surface-variant">
          {upcoming
            ? `${formatMatchStartTime(match.startTime)}${match.format ? ` · ${match.format}` : ""}`
            : `${match.currentOver ?? "0.0"} ov`}
        </div>
        {upcoming && (
          <div className="mt-1 text-[11px] font-semibold text-amber-200/90">{tradingOpensMessage(match)}</div>
        )}
      </div>
    </button>
  );
}

function TradingShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="noise-overlay relative flex min-h-[calc(100dvh-3.5rem)] flex-grow items-center justify-center overflow-hidden bg-[#01040a] p-6 text-on-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.18),transparent_38%),radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.12),transparent_42%)]"
      />
      <section className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-[#071327]/95 p-6 text-center shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
        {children}
      </section>
    </main>
  );
}

function TradingLoading({ opening = false }: { opening?: boolean }) {
  return (
    <TradingShell>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-black text-white">
        {opening ? "Opening live terminal" : "Loading matches"}
      </h1>
      <p className="mt-3 text-sm font-semibold leading-6 text-on-surface-variant">
        Checking live and upcoming matches...
      </p>
    </TradingShell>
  );
}
