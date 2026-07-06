"use client";

import { useEffect, useRef, useState } from "react";
import { Match } from "@/types";
import { snapFromMatch, ballsBowledFromSnap } from "../utils/terminal-context";
import { useThisOverBalls } from "./useThisOverBalls";

export function useStableMatchSnapshot(match?: Match, marketMatchId?: string) {
  const [stableMatch, setStableMatch] = useState<Match | undefined>(match);
  const lastAcceptedSnapRef = useRef<ReturnType<typeof snapFromMatch> | null>(null);

  useEffect(() => {
    if (!match) {
      setStableMatch(undefined);
      lastAcceptedSnapRef.current = null;
      return;
    }

    const snap = snapFromMatch(match);
    const lastSnap = lastAcceptedSnapRef.current;

    // Reset stable state when matchId or innings changes
    if (!lastSnap || lastSnap.matchId !== snap.matchId || stableMatch?.innings !== match.innings) {
      setStableMatch(match);
      lastAcceptedSnapRef.current = snap;
      return;
    }

    // Acceptance logic for same match/innings
    const ballsBowledNew = ballsBowledFromSnap(snap);
    const ballsBowledOld = ballsBowledFromSnap(lastSnap);

    const oversAdvanced = ballsBowledNew > ballsBowledOld;
    const scoreIncreased = snap.currentScore > lastSnap.currentScore;
    const wicketsIncreased = snap.wicketsLost > lastSnap.wicketsLost;

    // We rely on useThisOverBalls internally managing the current ball list.
    // The main protection here is against score/over rollbacks.
    if (oversAdvanced || scoreIncreased || wicketsIncreased) {
      setStableMatch(match);
      lastAcceptedSnapRef.current = snap;
    }
  }, [match]);

  const balls = useThisOverBalls(stableMatch, marketMatchId);

  return { stableMatch, balls };
}
