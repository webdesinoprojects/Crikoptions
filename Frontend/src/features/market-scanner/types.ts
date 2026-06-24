export type ReplayMatchKey = "csk-mi" | "rcb-kkr";

export interface ReplayEvent {
  id: string;
  matchKey: ReplayMatchKey;
  innings: 1 | 2;
  over: number;
  ball: number;
  event: string;
  runs: number;
  currentScore: number;
  wicketsLost: number;
  legalBallNumber: number;
  ballsLeft: number;
  ballsBowled: number;
  battingTeam?: string;
  bowlingTeam?: string;
}

export interface ReplayDataset {
  matchKey: ReplayMatchKey;
  events: ReplayEvent[];
  innings: Array<1 | 2>;
  firstInningsFinalScore: number;
}
