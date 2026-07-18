"use client";

import React from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { LiveMatchStatsPanel, MatchScheduleStrip } from "@/features/trading/components";
import { useLiveMatches, useMatchDetails } from "@/features/dashboard/hooks";
import { useMarkets } from "@/features/trading/hooks";
import { selectPrimaryMarket } from "@/features/trading/utils/market-helpers";
import {
  formatMatchStartTime,
  isLiveOrBreak,
  tradingOpensMessage,
} from "@/features/trading/utils/home-matches";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ matchId: string }>;
}

export default function UpcomingMatchPreviewPage({ params }: PageProps) {
  const { matchId } = React.use(params);
  const router = useRouter();
  const { data: match, isLoading } = useMatchDetails(matchId);
  const { data: matches = [] } = useLiveMatches();
  const { data: markets = [] } = useMarkets(matchId);
  const primaryMarketId = selectPrimaryMarket(markets)?.id;

  React.useEffect(() => {
    if (match && isLiveOrBreak(match) && primaryMarketId) {
      router.replace(`/trading/${primaryMarketId}`);
    }
  }, [match, primaryMarketId, router]);

  return (
    <div className="noise-overlay relative flex min-h-[calc(100dvh-3.5rem)] flex-grow flex-col overflow-x-hidden bg-[#01040a] text-on-surface lg:h-full lg:min-h-0 lg:overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.15),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.1),transparent_40%)]"
      />

      <div className="relative z-10">
        <MatchScheduleStrip matches={matches} selectedMatchId={match?.id ?? matchId} />
      </div>

      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto p-3 lg:overflow-hidden">
        <div className="mb-3 rounded-xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100">
          <div className="flex flex-wrap items-center gap-2">
            <CalendarClock className="size-4 shrink-0" />
            <span>{tradingOpensMessage(match)}</span>
            {match?.startTime && (
              <span className="font-data-tabular text-amber-50/90">
                · Starts {formatMatchStartTime(match.startTime)}
                {match.format ? ` · ${match.format}` : ""}
              </span>
            )}
          </div>
        </div>

        {isLoading || !match ? (
          <div className="rounded-2xl border border-white/10 bg-[#071327]/90 p-8 text-center text-sm font-semibold text-on-surface-variant">
            Loading match preview...
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-[minmax(0,420px)_1fr]">
            <LiveMatchStatsPanel match={match} />
            <section className="rounded-2xl border border-white/10 bg-[#071327]/90 p-5">
              <h1 className="font-display text-2xl font-black text-white">{match.title}</h1>
              <p className="mt-2 text-sm font-semibold text-on-surface-variant">
                Preview mode — markets and order entry unlock when this fixture goes live.
              </p>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg border border-white/8 bg-white/3 px-3 py-2">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</dt>
                  <dd className="mt-1 font-black text-cyan-100">{match.status}</dd>
                </div>
                <div className="rounded-lg border border-white/8 bg-white/3 px-3 py-2">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Starts</dt>
                  <dd className="mt-1 font-data-tabular font-black text-slate-100">
                    {formatMatchStartTime(match.startTime)}
                  </dd>
                </div>
                <div className="rounded-lg border border-white/8 bg-white/3 px-3 py-2">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Format</dt>
                  <dd className="mt-1 font-black text-slate-100">{match.format ?? "T20"}</dd>
                </div>
                <div className="rounded-lg border border-white/8 bg-white/3 px-3 py-2">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trading</dt>
                  <dd className="mt-1 font-black text-amber-200">Blocked until live</dd>
                </div>
              </dl>
              <div className="mt-5">
                <Link
                  href="/trading"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-4 text-sm font-black text-cyan-100 hover:bg-cyan-300/15"
                >
                  All fixtures
                </Link>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
