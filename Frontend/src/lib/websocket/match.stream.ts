import { socketManager } from "./socket-manager";
import type { LiveMatchContext } from "@/types";

export interface MatchScoreUpdateEvent {
  matchId: string;
  innings: number;
  currentScore: number;
  wicketsLost: number;
  ballsLeft: number;
  targetScore?: number;
  oversText: string;
  status: string;
  liveContext?: LiveMatchContext;
  timestamp?: string;
}

export interface MatchCommentaryEvent {
  matchId?: string;
  ballNumber?: string;
  runs: number;
  isWicket: boolean;
  extra?: "wide" | "noball" | null;
  wicketType?: string;
  description?: string;
  timestamp?: string;
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
