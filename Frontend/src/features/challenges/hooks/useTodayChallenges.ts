"use client";

import { useMemo } from "react";
import { useChallenges } from "./useChallenges";
import { selectTodayChallenges } from "../data/today-challenges";

export function useTodayChallenges() {
  const { challenges, isLoading, isClaimable, claimReward, claimingId } = useChallenges();

  const today = useMemo(() => selectTodayChallenges(challenges), [challenges]);
  const completedCount = today.filter((item) => item.status === "COMPLETE").length;
  const rewardPool = today.reduce((sum, item) => sum + item.reward, 0);

  return {
    today,
    isLoading,
    completedCount,
    total: today.length,
    rewardPool,
    isClaimable,
    claimReward,
    claimingId,
  };
}
