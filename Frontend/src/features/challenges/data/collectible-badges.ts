import type { AcademyBadge } from "./academy-badges";
import { ACADEMY_BADGES, unlockedAcademyIds } from "./academy-badges";
import { ACADEMIES } from "./challenges-data";
import { selectTodayChallenges, todayChallengeToBadge } from "./today-challenges";
import type { ServerChallenge } from "../services/challenges.service";

export type CollectibleBadge = AcademyBadge & {
  unlocked: boolean;
  done: number;
  total: number;
  kind: "academy" | "daily";
};

/**
 * 5 academy credentials + the daily badges present in GET /api/v1/challenges.
 * Daily medals unlock when that row is COMPLETE. Academy medals unlock when
 * every task in that academy is COMPLETE.
 */
export function buildCollectibleBadges(challenges: ServerChallenge[]): CollectibleBadge[] {
  const unlockedAcademies = unlockedAcademyIds(challenges);
  const daily = selectTodayChallenges(challenges).map((row) => ({
    ...todayChallengeToBadge(row),
    unlocked: row.status === "COMPLETE",
    done: row.progress,
    total: row.target,
    kind: "daily" as const,
  }));

  const academy = ACADEMY_BADGES.map((badge) => {
    const catalog = ACADEMIES.find((item) => item.id === badge.academyId);
    const done = challenges.filter(
      (item) => item.academyId === badge.academyId && item.status === "COMPLETE",
    ).length;
    return {
      ...badge,
      unlocked: unlockedAcademies.has(badge.academyId),
      done,
      total: catalog?.challenges.length ?? 0,
      kind: "academy" as const,
    };
  });

  return [...daily, ...academy];
}

export function findCollectibleBadge(
  id: string,
  badges: CollectibleBadge[],
): CollectibleBadge | undefined {
  return badges.find((badge) => badge.academyId === id || badge.id === id);
}
