"use client";

import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRouter } from "next/navigation";
import {
  LiveMatchStatsPanel,
  MatchScheduleStrip,
  OptionChain,
  OrderEntryForm,
  TradingActivityPanel,
} from "@/features/trading/components";
import { useMarketDetail, useMarkets, useMatchScoreStream } from "@/features/trading/hooks";
import { useLiveMatches, useMatchDetails } from "@/features/dashboard/hooks";

interface PageProps {
  params: Promise<{ marketId: string }>;
}

export default function TradingTerminalPage({ params }: PageProps) {
  const router = useRouter();
  const terminalRef = React.useRef<HTMLDivElement>(null);
  const { marketId } = React.use(params);
  const { data: market, isLoading } = useMarketDetail(marketId);
  const matchId = market?.matchId ?? "";
  const { data: match } = useMatchDetails(matchId);
  useMatchScoreStream(matchId);
  const { data: matches = [] } = useLiveMatches();

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.fromTo(
        "[data-terminal-panel]",
        { opacity: 0, y: 14, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.055,
        }
      );
    },
    { scope: terminalRef, dependencies: [marketId] }
  );

  // Remove blocking loading state to allow the UI mockup to render even if the backend is down
  // if (isLoading) {
  //   return (
  //     <div className="h-screen w-full flex items-center justify-center bg-background text-on-surface">
  //       <div className="text-sm font-semibold animate-pulse text-outline">Loading trading terminal...</div>
  //     </div>
  //   );
  // }

  return (
    <div
      ref={terminalRef}
      className="relative flex h-full flex-grow flex-col overflow-hidden bg-[#020511] text-on-surface"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(14,165,233,0.16),transparent_34%),radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.08),transparent_32%),linear-gradient(180deg,#020511_0%,#030712_44%,#01030a_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.035)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30"
      />

      <div className="relative z-10" data-terminal-panel>
        <MatchScheduleStrip matches={matches} selectedMatchId={matchId} />
      </div>

      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
        <div className="grid min-h-full grid-cols-1 gap-3 p-3 lg:h-full lg:min-h-0 lg:grid-cols-[320px_minmax(0,1fr)_370px] xl:grid-cols-[370px_minmax(0,1fr)_420px] 2xl:grid-cols-[410px_minmax(0,1fr)_440px]">
          <div className="min-h-0 lg:h-full" data-terminal-panel>
            <LiveMatchStatsPanel className="lg:h-full lg:min-h-0" match={match} market={market} />
          </div>
          <div className="min-h-0 lg:h-full" data-terminal-panel>
            <OptionChain className="lg:h-full lg:min-h-0" marketId={marketId} market={market} match={match} />
          </div>
          <section className="flex min-h-0 flex-col gap-2 overflow-y-auto pr-1 lg:h-full" data-terminal-panel>
            <OrderEntryForm matchId={matchId} marketId={marketId} match={match} />
            <TradingActivityPanel className="min-h-[260px] shrink-0 lg:flex-1" matchId={matchId} marketId={marketId} match={match} market={market} />
          </section>
        </div>
      </main>
    </div>
  );
}

function pickPrimaryMarket<T extends { id: string; status?: string; type?: string }>(markets: T[]) {
  const activeMarkets = markets.filter((market) => {
    const status = (market.status ?? "").toLowerCase();
    return status !== "closed" && status !== "settled" && status !== "suspended";
  });
  const candidates = activeMarkets.length > 0 ? activeMarkets : markets;

  return (
    candidates.find((market) => (market.type ?? "").toLowerCase() === "match_depth") ??
    candidates.find((market) => (market.type ?? "").toLowerCase() === "team_total") ??
    candidates[0]
  );
}
