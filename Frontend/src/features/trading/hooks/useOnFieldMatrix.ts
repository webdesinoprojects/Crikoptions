"use client";

import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Match } from "@/types";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import { buildOnFieldMatrixState, shouldShowWaitingForFeed } from "../utils/on-field-matrix";
import { mergeMatchSnapshot } from "../utils/merge-match-snapshot";

/**
 * Derives ON-FIELD MATRIX display state from the authoritative match snapshot.
 * REST bootstrap + WebSocket patching are handled by useMatchDetails / useMatchScoreStream.
 *
 * `queryMatchId` = React Query cache key (often market short id).
 * `streamMatchId` = hex _id used for live-state / WS aliases.
 */
export function useOnFieldMatrix(
  match?: Match | null,
  queryMatchId?: string,
  streamMatchId?: string
) {
  const queryClient = useQueryClient();
  const matrix = useMemo(() => buildOnFieldMatrixState(match), [match]);
  const cacheKey = queryMatchId || match?.id;

  useEffect(() => {
    if (!cacheKey || !match?.id || match.dataSource !== "sportmonks") return;
    if (!shouldShowWaitingForFeed(match)) return;

    let cancelled = false;
    const ids = Array.from(new Set([streamMatchId, match.id, queryMatchId].filter(Boolean))) as string[];

    const bootstrap = async () => {
      for (const id of ids) {
        try {
          const authoritative = await dashboardService.fetchLiveState(id);
          if (cancelled) return;
          queryClient.setQueryData<Match>(["matchDetails", cacheKey], (current) =>
            mergeMatchSnapshot(current ?? undefined, authoritative)
          );
          return;
        } catch {
          // Try the alternate match id alias.
        }
      }
    };

    void bootstrap();
    const interval = window.setInterval(() => {
      void bootstrap();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [cacheKey, match, queryClient, queryMatchId, streamMatchId]);

  return matrix;
}
