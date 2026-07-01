"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MatchScoreUpdateEvent, matchStream } from "@/lib/websocket/match.stream";
import { Match } from "@/types";

function patchMatch(current: Match, event: MatchScoreUpdateEvent): Match {
  const status = event.status.toLowerCase() === "live" ? "LIVE" : event.status.toLowerCase() === "completed" ? "COMPLETED" : current.status;

  return {
    ...current,
    status,
    innings: event.innings ?? current.innings,
    currentScore: event.currentScore,
    wicketsLost: event.wicketsLost,
    ballsLeft: event.ballsLeft,
    targetScore: event.targetScore ?? current.targetScore,
    currentOver: event.oversText,
    homeScore: `${event.currentScore}/${event.wicketsLost}`,
    liveContext: event.liveContext ?? current.liveContext,
  };
}

/**
 * Live score over WebSocket.
 * `matchId` = React Query cache key (often short id "1").
 * `streamMatchId` = hex _id the backend broadcasts on.
 */
export function useMatchScoreStream(matchId: string, streamMatchId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!matchId) return;

    const ids = Array.from(new Set([matchId, streamMatchId].filter(Boolean))) as string[];

    const apply = (event: MatchScoreUpdateEvent) => {
      queryClient.setQueryData<Match>(["matchDetails", matchId], (current) =>
        current ? patchMatch(current, event) : current
      );

      const homeKey = event.matchId || streamMatchId || matchId;
      queryClient.setQueryData<Match[]>(["homeMatches"], (current = []) =>
        current.map((match) => (match.id === homeKey ? patchMatch(match, event) : match))
      );
    };

    const unsubscribers = ids.map((id) => matchStream.subscribeMatchScore(id, apply));
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [matchId, streamMatchId, queryClient]);
}
