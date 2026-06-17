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
    currentOver: event.oversText,
    homeScore: `${event.currentScore}/${event.wicketsLost}`,
  };
}

export function useMatchScoreStream(matchId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!matchId) return;

    return matchStream.subscribeMatchScore(matchId, (event) => {
      queryClient.setQueryData<Match>(["matchDetails", matchId], (current) => (current ? patchMatch(current, event) : current));

      queryClient.setQueryData<Match[]>(["homeMatches"], (current = []) =>
        current.map((match) => (match.id === matchId ? patchMatch(match, event) : match))
      );
    });
  }, [matchId, queryClient]);
}
