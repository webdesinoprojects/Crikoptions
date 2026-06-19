"use client";

import { useEffect, useRef, useState } from "react";
import { Match } from "@/types";
import { MatchCommentaryEvent, matchStream } from "@/lib/websocket/match.stream";
import { socketManager } from "@/lib/websocket/socket-manager";
import {
  BallEvent,
  ballEventFromCommentary,
  ballEventFromHistory,
  ballsBowledFromSnap,
  currentOverFromList,
  distributeRunsAcrossBalls,
  inferBallsFromScoreDelta,
  isLegalBallEvent,
  padThisOverBalls,
  ScoreboardSnap,
  snapFromMatch,
  trimBallLogToBowled,
} from "../utils/terminal-context";
import { tradingService } from "../services/trading.service";
import { appendBall, clearBallLog, loadBallLog, setBallLog, subscribeBallLog } from "../utils/ball-log";

const wsEnabled = process.env.NEXT_PUBLIC_WS_ENABLED === "true";

/**
 * "This over" balls for ANY live match, kept correct from three sources:
 *
 *  1. Exact history (GET /matches/{id}/events) — seeds the real order on load so
 *     a late join (or a second live match opened mid-over) is correct.
 *  2. WebSocket `match:commentary:{matchId}` — appends each new ball live. The
 *     backend broadcasts on the match hex `_id`, but we also subscribe to the
 *     short market id so it works regardless of which the backend uses.
 *  3. HTTP-poll reconciliation — when the events endpoint is unavailable AND no
 *     WS commentary has arrived yet, we infer balls from the score delta so the
 *     over still fills in (best-effort order).
 */
