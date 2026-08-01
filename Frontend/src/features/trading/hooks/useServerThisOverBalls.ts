"use client";

import { useMemo } from "react";
import { Match } from "@/types";
import {
  BallEvent,
  ballEventFromOverBall,
  ballsBowledFromSnap,
  padThisOverBalls,
  snapFromMatch,
} from "../utils/terminal-context";

/**
 * "This over" balls, taken straight from the server.
 *
 * The backend already scopes `thisOver` to the active over, so the client does
 * not rebuild it. The previous local ball log lived in localStorage (per device)
 * and, for non-provider matches, inferred deliveries from score deltas — so two
 * devices watching the same match could show different balls while agreeing on
 * the scoreboard. Rendering the server array removes that whole class of drift.
 */
export function useServerThisOverBalls(match?: Match): BallEvent[] {
  const thisOver = match?.thisOver;
  const ballsBowled = match ? ballsBowledFromSnap(snapFromMatch(match)) : 0;

  return useMemo(() => {
    // `thisOver` is omitted from the payload while an over is empty, and the
    // snapshot merge keeps the last non-empty value to survive partial updates.
    // That cached array can therefore outlive its innings, so fall back to the
    // scoreboard: no deliveries bowled means there is nothing to show yet.
    if (ballsBowled <= 0) return padThisOverBalls([]);
    return padThisOverBalls((thisOver ?? []).map(ballEventFromOverBall));
  }, [thisOver, ballsBowled]);
}
