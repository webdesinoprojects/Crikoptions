"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import { walletService } from "@/features/wallet/services/wallet.service";
import { useQueryClient } from "@tanstack/react-query";
import {
  ACADEMIES,
  REWARD_MAP,
  ACADEMY_BY_CHALLENGE,
  type Academy,
  type Challenge,
} from "../data/challenges-data";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ChallengeStatus = "COMPLETE" | "IN_PROGRESS" | "LOCKED";

export interface ChallengeState {
  id: string;
  status: ChallengeStatus;
  claimed: boolean; // whether reward has been claimed
}

export interface AcademyState {
  academyId: string;
  challenges: ChallengeState[];
}

// ─────────────────────────────────────────────────────────────────────────────
// localStorage persistence
// ─────────────────────────────────────────────────────────────────────────────

function storageKey(userId: string) {
  return `cricoptions:challenges:${userId}`;
}

function loadState(userId: string): Map<string, ChallengeState> {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return new Map();
    const parsed: ChallengeState[] = JSON.parse(raw);
    return new Map(parsed.map((s) => [s.id, s]));
  } catch {
    return new Map();
  }
}

function saveState(userId: string, state: Map<string, ChallengeState>) {
  localStorage.setItem(
    storageKey(userId),
    JSON.stringify(Array.from(state.values())),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Derive statuses
// ─────────────────────────────────────────────────────────────────────────────

function deriveStatus(
  challenge: Challenge,
  academy: Academy,
  challengeIndex: number,
  persisted: Map<string, ChallengeState>,
): ChallengeState {
  // If the whole academy is locked → everything inside is locked
  if (academy.locked) {
    return { id: challenge.id, status: "LOCKED", claimed: false };
  }

  // Check if user already persisted a status for this challenge
  const existing = persisted.get(challenge.id);
  if (existing) return existing;

  // Sequential unlock: first challenge starts IN_PROGRESS, rest LOCKED
  if (challengeIndex === 0) {
    return { id: challenge.id, status: "IN_PROGRESS", claimed: false };
  }

  // Unlock if previous is complete
  const prevChallenge = academy.challenges[challengeIndex - 1];
  const prevState = persisted.get(prevChallenge.id);
  if (prevState?.status === "COMPLETE") {
    return { id: challenge.id, status: "IN_PROGRESS", claimed: false };
  }

  return { id: challenge.id, status: "LOCKED", claimed: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useChallenges() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const userId = user?.id ?? "anonymous";

  const [persisted, setPersisted] = useState<Map<string, ChallengeState>>(
    () => loadState(userId),
  );
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Reload from localStorage when user changes
  useEffect(() => {
    setPersisted(loadState(userId));
  }, [userId]);

  // Build full state for every academy
  const academyStates: AcademyState[] = ACADEMIES.map((academy) => ({
    academyId: academy.id,
    challenges: academy.challenges.map((ch, idx) =>
      deriveStatus(ch, academy, idx, persisted),
    ),
  }));

  // Flatten for easy counts
  const allStates = academyStates.flatMap((a) => a.challenges);
  const completedCount = allStates.filter(
    (s) => s.status === "COMPLETE",
  ).length;
  const totalEarned = allStates
    .filter((s) => s.claimed)
    .reduce((sum, s) => sum + (REWARD_MAP.get(s.id) ?? 0), 0);

  // ── Mark complete ──────────────────────────────────────────────────────
  const markComplete = useCallback(
    (challengeId: string) => {
      setPersisted((prev) => {
        const next = new Map(prev);
        const existing = next.get(challengeId);
        next.set(challengeId, {
          id: challengeId,
          status: "COMPLETE",
          claimed: existing?.claimed ?? false,
        });
        saveState(userId, next);
        return next;
      });
    },
    [userId],
  );

  // ── Claim reward (calls wallet topup API) ──────────────────────────────
  const claimReward = useCallback(
    async (challengeId: string) => {
      const reward = REWARD_MAP.get(challengeId);
      const academy = ACADEMY_BY_CHALLENGE.get(challengeId);
      if (!reward || !academy || academy.locked) return;

      const state = persisted.get(challengeId);
      if (!state || state.status !== "COMPLETE" || state.claimed) return;

      setClaimingId(challengeId);
      try {
        await walletService.topUp(reward);
        setPersisted((prev) => {
          const next = new Map(prev);
          next.set(challengeId, {
            id: challengeId,
            status: "COMPLETE",
            claimed: true,
          });
          saveState(userId, next);
          return next;
        });
        // Invalidate wallet/dashboard queries so balance updates
        queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
        queryClient.invalidateQueries({ queryKey: ["wallet"] });
      } finally {
        setClaimingId(null);
      }
    },
    [userId, persisted, queryClient],
  );

  // ── Status lookup helper ───────────────────────────────────────────────
  const getStatus = useCallback(
    (challengeId: string): ChallengeState | undefined => {
      return allStates.find((s) => s.id === challengeId);
    },
    [allStates],
  );

  return {
    academies: ACADEMIES,
    academyStates,
    allStates,
    completedCount,
    totalChallenges: allStates.length,
    totalEarned,
    claimingId,
    markComplete,
    claimReward,
    getStatus,
  };
}
