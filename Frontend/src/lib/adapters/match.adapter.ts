import { FeedState, InningsSummary, LiveMatchContext, Match as FrontendMatch, MatchPulse, MatchStatus, OverBall, Team as FrontendTeam } from "@/types";

export interface BackendMatch {
  _id: string | null;
  tournamentId: string | null;
  format: string | null;
  teamAId: string | null;
  teamBId: string | null;
  teamAName: string | null;
  teamBName: string | null;
  teamALogo: string | null;
  teamBLogo: string | null;
  startTime: string | null;
  status: string | null;
  innings: number | null;
  currentScore: number | null;
  wicketsLost: number | null;
  ballsLeft: number | null;
  targetScore?: number | null;
  oversText: string | null;
  liveContext?: LiveMatchContext;
  matchPulse?: MatchPulse | null;
  thisOver?: OverBall[];
  createdAt: string;
  updatedAt: string;
  dataSource?: string;
  providerPhase?: string;
  scheduledBalls?: number;
  inningsSummaries?: InningsSummary[];
  stateVersion?: number;
  tradingVersion?: number;
  feedState?: FeedState;
  tradingState?: string;
  tradingBlockers?: string[];
  lastSuccessfulPollAt?: string;
  feedValidUntil?: string;
}

export function adaptMatch(backend: BackendMatch): FrontendMatch {
  const raw = backend as BackendMatch & Record<string, unknown>;
  const liveContext = normalizeLiveContext(raw.liveContext ?? raw.live_context);
  const matchPulse = normalizeMatchPulse(raw.matchPulse ?? raw.match_pulse);
  const thisOver = normalizeThisOver(raw.thisOver ?? raw.this_over);
  const feedState = (raw.feedState ?? raw.feed_state) as FeedState | undefined;
  const teamAName = stringOrFallback(backend.teamAName, "Team A");
  const teamBName = stringOrFallback(backend.teamBName, "Team B");
  const homeTeam: FrontendTeam = {
    id: stringOrFallback(backend.teamAId, "team-a"),
    name: teamAName,
    shortName: teamAName,
    logoUrl: backend.teamALogo ?? "",
  };

  const awayTeam: FrontendTeam = {
    id: stringOrFallback(backend.teamBId, "team-b"),
    name: teamBName,
    shortName: teamBName,
    logoUrl: backend.teamBLogo ?? "",
  };

  const status = adaptMatchStatus(backend.status, feedState);
  const currentScore = numberOrZero(backend.currentScore);
  const wicketsLost = numberOrZero(backend.wicketsLost);

  let homeScore = "";
  if (status === "LIVE" || status === "COMPLETED") {
    homeScore = `${currentScore}/${wicketsLost}`;
  }

  return {
    id: stringOrFallback(backend._id, ""),
    title: `${teamAName} vs ${teamBName}`,
    status,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore: "",
    currentOver: stringOrFallback(backend.oversText, "0.0"),
    format: stringOrFallback(backend.format, "T20"),
    innings: positiveIntOrFallback(backend.innings, 1),
    currentScore,
    wicketsLost,
    ballsLeft: numberOrZero(backend.ballsLeft),
    targetScore: numberOrUndefined(backend.targetScore),
    liveContext,
    matchPulse,
    thisOver,
    startTime: stringOrFallback(backend.startTime, new Date(0).toISOString()),
    dataSource: backend.dataSource,
    providerPhase: backend.providerPhase,
    scheduledBalls: backend.scheduledBalls,
    inningsSummaries: backend.inningsSummaries,
    stateVersion: backend.stateVersion,
    tradingVersion: backend.tradingVersion,
    feedState,
    tradingState: backend.tradingState,
    tradingBlockers: backend.tradingBlockers ?? [],
    lastSuccessfulPollAt: backend.lastSuccessfulPollAt,
    feedValidUntil: backend.feedValidUntil,
  };
}

export function adaptMatches(backendMatches: BackendMatch[]): FrontendMatch[] {
  if (!backendMatches) return [];
  return backendMatches.map(adaptMatch).filter((match) => match.id !== "");
}

