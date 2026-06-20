import { Team } from "./team";

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

export interface Match {
  id: string;
  title: string;
  status: "UPCOMING" | "LIVE" | "COMPLETED";
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
  startTime: string;
}
