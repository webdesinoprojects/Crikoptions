"use client";

import { AcademyBadge } from "./AcademyBadge";
import { todayChallengeToBadge } from "../data/today-challenges";
import type { TodayChallengeView } from "../data/today-challenges";

/** Badge stays sealed until the server marks the daily task COMPLETE. */
export function TodayChallengeMark({
  challenge,
  size = "sm",
}: {
  challenge: TodayChallengeView;
  size?: "xs" | "sm" | "md";
}) {
  return (
    <AcademyBadge
      badge={todayChallengeToBadge(challenge)}
      unlocked={challenge.status === "COMPLETE"}
      size={size}
    />
  );
}
