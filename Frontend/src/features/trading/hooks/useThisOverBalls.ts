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
 * "This over" balls for live matches — simulator, admin, or real API.
 *
 * 1. GET /matches/{id}/events?limit=6 — exact history on load
 * 2. WS match:commentary:{hexId} (+ short id fallback) — append live balls
 * 3. Score-delta inference — only when events API unavailable AND no WS yet
 */
export function useThisOverBalls(match?: Match, streamMatchId?: string): BallEvent[] {
  const matchId = match?.id ?? "";
  const altMatchId = streamMatchId && streamMatchId !== matchId ? streamMatchId : "";
  const currentScore = match?.currentScore ?? null;
  const wicketsLost = match?.wicketsLost ?? null;
  const ballsLeft = match?.ballsLeft ?? null;
  const innings = match?.innings ?? null;

  const prevSnapRef = useRef<ScoreboardSnap | null>(null);
  const matchRef = useRef<Match | undefined>(match);

  const wsCommentarySeenRef = useRef(false);
  const historyFailedRef = useRef(false);
  const historyRequestRef = useRef(0);

  const [balls, setBalls] = useState<BallEvent[]>(() => padThisOverBalls([]));

  useEffect(() => {
    matchRef.current = match;
  }, [match]);

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

  const inferBackfill = (id: string) => {
    if (wsCommentarySeenRef.current) return;
    const current = matchRef.current;
    if (!current) return;

    const snap = snapFromMatch(current);
    const bowled = ballsBowledFromSnap(snap);
    if (bowled <= 0) return;

    const legalLogged = loadBallLog(id).filter(isLegalBallEvent).length;
    if (legalLogged !== bowled) {
      setBallLog(id, distributeRunsAcrossBalls(bowled, snap.currentScore, snap.wicketsLost));
    }
  };

  useEffect(() => {
    wsCommentarySeenRef.current = false;
    historyFailedRef.current = false;
    prevSnapRef.current = null;
  }, [matchId, innings]);

  // Keep exact backend history in sync with every scoreboard movement. This is
  // the polling-safe path when WebSocket commentary is unavailable or delayed.
  useEffect(() => {
    if (!matchId || !match) return;

    let cancelled = false;
    const requestId = ++historyRequestRef.current;
    const ids = Array.from(new Set([matchId, altMatchId].filter(Boolean)));
    const snap = snapFromMatch(match);
    const bowled = ballsBowledFromSnap(snap);

    const trySync = async (index: number) => {
      if (cancelled || index >= ids.length) {
        if (!cancelled) {
          if (bowled <= 0) {
            if (loadBallLog(matchId).length > 0) clearBallLog(matchId);
            historyFailedRef.current = false;
            return;
          }
          historyFailedRef.current = true;
          inferBackfill(matchId);
        }
        return;
      }
      try {
        const events = await tradingService.fetchMatchEvents(ids[index], 6);
        if (cancelled || requestId !== historyRequestRef.current) return;
        const ordered = events.map(ballEventFromHistory);
        if (ordered.length > 0 || bowled <= 0) {
          const currentLog = loadBallLog(matchId);
          if (ordered.length > 0) {
            historyFailedRef.current = false;
          }
          if (!sameBallEvents(currentLog, ordered)) {
            if (ordered.length > 0) {
              setBallLog(matchId, ordered);
            } else {
              clearBallLog(matchId);
            }
          }
          if (ordered.length === 0) {
            historyFailedRef.current = false;
          }
          return;
        }
        await trySync(index + 1);
      } catch {
        if (!cancelled) await trySync(index + 1);
      }
    };

    void trySync(0);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, altMatchId, innings, currentScore, wicketsLost, ballsLeft]);

  // Re-render when scoreboard OR ball log changes.
  useEffect(() => {
    if (!matchId) return;

    const initialRender = window.setTimeout(renderThisOver, 0);
    const unsubscribe = subscribeBallLog(matchId, renderThisOver);
    return () => {
      window.clearTimeout(initialRender);
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, currentScore, wicketsLost, ballsLeft, innings]);

  // Reconcile log against scoreboard and use score deltas only if exact history
  // could not be fetched.
  useEffect(() => {
    if (!matchId || !match) return;

    const snap = snapFromMatch(match);
    const bowled = ballsBowledFromSnap(snap);
    const log = loadBallLog(matchId);

    syncLogToScoreboard(matchId, snap);

    if (snap.currentScore === 0 && snap.wicketsLost === 0 && bowled <= 0) {
      if (log.length > 0) clearBallLog(matchId);
      prevSnapRef.current = snap;
      historyFailedRef.current = false;
      wsCommentarySeenRef.current = false;
      return;
    }

    const prev = prevSnapRef.current;
    const isFirstSync = !prev || prev.matchId !== snap.matchId;

    if (isFirstSync) {
      if (historyFailedRef.current) inferBackfill(matchId);
      prevSnapRef.current = snap;
      return;
    }

    if (!historyFailedRef.current) {
      prevSnapRef.current = snap;
      return;
    }

    if (wsEnabled && socketManager.isConnected() && wsCommentarySeenRef.current) {
      prevSnapRef.current = snap;
      return;
    }

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
  }, [matchId, match, currentScore, wicketsLost, ballsLeft, innings]);

  // Live ball-by-ball via WebSocket (hex + short id fallback).
  useEffect(() => {
    if (!matchId || !wsEnabled) return;

    const onCommentary = (event: MatchCommentaryEvent) => {
      const eventInnings = Number(event.innings ?? innings);
      if (innings && Number.isFinite(eventInnings) && eventInnings !== innings) {
        return;
      }
      wsCommentarySeenRef.current = true;
      appendBall(matchId, ballEventFromCommentary(event));
    };

    const unsubscribers = [matchId, altMatchId]
      .filter((id): id is string => Boolean(id))
      .map((id) => matchStream.subscribeMatchCommentary(id, onCommentary));

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [matchId, altMatchId, innings]);

  return matchId ? balls : padThisOverBalls([]);
}

function sameBallEvents(left: BallEvent[], right: BallEvent[]) {
  if (left.length !== right.length) return false;
  return left.every((ball, index) => {
    const other = right[index];
    return ball.label === other?.label && ball.kind === other?.kind && ball.detail === other?.detail;
  });
}
