"use client";

import { Match } from "@/types";
import { useThisOverBalls } from "./useThisOverBalls";

/**
 * Match state is authoritative and revisioned by the backend. In particular,
 * provider corrections may legitimately reduce runs, wickets, or ball count,
 * so the client must never apply a local monotonic-score filter.
 */
export function useStableMatchSnapshot(match?: Match, marketMatchId?: string) {
  const balls = useThisOverBalls(match, marketMatchId);
  return { stableMatch: match, balls };
}
