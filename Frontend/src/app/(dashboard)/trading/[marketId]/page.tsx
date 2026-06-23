"use client";

import React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  LiveMatchStatsPanel,
  MatchScheduleStrip,
  OptionChain,
  OrderEntryForm,
  TradingActivityPanel,
} from "@/features/trading/components";
import { useMarketDetail, useMatchScoreStream } from "@/features/trading/hooks";
import { useLiveMatches, useMatchDetails } from "@/features/dashboard/hooks";
import type { BackendMarket } from "@/lib/adapters/market.adapter";
import type { LiveMatchContext, Match } from "@/types";

interface PageProps {
  params: Promise<{ marketId: string }>;
}

const ENABLE_DEV_MATCH_SIMULATOR = false;
const SIMULATED_DELIVERY_MS = 2_500;
const SIMULATED_BALLS = [1, 4, 0, 2, 6, "W", 1, 0, 3, 4, 2, 1, "W", 6, 0, 1] as const;

export default function TradingTerminalPage({ params }: PageProps) {
  const terminalRef = React.useRef<HTMLDivElement>(null);
  const { marketId } = React.use(params);
  const { data: market } = useMarketDetail(marketId);
  const matchId = market?.matchId ?? "";
  const { data: match } = useMatchDetails(matchId);
  useMatchScoreStream(matchId);
  const { data: matches = [] } = useLiveMatches();
  const simulatedMatch = useDevSimulatedMatch(match, market);
  const visibleMatches = React.useMemo(
    () =>
      simulatedMatch
        ? [simulatedMatch, ...matches.filter((item) => item.id !== simulatedMatch.id)]
        : matches,
    [matches, simulatedMatch]
  );

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
        <MatchScheduleStrip matches={visibleMatches} selectedMatchId={matchId} />
      </div>

      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
        <div className="grid min-h-full grid-cols-1 gap-3 p-3 lg:h-full lg:min-h-0 lg:grid-cols-[320px_minmax(0,1fr)_370px] xl:grid-cols-[370px_minmax(0,1fr)_420px] 2xl:grid-cols-[410px_minmax(0,1fr)_440px]">
          <div className="min-h-0 lg:h-full" data-terminal-panel>
            <LiveMatchStatsPanel className="lg:h-full lg:min-h-0" match={simulatedMatch} market={market} />
          </div>
          <div className="min-h-0 lg:h-full" data-terminal-panel>
            <OptionChain className="lg:h-full lg:min-h-0" marketId={marketId} market={market} match={simulatedMatch} />
          </div>
          <section className="flex min-h-0 flex-col gap-2 overflow-y-auto pr-1 lg:h-full" data-terminal-panel>
            <OrderEntryForm matchId={matchId} marketId={marketId} match={simulatedMatch} />
            <TradingActivityPanel className="min-h-[260px] shrink-0 lg:flex-1" matchId={matchId} marketId={marketId} match={simulatedMatch} market={market} />
          </section>
        </div>
      </main>
    </div>
  );
}

function useDevSimulatedMatch(match?: Match, market?: BackendMarket): Match | undefined {
  const matchKey = match?.id ?? market?.matchId ?? market?._id;
  const [simState, setSimState] = React.useState({ matchKey: "", tick: 0 });
  const activeTick = simState.matchKey === matchKey ? simState.tick : 0;

  React.useEffect(() => {
    if (!ENABLE_DEV_MATCH_SIMULATOR || !matchKey) return;

    const interval = window.setInterval(() => {
      setSimState((current) => ({
        matchKey,
        tick: current.matchKey === matchKey ? current.tick + 1 : 1,
      }));
    }, SIMULATED_DELIVERY_MS);

    return () => window.clearInterval(interval);
  }, [matchKey]);

  return React.useMemo(() => {
    const baseMatch = match ?? buildFallbackMatch(market);
    if (!ENABLE_DEV_MATCH_SIMULATOR || !baseMatch) return baseMatch;

    return applySimulatedDeliveries(baseMatch, activeTick);
  }, [activeTick, market, match]);
}

