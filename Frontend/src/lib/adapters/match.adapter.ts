import { FeedState, InningsSummary, LiveMatchContext, Match as FrontendMatch, MatchStatus, Team as FrontendTeam } from "@/types";

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

  const status = adaptMatchStatus(backend.status, backend.feedState);
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
    liveContext: backend.liveContext,
    startTime: stringOrFallback(backend.startTime, new Date(0).toISOString()),
    dataSource: backend.dataSource,
    providerPhase: backend.providerPhase,
    scheduledBalls: backend.scheduledBalls,
    inningsSummaries: backend.inningsSummaries,
    stateVersion: backend.stateVersion,
    tradingVersion: backend.tradingVersion,
    feedState: backend.feedState,
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
  if (feedState === "unsupported") return "UNSUPPORTED";
  if (feedState === "finalizing") return "FINALIZING";

  switch ((status ?? "").trim().toLowerCase().replace(/[\s.-]+/g, "_").replace(/^_+|_+$/g, "")) {
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

function numberOrZero(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function numberOrUndefined(value: number | null | undefined): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function positiveIntOrFallback(value: number | null | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.trunc(value) : fallback;
}
