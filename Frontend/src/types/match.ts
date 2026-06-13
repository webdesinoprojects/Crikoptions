import { Team } from "./team";

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
  startTime: string;
}