function buildFallbackMatch(market?: BackendMarket): Match | undefined {
  if (!market) return undefined;

  return {
    id: market.matchId || market._id,
    title: market.title || "Dev Match",
    status: "LIVE",
    homeTeam: {
      id: "dev-home",
      name: "Mumbai Meteors",
      shortName: "MM",
    },
    awayTeam: {
      id: "dev-away",
      name: "Chennai Chargers",
      shortName: "CC",
    },
    homeScore: "42/1",
    currentOver: "5.0",
    format: "T20",
    innings: 1,
    currentScore: 42,
    wicketsLost: 1,
    ballsLeft: 90,
    startTime: new Date().toISOString(),
  };
}

function applySimulatedDeliveries(match: Match, tick: number): Match {
  const totalBalls = totalBallsForFormat(match.format);
  const startScore = match.currentScore ?? scoreFromDisplay(match.homeScore);
  const startWickets = match.wicketsLost ?? wicketsFromDisplay(match.homeScore);
  const startBallsLeft = Math.max(0, Math.min(totalBalls, match.ballsLeft ?? totalBalls));
  const deliveries = Array.from({ length: tick }, (_, index) => SIMULATED_BALLS[index % SIMULATED_BALLS.length]);
  const runsAdded = sumSimulatedRuns(deliveries);
  const wicketsAdded = deliveries.filter((ball) => ball === "W").length;
  const currentScore = startScore + runsAdded;
  const wicketsLost = Math.min(10, startWickets + wicketsAdded);
  const ballsLeft = Math.max(0, startBallsLeft - deliveries.length);
  const ballsBowled = totalBalls - ballsLeft;

  return {
    ...match,
    status: "LIVE",
    currentScore,
    wicketsLost,
    ballsLeft,
    currentOver: oversTextFromBalls(ballsBowled),
    homeScore: `${currentScore}/${wicketsLost}`,
    liveContext: buildSimulatedLiveContext(match.liveContext, deliveries),
  };
}

function buildSimulatedLiveContext(baseContext: LiveMatchContext | undefined, deliveries: readonly (number | "W")[]): LiveMatchContext {
  const strikerRuns = (baseContext?.striker.runs ?? 34) + sumSimulatedRuns(deliveries);
  const legalBalls = deliveries.length;
  const wicketCount = deliveries.filter((ball) => ball === "W").length;
  const bowlerRuns = (baseContext?.bowler.runs ?? 18) + sumSimulatedRuns(deliveries);

  return {
    striker: {
      name: baseContext?.striker.name ?? "A. Sharma",
      runs: strikerRuns,
      balls: (baseContext?.striker.balls ?? 24) + legalBalls,
    },
    nonStriker: {
      name: baseContext?.nonStriker.name ?? "R. Patel",
      runs: baseContext?.nonStriker.runs ?? 18,
      balls: baseContext?.nonStriker.balls ?? 14,
    },
    bowler: {
      name: baseContext?.bowler.name ?? "M. Khan",
      balls: (baseContext?.bowler.balls ?? 18) + legalBalls,
      maidens: baseContext?.bowler.maidens ?? 0,
      runs: bowlerRuns,
      wickets: (baseContext?.bowler.wickets ?? 1) + wicketCount,
      currentOverRuns: currentOverRuns(deliveries),
    },
    partnership: {
      runs: (baseContext?.partnership.runs ?? 52) + sumSimulatedRuns(deliveries),
      balls: (baseContext?.partnership.balls ?? 38) + legalBalls,
    },
  };
}

function currentOverRuns(deliveries: readonly (number | "W")[]) {
  return sumSimulatedRuns(deliveries.slice(-6));
}

function sumSimulatedRuns(deliveries: readonly (number | "W")[]) {
  return deliveries.reduce<number>((total, ball) => total + (ball === "W" ? 0 : ball), 0);
}

function totalBallsForFormat(format?: string) {
  const upper = (format ?? "T20").toUpperCase();
  return upper.includes("ODI") || upper.includes("ONE") ? 300 : 120;
}

function oversTextFromBalls(balls: number) {
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

function scoreFromDisplay(score?: string) {
  const value = Number.parseInt((score ?? "0").split("/")[0], 10);
  return Number.isFinite(value) ? value : 0;
}

function wicketsFromDisplay(score?: string) {
  const value = Number.parseInt((score ?? "0/0").split("/")[1] ?? "0", 10);
  return Number.isFinite(value) ? value : 0;
}
