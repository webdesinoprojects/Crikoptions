import type { LucideIcon } from "lucide-react";
import { ACADEMIES, type Academy } from "./challenges-data";
import type { ServerChallenge } from "../services/challenges.service";

export interface AcademyBadge {
  id: string;
  academyId: string;
  name: string;
  title: string;
  rank: string;
  subtitle: string;
  description: string;
  color: string;
  metal: string;
  icon: LucideIcon;
}

const BADGE_COPY: Record<
  string,
  { title: string; rank: string; subtitle: string; metal: string }
> = {
  "long-call": {
    title: "Long Call",
    rank: "Bronze",
    subtitle: "All academy tasks completed",
    metal: "#c4a574",
  },
  "short-call": {
    title: "Short Call",
    rank: "Silver",
    subtitle: "All academy tasks completed",
    metal: "#cfd5dd",
  },
  "bull-spread": {
    title: "Bull Call Spread",
    rank: "Gold",
    subtitle: "All academy tasks completed",
    metal: "#d4af37",
  },
  "iron-fly": {
    title: "Iron Fly",
    rank: "Platinum",
    subtitle: "All academy tasks completed",
    metal: "#e8e6e3",
  },
  "iron-condor": {
    title: "Iron Condor",
    rank: "Diamond",
    subtitle: "All academy tasks completed",
    metal: "#b8d4e3",
  },
};

export const ACADEMY_BADGES: AcademyBadge[] = ACADEMIES.map((academy) => {
  const copy = BADGE_COPY[academy.id] ?? {
    title: `${academy.name.replace(/ Academy$/, "")} Master`,
    rank: "Badge",
    subtitle: "Complete every task",
    metal: "#d4af37",
  };
  const shortName = academy.name.replace(/ Academy$/, "");
  return {
    id: `badge-${academy.id}`,
    academyId: academy.id,
    name: shortName,
    title: copy.title,
    rank: copy.rank,
    subtitle: copy.subtitle,
    description: `Complete all ${academy.challenges.length} tasks to earn this credential.`,
    color: academy.color,
    metal: copy.metal,
    icon: academy.icon,
  };
});

export const BADGE_BY_ACADEMY = new Map(
  ACADEMY_BADGES.map((badge) => [badge.academyId, badge] as const),
);

/** All tasks in the academy must be COMPLETE on the server. */
export function isAcademyComplete(
  academy: Academy,
  challenges: ServerChallenge[],
): boolean {
  if (academy.challenges.length === 0) return false;
  return academy.challenges.every((task) =>
    challenges.some((c) => c.id === task.id && c.status === "COMPLETE"),
  );
}

export function unlockedAcademyIds(challenges: ServerChallenge[]): Set<string> {
  return new Set(
    ACADEMIES.filter((academy) => isAcademyComplete(academy, challenges)).map(
      (academy) => academy.id,
    ),
  );
}

export function getAcademyBadge(academyId: string): AcademyBadge | undefined {
  return BADGE_BY_ACADEMY.get(academyId);
}

const seenKey = (userId: string) => `cric_academy_badges_seen:${userId}`;

export function readSeenBadgeIds(userId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(seenKey(userId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function markBadgesSeen(userId: string, academyIds: string[]): void {
  if (typeof window === "undefined") return;
  const seen = new Set([...readSeenBadgeIds(userId), ...academyIds]);
  localStorage.setItem(seenKey(userId), JSON.stringify([...seen]));
}
