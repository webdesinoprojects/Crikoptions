import { socketManager } from "./socket-manager";

export interface MatchScoreUpdateEvent {
  matchId: string;
  innings: number;
  currentScore: number;
  wicketsLost: number;
  ballsLeft: number;
  oversText: string;
  status: string;
  timestamp: string;
}

export interface MatchCommentaryEvent {
  matchId: string;
  ballNumber: string; // e.g. "16.2"
  runs: number;
  isWicket: boolean;
  wicketType?: string;
  description: string;
  timestamp: string;
}

/**
 * Interface contract for WebSocket Match Scorecard and Commentary subscriptions.
 */
export const matchStream = {
  subscribeMatchScore: (
    matchId: string,
    onScoreUpdate: (event: MatchScoreUpdateEvent) => void
  ): (() => void) => {
    const socket = socketManager.connect();
    const eventName = `match:score:${matchId}`;

    socket.emit("subscribe", { channel: eventName });
    socket.on(eventName, onScoreUpdate);

    return () => {
      socket.off(eventName, onScoreUpdate);
      socket.emit("unsubscribe", { channel: eventName });
    };
  },

  subscribeMatchCommentary: (
    matchId: string,
    onCommentary: (event: MatchCommentaryEvent) => void
  ): (() => void) => {
    const socket = socketManager.connect();
    const eventName = `match:commentary:${matchId}`;

    socket.emit("subscribe", { channel: eventName });
    socket.on(eventName, onCommentary);

    return () => {
      socket.off(eventName, onCommentary);
      socket.emit("unsubscribe", { channel: eventName });
    };
  },
};
