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

    const ballsBowledNew = ballsBowledFromSnap(snap);
    const ballsBowledOld = ballsBowledFromSnap(lastSnap);

    const oversAdvanced = ballsBowledNew > ballsBowledOld;
    const scoreIncreased = snap.currentScore > lastSnap.currentScore;
    const wicketsIncreased = snap.wicketsLost > lastSnap.wicketsLost;

    // Detect a match loop restart: score dropped dramatically (e.g. back to 0/0 or 62/1 on reset)
    const isMatchReset =
      snap.currentScore < lastSnap.currentScore - 10 ||
      (snap.currentScore === 0 && snap.wicketsLost === 0 && lastSnap.currentScore > 0);

    // Accept the new snapshot if it's forward progress or a clear reset.
    if (oversAdvanced || scoreIncreased || wicketsIncreased || isMatchReset) {
      setStableMatch(match);
      lastAcceptedSnapRef.current = snap;
    }
  }, [match]);

  // IMPORTANT: Always pass the RAW match to useThisOverBalls, NOT stableMatch.
  // stableMatch is only for display. Ball tracking must respond to every tick
  // (including dot balls that don't change score/wickets) and match resets.
  const balls = useThisOverBalls(match, marketMatchId);

  return { stableMatch, balls };
}

