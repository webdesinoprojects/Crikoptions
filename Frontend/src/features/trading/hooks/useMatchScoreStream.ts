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
    currentScore: event.currentScore,
    wicketsLost: event.wicketsLost,
    ballsLeft: event.ballsLeft,
    targetScore: event.targetScore ?? current.targetScore,
    currentOver: event.oversText,
    homeScore: `${event.currentScore}/${event.wicketsLost}`,
  };
}

/**
 * Live score over WebSocket.
 *
 * `matchId` is the id used as the React Query cache key (the same value passed to
 * `useMatchDetails`, often a backend short id like "1"). `streamMatchId` is the
 * id the backend actually broadcasts on — the match hex `_id`. They differ, so we
 * subscribe to BOTH (deduped) and patch the cache on the original key. The home
 * list is keyed by hex `id`, so we patch it using the event's own matchId.
 */
export function useMatchScoreStream(matchId: string, streamMatchId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!matchId) return;

    const ids = Array.from(new Set([matchId, streamMatchId].filter(Boolean))) as string[];

    const apply = (event: MatchScoreUpdateEvent) => {
      queryClient.setQueryData<Match>(["matchDetails", matchId], (current) => (current ? patchMatch(current, event) : current));

      const homeKey = event.matchId || streamMatchId || matchId;
      queryClient.setQueryData<Match[]>(["homeMatches"], (current = []) =>
        current.map((match) => (match.id === homeKey ? patchMatch(match, event) : match))
      );
    };

    const unsubscribers = ids.map((id) => matchStream.subscribeMatchScore(id, apply));
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [matchId, streamMatchId, queryClient]);
}
