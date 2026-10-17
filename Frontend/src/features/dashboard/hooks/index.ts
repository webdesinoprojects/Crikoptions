import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";
import type { Match } from "@/types";
import { mergeMatchSnapshot } from "@/features/trading/utils/merge-match-snapshot";
import {
  HOME_STRIP_UPCOMING_LIMIT,
  selectHomeStripMatches,
} from "@/features/trading/utils/home-matches";
import { useMatchScoreStream } from "@/features/trading/hooks/useMatchScoreStream";
import { matchStream } from "@/lib/websocket/match.stream";
import { classifyMatchScoreEvent, patchMatchScore } from "@/features/trading/utils/match-score-reducer";

export const useDashboardOverview = (enabled = true) => {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: dashboardService.getFinancialOverview,
    enabled,
    refetchInterval: enabled ? 10000 : false,
    refetchOnWindowFocus: enabled,
  });
};

export const useLiveTicker = (enabled = true) => {
  return useQuery({
    queryKey: ["dashboard", "ticker"],
    queryFn: dashboardService.getLiveTicker,
    enabled,
    refetchInterval: enabled ? 5000 : false,
  });
};

export const useHomeMatches = (enabled = true) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["homeMatches"],
    queryFn: dashboardService.fetchHomeMatches,
    enabled,
    refetchInterval: enabled ? 5000 : false,
  });

  const liveMatchIds = useMemo(() => {
    return (query.data ?? [])
      .filter((m) => m.status === "LIVE" || m.status === "INNINGS_BREAK")
      .map((m) => m.id)
      .join(",");
  }, [query.data]);

  useEffect(() => {
    if (!liveMatchIds) return;
    const ids = liveMatchIds.split(",").filter(Boolean);
    const unsubscribers = ids.map((id) =>
      matchStream.subscribeMatchScore(id, (event) => {
        const homeKeys = new Set([event.matchId, id].filter(Boolean));
        queryClient.setQueryData<Match[]>(["homeMatches"], (current = []) =>
          current.map((match) =>
            homeKeys.has(match.id) && classifyMatchScoreEvent(match, event) === "patch"
              ? patchMatchScore(match, event)
              : match
          )
        );
      })
    );
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [liveMatchIds, queryClient]);

  return query;
};

export const useUpcomingMatches = (enabled = true) => {
  return useQuery({
    queryKey: ["upcomingMatches"],
    queryFn: dashboardService.fetchUpcomingMatches,
    enabled,
    // Poll so fixtures flip off this list (and onto home) when status becomes LIVE.
    refetchInterval: enabled ? 5000 : false,
  });
};

/** Live/break from /matches/home plus the next two from /matches/upcoming. */
export const useHomeStripMatches = (enabled = true) => {
  const homeQuery = useHomeMatches(enabled);
  const upcomingQuery = useUpcomingMatches(enabled);

  const matches = useMemo(
    () =>
      selectHomeStripMatches(
        homeQuery.data ?? [],
        upcomingQuery.data ?? [],
        HOME_STRIP_UPCOMING_LIMIT
      ),
    [homeQuery.data, upcomingQuery.data]
  );

  return {
    data: matches,
    isLoading: homeQuery.isLoading || upcomingQuery.isLoading,
    isFetching: homeQuery.isFetching || upcomingQuery.isFetching,
    isError: homeQuery.isError || upcomingQuery.isError,
    error: homeQuery.error ?? upcomingQuery.error,
  };
};

export const useMatchDetails = (matchId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["matchDetails", matchId],
    queryFn: async () => {
      const current = queryClient.getQueryData<Match>(["matchDetails", matchId]);
      const ids = Array.from(new Set([matchId, current?.id].filter(Boolean))) as string[];

      for (const id of ids) {
        try {
          const incoming = await dashboardService.fetchLiveState(id);
          return mergeMatchSnapshot(current, incoming);
        } catch {
          // Try the next alias id.
        }
      }

      const incoming = await dashboardService.fetchMatchDetails(matchId);
      return mergeMatchSnapshot(current, incoming);
    },
    enabled: !!matchId,
    refetchInterval: 1000,
  });

  useMatchScoreStream(matchId, query.data?.id);

  return query;
};

export const useLiveMatches = () => {
  return useHomeMatches();
};

export const useMarketMovers = () => {
  return useQuery({
    queryKey: ["dashboard", "movers"],
    queryFn: dashboardService.getMarketMovers,
  });
};

export const useOpportunityScanner = () => {
  return useQuery({
    queryKey: ["dashboard", "opportunities"],
    queryFn: dashboardService.getOpportunities,
  });
};

export const useIntelligenceFeed = () => {
  return useQuery({
    queryKey: ["dashboard", "intelligence"],
    queryFn: dashboardService.getIntelligenceFeed,
  });
};
