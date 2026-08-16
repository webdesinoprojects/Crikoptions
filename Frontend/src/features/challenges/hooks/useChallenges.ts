"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import {
  challengesService,
  type ServerChallenge,
} from "../services/challenges.service";
import { ACADEMIES } from "../data/challenges-data";
import { unlockedAcademyIds } from "../data/academy-badges";
import { buildCollectibleBadges } from "../data/collectible-badges";

export type { ServerChallenge };

export const CHALLENGES_QUERY_KEY = ["challenges"] as const;

/**
 * Challenge state comes entirely from the server, which derives progress from
 * real trading activity. There is deliberately no way to mark a challenge done
 * from the client — completion is proven, not asserted.
 */
export function useChallenges() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: CHALLENGES_QUERY_KEY,
    queryFn: () => challengesService.list(),
    enabled: Boolean(user),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const byId = useMemo(
    () => new Map(challenges.map((c) => [c.id, c])),
    [challenges],
  );

  const claim = useMutation({
    mutationFn: (challengeId: string) => challengesService.claim(challengeId),
    onSuccess: (updated) => {
      queryClient.setQueryData<ServerChallenge[]>(CHALLENGES_QUERY_KEY, (current) => {
        if (!current) return [updated];
        const index = current.findIndex((item) => item.id === updated.id);
        if (index === -1) return [...current, updated];
        const next = current.slice();
        next[index] = updated;
        return next;
      });
      void queryClient.invalidateQueries({ queryKey: ["wallet"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: CHALLENGES_QUERY_KEY });
    },
  });

  const getChallenge = useCallback(
    (challengeId: string) => byId.get(challengeId),
    [byId],
  );

  /** Mirrors the server's own gate, so the UI can never offer an invalid claim. */
  const isClaimable = useCallback(
    (challengeId: string) => {
      const c = byId.get(challengeId);
      return Boolean(c && c.status === "COMPLETE" && !c.claimed);
    },
    [byId],
  );

  const completedCount = challenges.filter((c) => c.status === "COMPLETE").length;
  const totalEarned = challenges
    .filter((c) => c.claimed)
    .reduce((sum, c) => sum + c.reward, 0);

  const unlockedIds = useMemo(() => unlockedAcademyIds(challenges), [challenges]);
  const collectibles = useMemo(() => buildCollectibleBadges(challenges), [challenges]);
  const dailyBadges = useMemo(
    () => collectibles.filter((badge) => badge.kind === "daily"),
    [collectibles],
  );
  const badges = useMemo(
    () => collectibles.filter((badge) => badge.kind === "academy"),
    [collectibles],
  );
  const unlockedBadgeCount = collectibles.filter((badge) => badge.unlocked).length;
  const totalBadges = collectibles.length;

  const isAcademyDone = useCallback(
    (academyId: string) => unlockedIds.has(academyId),
    [unlockedIds],
  );

  return {
    academies: ACADEMIES,
    challenges,
    isLoading,
    getChallenge,
    isClaimable,
    claimReward: claim.mutate,
    claimingId: claim.isPending ? claim.variables : null,
    claimError: claim.error,
    completedCount,
    totalChallenges: challenges.length,
    totalEarned,
    badges,
    dailyBadges,
    collectibles,
    unlockedBadgeCount,
    totalBadges,
    isAcademyDone,
  };
}
