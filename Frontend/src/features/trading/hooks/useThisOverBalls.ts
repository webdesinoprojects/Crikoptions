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
  matchRef.current = match;

  const wsCommentarySeenRef = useRef(false);
  const seededRef = useRef(false);
  const seedFailedRef = useRef(false);
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

  useEffect(() => {
    wsCommentarySeenRef.current = false;
    seededRef.current = false;
    seedFailedRef.current = false;
    backfilledRef.current = false;
    prevSnapRef.current = null;
  }, [matchId]);

  // Seed exact ball history on load.
  useEffect(() => {
    if (!matchId) return;

    let cancelled = false;
    const ids = [matchId, altMatchId].filter(Boolean);

    const trySeed = async (index: number) => {
      if (cancelled || index >= ids.length) {
        if (!cancelled) {
          seedFailedRef.current = true;
          inferBackfill(matchId);
        }
        return;
      }
      try {
        const events = await tradingService.fetchMatchEvents(ids[index], 6);
        if (cancelled) return;
        const ordered = events.map(ballEventFromHistory);
        if (ordered.length > 0) {
          setBallLog(matchId, ordered);
          seededRef.current = true;
          return;
        }
        await trySeed(index + 1);
      } catch {
        if (!cancelled) await trySeed(index + 1);
      }
    };

    void trySeed(0);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, altMatchId, innings]);

  // Re-render when scoreboard OR ball log changes.
  useEffect(() => {
    if (!matchId) return;

    renderThisOver();
    return subscribeBallLog(matchId, renderThisOver);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, currentScore, wicketsLost, ballsLeft, innings]);

  // Reconcile log against scoreboard.
  useEffect(() => {
    if (!matchId || !match) return;

    const snap = snapFromMatch(match);
    const bowled = ballsBowledFromSnap(snap);
    const log = loadBallLog(matchId);

    syncLogToScoreboard(matchId, snap);

    if (snap.currentScore === 0 && snap.wicketsLost === 0 && bowled <= 0) {
      if (log.length > 0) clearBallLog(matchId);
      prevSnapRef.current = snap;
      backfilledRef.current = true;
      wsCommentarySeenRef.current = false;
      return;
    }

    if (seededRef.current) {
      prevSnapRef.current = snap;
      return;
    }

    const prev = prevSnapRef.current;
    const isFirstSync = !prev || prev.matchId !== snap.matchId;

    if (!seedFailedRef.current && !backfilledRef.current && !wsCommentarySeenRef.current) {
      prevSnapRef.current = snap;
      return;
    }

    if (isFirstSync) {
      inferBackfill(matchId);
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
