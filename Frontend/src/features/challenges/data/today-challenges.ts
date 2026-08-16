import type { LucideIcon } from "lucide-react";
import type { AcademyBadge } from "./academy-badges";
import type { ServerChallenge } from "../services/challenges.service";
import {
  Zap,
  Brain,
  Crosshair,
  Crown,
} from "lucide-react";

/** Exact daily IDs from GET /api/v1/challenges. Do not rename. */
export const TODAY_DAILY_IDS = [
  "powerplay-pro",
  "middle-over-genius",
  "death-over-assassin",
  "last-over-hero",
] as const;

export type TodayDailyId = (typeof TODAY_DAILY_IDS)[number];

/** Presentation only — progress, status, and payouts come from the server. */
export interface TodayChallengePresentation {
  id: TodayDailyId;
  window: string;
  color: string;
  metal: string;
  icon: LucideIcon;
}

export const TODAY_CHALLENGE_PRESENTATION: Record<TodayDailyId, TodayChallengePresentation> = {
  "powerplay-pro": {
    id: "powerplay-pro",
    window: "T20 1–6 ov · ODI 1–10 ov",
    color: "#22d3ee",
    metal: "#67e8f9",
    icon: Zap,
  },
  "middle-over-genius": {
    id: "middle-over-genius",
    window: "T20 7–15 ov · ODI 11–40 ov",
    color: "#60a5fa",
    metal: "#93c5fd",
    icon: Brain,
  },
  "death-over-assassin": {
    id: "death-over-assassin",
    window: "T20 16+ ov · ODI 40+ ov",
    color: "#f43f5e",
    metal: "#fb7185",
    icon: Crosshair,
  },
  "last-over-hero": {
    id: "last-over-hero",
    window: "T20 20th ov · ODI 50th ov",
    color: "#d4af37",
    metal: "#f5d060",
    icon: Crown,
  },
};

export type TodayChallengeView = ServerChallenge & {
  window: string;
  color: string;
  metal: string;
  icon: LucideIcon;
};

/**
 * Pick the four daily rows from GET /api/v1/challenges by exact id.
 * Missing ids are omitted — never invented as 0/target placeholders.
 */
export function selectTodayChallenges(challenges: ServerChallenge[]): TodayChallengeView[] {
  const byId = new Map(challenges.map((item) => [item.id, item]));
  return TODAY_DAILY_IDS.flatMap((id) => {
    const server = byId.get(id);
    if (!server) return [];
    const look = TODAY_CHALLENGE_PRESENTATION[id];
    return [
      {
        ...server,
        window: look.window,
        color: look.color,
        metal: look.metal,
        icon: look.icon,
      },
    ];
  });
}

export function todayChallengeToBadge(challenge: {
  id: string;
  title: string;
  description: string;
  window: string;
  color: string;
  metal: string;
  icon: LucideIcon;
}): AcademyBadge {
  return {
    id: `badge-${challenge.id}`,
    academyId: challenge.id,
    name: challenge.title,
    title: challenge.title,
    rank: "Daily",
    subtitle: challenge.window,
    description: challenge.description,
    color: challenge.color,
    metal: challenge.metal,
    icon: challenge.icon,
  };
}
