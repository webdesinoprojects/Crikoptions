import {
  TrendingUp,
  TrendingDown,
  GitBranch,
  Diamond,
  Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number; // CricCoins (₵) reward
}

export interface Academy {
  id: string;
  name: string;
  icon: LucideIcon;
  /** Accent colour (hex) for cards, progress bars, badges */
  color: string;
  /** Whether the entire academy is locked (coming soon) */
  locked: boolean;
  challenges: Challenge[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

export const ACADEMIES: Academy[] = [
  // ── 1. Long Call Academy ──────────────────────────────────────────────
  {
    id: "long-call",
    name: "Long Call Academy",
    icon: TrendingUp,
    color: "#10b981", // emerald-500
    locked: false,
    challenges: [
      {
        id: "lc-1",
        title: "First Trade",
        description: "Buy your first call option.",
        reward: 500,
      },
      {
        id: "lc-2",
        title: "Green Candle",
        description: "Close one call option with profit.",
        reward: 1_000,
      },
      {
        id: "lc-3",
        title: "Momentum Catcher",
        description:
          "Complete 3 profitable long call trades in a single inning.",
        reward: 2_500,
      },
      {
        id: "lc-4",
        title: "Call Expert",
        description:
          "Finish 5 consecutive long call trades in a single inning.",
        reward: 5_000,
      },
      {
        id: "lc-5",
        title: "Rider",
        description: "Hold a long call trade for at least 50 overs.",
        reward: 10_000,
      },
    ],
  },

  // ── 2. Short Call Academy ─────────────────────────────────────────────
  {
    id: "short-call",
    name: "Short Call Academy",
    icon: TrendingDown,
    color: "#f43f5e", // rose-500
    locked: false,
    challenges: [
      {
        id: "sc-1",
        title: "First Premium",
        description: "Sell your first call option.",
        reward: 500,
      },
      {
        id: "sc-2",
        title: "Premium Collector",
        description: "Close one short call with profit.",
        reward: 1_000,
      },
      {
        id: "sc-3",
        title: "The Seller",
        description:
          "Complete 3 profitable short call trades in a single inning.",
        reward: 2_500,
      },
      {
        id: "sc-4",
        title: "Expert Seller",
        description:
          "Finish 5 consecutive short call trades in a single inning.",
        reward: 5_000,
      },
      {
        id: "sc-5",
        title: "Rider",
        description: "Hold a short call trade for at least 50 overs.",
        reward: 10_000,
      },
    ],
  },

  // ── 3. Bull Call Spread Academy (LOCKED) ──────────────────────────────
  {
    id: "bull-spread",
    name: "Bull Call Spread Academy",
    icon: GitBranch,
    color: "#06b6d4", // cyan-500
    locked: true,
    challenges: [
      {
        id: "bs-1",
        title: "Build Your First Spread",
        description:
          "Create your first bull call spread. E.g. buy 100 CE and sell 150 CE.",
        reward: 1_000,
      },
      {
        id: "bs-2",
        title: "Limited Risk",
        description: "Hold the spread for at least 10 overs.",
        reward: 2_000,
      },
      {
        id: "bs-3",
        title: "Spread Specialist",
        description:
          "Complete 5 bull call spreads across different matches.",
        reward: 5_000,
      },
      {
        id: "bs-4",
        title: "Bull Strategist",
        description:
          "Achieve 3 profitable bull call spreads consecutively.",
        reward: 7_500,
      },
      {
        id: "bs-5",
        title: "Ratio Master",
        description: "Generate over 10,000 CricCoins using ratio spread.",
        reward: 15_000,
      },
    ],
  },

  // ── 4. Iron Fly Academy (LOCKED) ─────────────────────────────────────
  {
    id: "iron-fly",
    name: "Iron Fly Academy",
    icon: Diamond,
    color: "#d4af37", // gold
    locked: true,
    challenges: [
      {
        id: "if-1",
        title: "Build Iron Fly",
        description: "Create your first iron butterfly.",
        reward: 1_000,
      },
      {
        id: "if-2",
        title: "Hold Your Nerves",
        description: "Keep the iron fly open for 5 overs.",
        reward: 2_000,
      },
      {
        id: "if-3",
        title: "Time Decay",
        description: "Finish one iron fly profitably.",
        reward: 3_000,
      },
      {
        id: "if-4",
        title: "Precision Trader",
        description:
          "Complete 3 profitable iron fly trades consecutively across different matches.",
        reward: 7_500,
      },
      {
        id: "if-5",
        title: "Master",
        description: "Complete 5 profitable iron fly trades consecutively.",
        reward: 15_000,
      },
    ],
  },

  // ── 5. Iron Condor Academy (LOCKED) ──────────────────────────────────
  {
    id: "iron-condor",
    name: "Iron Condor Academy",
    icon: Layers,
    color: "#8b5cf6", // violet-500
    locked: true,
    challenges: [
      {
        id: "ic-1",
        title: "First Condor",
        description: "Build an iron condor.",
        reward: 1_000,
      },
      {
        id: "ic-2",
        title: "Safe Zone",
        description: "Finish 1 profitable iron condor.",
        reward: 2_000,
      },
      {
        id: "ic-3",
        title: "Consistency",
        description: "Complete 5 profitable iron condors.",
        reward: 5_000,
      },
      {
        id: "ic-4",
        title: "Adjustments",
        description: "Adjust at least 1 spread.",
        reward: 7_500,
      },
      {
        id: "ic-5",
        title: "Condor King",
        description: "Adjust at least 3 spreads and end profitably!",
        reward: 15_000,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Total ₵ reward across every challenge */
export const TOTAL_REWARDS = ACADEMIES.reduce(
  (sum, a) => sum + a.challenges.reduce((s, c) => s + c.reward, 0),
  0,
);

/** Flat array of all challenge ids */
export const ALL_CHALLENGE_IDS = ACADEMIES.flatMap((a) =>
  a.challenges.map((c) => c.id),
);

/** Quick lookup: challengeId → reward */
export const REWARD_MAP = new Map<string, number>(
  ACADEMIES.flatMap((a) => a.challenges.map((c) => [c.id, c.reward] as const)),
);

/** Quick lookup: challengeId → academy */
export const ACADEMY_BY_CHALLENGE = new Map<string, Academy>(
  ACADEMIES.flatMap((a) => a.challenges.map((c) => [c.id, a] as const)),
);

export function formatCC(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