export function adaptMatchStatus(status: string | null | undefined, feedState?: FeedState): MatchStatus {
  const normalized = (status ?? "").trim().toLowerCase().replace(/[\s.-]+/g, "_").replace(/^_+|_+$/g, "");

  // Upcoming fixtures may report feedState "warming" / "unsupported" before go-live.
  // Prefer the match status so home can list them instead of hiding as UNSUPPORTED.
  if (normalized === "upcoming" || normalized === "ns" || normalized === "not_started") {
    return "UPCOMING";
  }

  if (feedState === "unsupported") return "UNSUPPORTED";
  if (feedState === "finalizing") return "FINALIZING";

  switch (normalized) {
    case "live":
    case "1st_innings":
    case "2nd_innings":
      return "LIVE";
    case "innings_break":
    case "tea_break":
    case "lunch":
    case "dinner":
      return "INNINGS_BREAK";
    case "delayed":
    case "postp":
    case "postponed":
      return "DELAYED";
    case "int":
    case "interrupted":
      return "INTERRUPTED";
    case "completed":
    case "finished":
      return "COMPLETED";
    case "aban":
    case "abandoned":
      return "ABANDONED";
    case "cancl":
    case "cancelled":
    case "canceled":
      return "CANCELLED";
    default:
      return "UPCOMING";
  }
}

function stringOrFallback(value: string | null | undefined, fallback: string): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed || fallback;
}

function firstString(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (trimmed) return trimmed;
  }
  return "";
}

function numberOrZero(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function numberOrUndefined(value: number | null | undefined): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function positiveIntOrFallback(value: number | null | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.trunc(value) : fallback;
}

function normalizeLiveContext(value: unknown): LiveMatchContext | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  const striker = normalizeBatter(raw.striker);
  const nonStriker = normalizeBatter(raw.nonStriker ?? raw.non_striker);
  const bowler = normalizeBowler(raw.bowler);
  const partnership = normalizePartnership(raw.partnership);
  if (!striker || !nonStriker || !bowler || !partnership) return undefined;
  return { striker, nonStriker, bowler, partnership };
}

function normalizeBatter(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  const name = stringOrFallback(raw.name as string | null | undefined, "");
  if (!name) return undefined;
  return {
    name,
    runs: numberOrZero(raw.runs as number | null | undefined),
    balls: numberOrZero(raw.balls as number | null | undefined),
  };
}

function normalizeBowler(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  const name = stringOrFallback(raw.name as string | null | undefined, "");
  if (!name) return undefined;
  return {
    name,
    balls: numberOrZero(raw.balls as number | null | undefined),
    maidens: numberOrZero(raw.maidens as number | null | undefined),
    runs: numberOrZero(raw.runs as number | null | undefined),
    wickets: numberOrZero(raw.wickets as number | null | undefined),
    currentOverRuns:
      typeof raw.currentOverRuns === "number"
        ? raw.currentOverRuns
        : typeof raw.current_over_runs === "number"
          ? raw.current_over_runs
          : undefined,
  };
}

function normalizePartnership(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Record<string, unknown>;
  return {
    runs: numberOrZero(raw.runs as number | null | undefined),
    balls: numberOrZero(raw.balls as number | null | undefined),
  };
}

function normalizeMatchPulse(value: unknown): MatchPulse | null | undefined {
  if (!value || typeof value !== "object") return value as null | undefined;
  const raw = value as Record<string, unknown>;
  return {
    lastWicket: firstString(raw.lastWicket as string | undefined, raw.last_wicket as string | undefined) || "No wicket this over",
    momentum: firstString(raw.momentum as string | undefined) || "Even phase",
    momentumLevel: (raw.momentumLevel ?? raw.momentum_level) as MatchPulse["momentumLevel"],
    marketVolatility: firstString(raw.marketVolatility as string | undefined, raw.market_volatility as string | undefined) || "Stable",
    volatilityLevel: (raw.volatilityLevel ?? raw.volatility_level) as MatchPulse["volatilityLevel"],
    pressure: firstString(raw.pressure as string | undefined) || "Balanced phase",
    pressureLevel: (raw.pressureLevel ?? raw.pressure_level) as MatchPulse["pressureLevel"],
  };
}

function normalizeThisOver(value: unknown): OverBall[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .map((ball) => {
      if (!ball || typeof ball !== "object") return null;
      const raw = ball as Record<string, unknown>;
      return {
        runs: numberOrZero(raw.runs as number | null | undefined),
        isWicket: Boolean(raw.isWicket ?? raw.is_wicket),
        legalBall: raw.legalBall !== false && raw.legal_ball !== false,
        extra: (raw.extra as OverBall["extra"]) ?? "",
      } satisfies OverBall;
    })
    .filter((ball): ball is OverBall => Boolean(ball));
}
