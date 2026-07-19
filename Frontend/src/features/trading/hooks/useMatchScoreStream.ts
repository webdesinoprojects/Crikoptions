"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MatchScoreUpdateEvent, matchStream } from "@/lib/websocket/match.stream";
import { Match } from "@/types";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { socketManager } from "@/lib/websocket/socket-manager";
import { classifyMatchScoreEvent, patchMatchScore } from "../utils/match-score-reducer";
import { mergeMatchSnapshot } from "../utils/merge-match-snapshot";

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

    const resync = async (id: string) => {
      try {
        const authoritative = await dashboardService.fetchLiveState(id);
        queryClient.setQueryData<Match>(["matchDetails", matchId], (current) => {
          if (isNewerProviderState(current, authoritative)) return current;
          return mergeMatchSnapshot(current, authoritative);
        });
        queryClient.setQueryData<Match[]>(["homeMatches"], (current = []) =>
          current.map((item) =>
            item.id === authoritative.id || item.id === matchId
              ? isNewerProviderState(item, authoritative)
                ? item
                : mergeMatchSnapshot(item, authoritative)
              : item
          )
        );
        if (authoritative.status === "LIVE" || authoritative.status === "INNINGS_BREAK") {
          queryClient.setQueryData<Match[]>(["upcomingMatches"], (current = []) =>
            current.filter((item) => item.id !== authoritative.id && item.id !== matchId)
          );
          void queryClient.invalidateQueries({ queryKey: ["homeMatches"] });
          void queryClient.invalidateQueries({ queryKey: ["upcomingMatches"] });
        }
      } catch {
        await queryClient.invalidateQueries({ queryKey: ["matchDetails", matchId] });
      }
    };

    const apply = (event: MatchScoreUpdateEvent) => {
      const current = queryClient.getQueryData<Match>(["matchDetails", matchId]);
      const action = classifyMatchScoreEvent(current, event);

      if (action === "ignore") return;
      if (action === "resync") {
        void resync(event.matchId || streamMatchId || matchId);
        return;
      }

      queryClient.setQueryData<Match>(["matchDetails", matchId], (current) =>
        current ? patchMatchScore(current, event) : current
      );

      const homeKeys = new Set([event.matchId, streamMatchId, matchId].filter(Boolean));
      queryClient.setQueryData<Match[]>(["homeMatches"], (current = []) =>
        current.map((match) =>
          homeKeys.has(match.id) && classifyMatchScoreEvent(match, event) === "patch"
            ? patchMatchScore(match, event)
            : match
        )
      );
    };

    const unsubscribers = ids.map((id) => matchStream.subscribeMatchScore(id, apply));
    let connectionWasDown = socketManager.getConnectionState() !== "connected";
    const unsubscribeConnection = socketManager.subscribeConnectionState((state) => {
      if (state === "connected" && connectionWasDown) {
        connectionWasDown = false;
        void resync(streamMatchId || matchId);
      } else if (state !== "connected") {
        connectionWasDown = true;
      }
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      unsubscribeConnection();
    };
  }, [matchId, streamMatchId, queryClient]);
}

function isNewerProviderState(current: Match | undefined, incoming: Match): current is Match {
  if (current?.dataSource !== "sportmonks" || incoming.dataSource !== "sportmonks") return false;
  return (current.stateVersion ?? 0) > (incoming.stateVersion ?? 0);
}
