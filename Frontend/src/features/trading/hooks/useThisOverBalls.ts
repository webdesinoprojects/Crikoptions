"use client";

import { useEffect, useRef, useState } from "react";
import { Match } from "@/types";
import { MatchCommentaryEvent, matchStream } from "@/lib/websocket/match.stream";
import { socketManager } from "@/lib/websocket/socket-manager";
import {
  BallEvent,
  ballEventFromCommentary,
  ballsBowledFromSnap,
  currentOverFromList,
  distributeRunsAcrossBalls,
  inferBallsFromScoreDelta,
  isLegalBallEvent,
  padThisOverBalls,
  ScoreboardSnap,
  snapFromMatch,
} from "../utils/terminal-context";
import { appendBall, clearBallLog, loadBallLog, setBallLog, subscribeBallLog } from "../utils/ball-log";

const wsEnabled = process.env.NEXT_PUBLIC_WS_ENABLED === "true";

/**
 * "This over" balls from an append-only delivery log shared across tabs.
 *
 * Two live sources keep it correct on ANY browser:
 *  1. WebSocket `match:commentary:{matchId}` — exact ball, used when the socket
 *     is actually connected.
 *  2. HTTP-poll reconciliation — when WS is down (or on a fresh browser), we
 *     infer the newly bowled deliveries from the score delta so balls still
 *     appear in order without WebSockets.
 */
export function useThisOverBalls(match?: Match): BallEvent[] {
  const matchId = match?.id ?? "";
  const currentScore = match?.currentScore ?? null;
  const wicketsLost = match?.wicketsLost ?? null;
  const ballsLeft = match?.ballsLeft ?? null;

  const prevSnapRef = useRef<ScoreboardSnap | null>(null);
  const [balls, setBalls] = useState<BallEvent[]>(() => padThisOverBalls([]));

  // Render from the shared log; react to same-tab + cross-tab writes.
  useEffect(() => {
    if (!matchId) {
      setBalls(padThisOverBalls([]));
      return;
    }

    const render = () => setBalls(currentOverFromList(loadBallLog(matchId)));
    render();
    return subscribeBallLog(matchId, render);
  }, [matchId]);

  // Reconcile the log against the score on every match update.
  useEffect(() => {
    if (!matchId || !match) return;

    const snap = snapFromMatch(match);
    const bowled = ballsBowledFromSnap(snap);
    const log = loadBallLog(matchId);

    // Innings reset.
    if (snap.currentScore === 0 && snap.wicketsLost === 0 && bowled <= 0) {
      if (log.length > 0) clearBallLog(matchId);
      prevSnapRef.current = snap;
      return;
    }

    const prev = prevSnapRef.current;
    const isFirstSync = !prev || prev.matchId !== snap.matchId;

    // First load on this browser (incl. a brand new browser / late join):
    // rebuild the current picture from the aggregate score.
    if (isFirstSync) {
      const legalLogged = log.filter(isLegalBallEvent).length;
      if (bowled > 0 && legalLogged !== bowled) {
        setBallLog(matchId, distributeRunsAcrossBalls(bowled, snap.currentScore, snap.wicketsLost));
      }
      prevSnapRef.current = snap;
      return;
    }

    // When WS is actively delivering commentary, let it own appends (no double).
    if (wsEnabled && socketManager.isConnected()) {
      prevSnapRef.current = snap;
      return;
    }

    // Polling path: append the deliveries implied by the score delta.
    const inferred = inferBallsFromScoreDelta(prev, snap);
    prevSnapRef.current = snap;

    if (inferred === "reset") {
      clearBallLog(matchId);
      return;
    }

    if (inferred && inferred.length > 0) {
      inferred.forEach((ball) => appendBall(matchId, ball));

      // A wide adds a run but no legal ball — keep the log aligned to bowled.
      const after = loadBallLog(matchId);
      const legalCount = after.filter(isLegalBallEvent).length;
      if (legalCount > bowled) {
        let remainingLegal = bowled;
        setBallLog(
          matchId,
          after.filter((ball) => {
            if (!isLegalBallEvent(ball)) return true;
            if (remainingLegal <= 0) return false;
            remainingLegal -= 1;
            return true;
          })
        );
      }
    }
  }, [matchId, currentScore, wicketsLost, ballsLeft]);

  // Live ball-by-ball via WebSocket (each connected client appends on receive).
  useEffect(() => {
    if (!matchId || !wsEnabled) return;

    return matchStream.subscribeMatchCommentary(matchId, (event: MatchCommentaryEvent) => {
      appendBall(matchId, ballEventFromCommentary(event));
    });
  }, [matchId]);

  return balls;
}
