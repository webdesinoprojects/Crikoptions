import { Team } from "./team";

export type MatchStatus =
  | "UPCOMING"
  | "LIVE"
  | "INNINGS_BREAK"
  | "DELAYED"
  | "INTERRUPTED"
  | "FINALIZING"
  | "COMPLETED"
  | "ABANDONED"
  | "CANCELLED"
  | "UNSUPPORTED";

export type FeedState =
  | "warming"
  | "healthy"
  | "reconciling"
  | "stale"
  | "quota_limited"
  | "finalizing"
  | "terminal"
  | "unsupported";

export interface InningsSummary {
  innings: number;
  battingTeamId?: number;
  runs: number;
  wickets: number;
  legalBalls: number;
  scheduledBalls?: number;
  target?: number;
  complete: boolean;
  revision: number;
  finalCandidate?: {
    revision: number;
    snapshotHash: string;
    identicalPolls: number;
    firstSeenAt: string;
    lastSeenAt: string;
  };
  settlementReady?: boolean;
  finalDisposition?: "settle" | "void";
}

export interface BatterStats {
  name: string;
  runs: number;
  balls: number;
}

export interface BowlerStats {
  name: string;
  balls: number;
  maidens: number;
  runs: number;
  wickets: number;
  currentOverRuns?: number;
}

export interface PartnershipStats {
  runs: number;
  balls: number;
}

export interface LiveMatchContext {
  striker: BatterStats;
  nonStriker: BatterStats;
  bowler: BowlerStats;
  partnership: PartnershipStats;
}

export type MomentumLevel = "attacking" | "even" | "defensive";
export type VolatilityLevel = "high" | "moderate" | "stable";
export type PressureLevel = "chase" | "defend" | "balanced" | "complete";

export interface MatchPulse {
  lastWicket: string;
  momentum: string;
  momentumLevel?: MomentumLevel;
  marketVolatility: string;
  volatilityLevel?: VolatilityLevel;
  pressure: string;
  pressureLevel?: PressureLevel;
}

export interface OverBall {
  runs: number;
  isWicket: boolean;
  legalBall: boolean;
  extra?: "wide" | "noball" | "bye" | "legbye" | "penalty" | "";
}

export interface Match {
  id: string;
  title: string;
  status: MatchStatus;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: string;
  awayScore?: string;
  currentOver?: string;
  format?: string;
  innings?: number;
  currentScore?: number;
  wicketsLost?: number;
  ballsLeft?: number;
  targetScore?: number;
  liveContext?: LiveMatchContext;
  matchPulse?: MatchPulse | null;
  thisOver?: OverBall[];
  startTime: string;
  dataSource?: "manual" | "simulator" | "sportmonks" | string;
  providerPhase?: string;
  scheduledBalls?: number;
  inningsSummaries?: InningsSummary[];
  stateVersion?: number;
  tradingVersion?: number;
  feedState?: FeedState;
  tradingState?: string;
  tradingBlockers?: string[];
  /** Backend trade gate — prefer this over inferring from feedState. */
  tradable?: boolean;
  lastSuccessfulPollAt?: string;
  feedValidUntil?: string;
}

export { canTradeMatch, isMatchTradable, isSoftSyncFeed, tradeBlockerMessage } from "./match-trading";
export type { TradeGateMatch } from "./match-trading";
