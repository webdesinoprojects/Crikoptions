import { socketManager } from "./socket-manager";
import type { LiveMatchContext, MatchPulse, OverBall } from "@/types";

export interface MatchScoreUpdateEvent {
  eventId?: string;
  matchId: string;
  innings: number;
  currentScore: number;
  wicketsLost: number;
  ballsLeft: number;
  targetScore?: number;
  oversText: string;
  status: string;
  liveContext?: LiveMatchContext;
  matchPulse?: MatchPulse | null;
  thisOver?: OverBall[];
  timestamp?: string;
  stateVersion?: number;
  tradingVersion?: number;
  feedState?: string;
  tradingState?: string;
  tradingBlockers?: string[];
  providerPhase?: string;
  lastSuccessfulPollAt?: string;
  feedValidUntil?: string;
  isCorrection?: boolean;
}

export interface MatchCommentaryEvent {
  eventId?: string;
  sequence?: number;
  revision?: number;
  matchId?: string;
  innings?: number;
  over?: number;
  ball?: number;
  legalBall?: boolean;
  ballNumber?: string | number;
  runs: number;
  isWicket: boolean;
  extra?: "wide" | "noball" | "bye" | "legbye" | "penalty" | null;
  wicketType?: string;
  description?: string;
  currentScore?: number;
  wicketsLost?: number;
  ballsLeft?: number;
  targetScore?: number;
  oversText?: string;
  timestamp?: string;
  isCorrection?: boolean;
  tombstoned?: boolean;
}

/**
 * Interface contract for WebSocket Match Scorecard and Commentary subscriptions.
 */
export const matchStream = {
  subscribeMatchScore: (
    matchId: string,
    onScoreUpdate: (event: MatchScoreUpdateEvent) => void
  ): (() => void) => {
    socketManager.connect();
    const eventName = `match:score:${matchId}`;
    return socketManager.subscribe(eventName, onScoreUpdate);
  },

  subscribeMatchCommentary: (
    matchId: string,
    onCommentary: (event: MatchCommentaryEvent) => void
  ): (() => void) => {
    socketManager.connect();
    const eventName = `match:commentary:${matchId}`;
    return socketManager.subscribe(eventName, onCommentary);
  },
};