export function useThisOverBalls(match?: Match, streamMatchId?: string): BallEvent[] {
  const matchId = match?.id ?? "";
  const altMatchId = streamMatchId && streamMatchId !== matchId ? streamMatchId : "";
  const currentScore = match?.currentScore ?? null;
  const wicketsLost = match?.wicketsLost ?? null;
  const ballsLeft = match?.ballsLeft ?? null;

  const prevSnapRef = useRef<ScoreboardSnap | null>(null);
  // Latest match snapshot, so the async seed-failure path can backfill at once.
  const matchRef = useRef<Match | undefined>(match);
  matchRef.current = match;

  // True only after a real WS commentary frame arrives for THIS match.
  const wsCommentarySeenRef = useRef(false);
  // Exact history applied — never overwrite it with a guess.
  const seededRef = useRef(false);
  // Exact history unavailable (404 / old aggregate-only match).
  const seedFailedRef = useRef(false);
  // The one-time score-based backfill has run (only used when seed failed).
  const backfilledRef = useRef(false);

  const [balls, setBalls] = useState<BallEvent[]>(() => padThisOverBalls([]));

  const renderThisOver = () => {
    if (!matchId) {
      setBalls(padThisOverBalls([]));
      return;
    }
    const current = matchRef.current;
    const bowled = current ? ballsBowledFromSnap(snapFromMatch(current)) : undefined;
    setBalls(currentOverFromList(loadBallLog(matchId), bowled));
  };

  const syncLogToScoreboard = (id: string, snap: ScoreboardSnap) => {
    const bowled = ballsBowledFromSnap(snap);
    const log = loadBallLog(id);
    const trimmed = trimBallLogToBowled(log, bowled);
    if (trimmed.length !== log.length) {
      setBallLog(id, trimmed);
    }
  };

  useEffect(() => {
    wsCommentarySeenRef.current = false;
    seededRef.current = false;
    seedFailedRef.current = false;
    backfilledRef.current = false;
    prevSnapRef.current = null;
  }, [matchId]);

  // Best-effort score-based backfill for late joins when exact history is absent.
  const inferBackfill = (id: string) => {
    if (backfilledRef.current || wsCommentarySeenRef.current) return;
    const current = matchRef.current;
    if (!current) return;

    const snap = snapFromMatch(current);
    const bowled = ballsBowledFromSnap(snap);
    if (bowled <= 0) return;

    const legalLogged = loadBallLog(id).filter(isLegalBallEvent).length;
    if (legalLogged !== bowled) {
      setBallLog(id, distributeRunsAcrossBalls(bowled, snap.currentScore, snap.wicketsLost));
    }
    backfilledRef.current = true;
  };

  // Seed "This over" with EXACT ordered balls on load. WS commentary then appends.
  useEffect(() => {
    if (!matchId) return;

    let cancelled = false;

    tradingService
      .fetchMatchEvents(altMatchId || matchId, 6)
      .then((events) => {
        if (cancelled) return;
        const ordered = events.map(ballEventFromHistory);
        if (ordered.length > 0) {
          setBallLog(matchId, ordered);
          seededRef.current = true;
        } else {
          seedFailedRef.current = true;
          inferBackfill(matchId);
        }
      })
      .catch(() => {
        if (cancelled) return;
        seedFailedRef.current = true;
        inferBackfill(matchId);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, altMatchId]);

  // Render "this over" from the log, sliced by the live scoreboard (balls bowled).
  // Must re-run when the scoreboard changes — not only when the ball log writes —
  // so 2.3 overs shows 3 balls, not a full 6-ball over from a partial log.
  useEffect(() => {
    if (!matchId) return;

    renderThisOver();
    return subscribeBallLog(matchId, renderThisOver);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, currentScore, wicketsLost, ballsLeft]);

  // Reconcile the log against the score on every match update.
  useEffect(() => {
    if (!matchId || !match) return;

    const snap = snapFromMatch(match);
    const bowled = ballsBowledFromSnap(snap);
    const log = loadBallLog(matchId);

    // Keep the append-only log aligned to the scoreboard count (drop stale extras).
    syncLogToScoreboard(matchId, snap);

    // Innings reset.
    if (snap.currentScore === 0 && snap.wicketsLost === 0 && bowled <= 0) {
      if (log.length > 0) clearBallLog(matchId);
      prevSnapRef.current = snap;
      backfilledRef.current = true;
      return;
    }

    // Exact history wins — never overwrite with a guess, but trimming above still runs.
    if (seededRef.current) {
      prevSnapRef.current = snap;
      return;
    }

    const prev = prevSnapRef.current;
    const isFirstSync = !prev || prev.matchId !== snap.matchId;

    // While the exact-history seed is still being attempted, don't guess yet.
    if (!seedFailedRef.current && !backfilledRef.current && !wsCommentarySeenRef.current) {
      prevSnapRef.current = snap;
      return;
    }

    // Seed failed: do the one-time score-based backfill (if not already done).
    if (isFirstSync) {
      inferBackfill(matchId);
      prevSnapRef.current = snap;
      return;
    }

    // WS owns appends once it has actually delivered commentary for this match.
    if (wsEnabled && socketManager.isConnected() && wsCommentarySeenRef.current) {
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
      syncLogToScoreboard(matchId, snap);
    }
  }, [matchId, match, currentScore, wicketsLost, ballsLeft]);

  // Live ball-by-ball via WebSocket. The backend broadcasts on the match hex _id;
  // we also subscribe to the short market id as a fallback. Appends always use
  // `matchId` (hex) so the shared log/render key stays consistent across matches.
  useEffect(() => {
    if (!matchId || !wsEnabled) return;

    const onCommentary = (event: MatchCommentaryEvent) => {
      wsCommentarySeenRef.current = true;
      appendBall(matchId, ballEventFromCommentary(event));
    };

    const unsubscribers = [matchId, altMatchId]
      .filter((id): id is string => Boolean(id))
      .map((id) => matchStream.subscribeMatchCommentary(id, onCommentary));

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [matchId, altMatchId]);

  return matchId ? balls : padThisOverBalls([]);
}
