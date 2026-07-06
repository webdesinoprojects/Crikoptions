"use client";

import { useEffect, useRef, useState } from "react";
import { Match } from "@/types";
import { MatchCommentaryEvent, matchStream } from "@/lib/websocket/match.stream";
import {
  BallEvent,
  ballEventFromCommentary,
  ballEventFromHistory,
  ballsBowledFromSnap,
  currentOverFromList,
  isLegalBallEvent,
  padThisOverBalls,
  ScoreboardSnap,
  snapFromMatch,
} from "../utils/terminal-context";
import { tradingService } from "../services/trading.service";
import { appendBall, clearBallLog, loadBallLog, setBallLog, subscribeBallLog } from "../utils/ball-log";

const wsEnabled = process.env.NEXT_PUBLIC_WS_ENABLED === "true";

/**
 * "This over" balls for live matches.
 *
 * Data source priority:
 * 1. WS match:commentary — append live balls in real time (highest fidelity).
 * 2. GET /matches/{id}/events?limit=24 — snapshot on mount / innings change.
 * 3. Score-delta inference — fallback when neither WS nor API is available.
 *
 * CRITICAL DESIGN RULES:
 * - We NEVER trim the log against the scoreboard mid-over. Extras (wides/no-balls)
 *   mean the log can legitimately have MORE entries than ballsBowled for the over.
 * - REST API results only replace the log when the API is clearly AHEAD of the WS
 *   log (more legal balls), preventing the API from clobbering fresh WS events.
 * - Score-delta inference is ONLY used when both WS and API are unavailable.
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
  // Track the highest legal-ball count we've seen in the WS log for this over.
  const wsLegalHighwaterRef = useRef(0);
  const historyRequestRef = useRef(0);
  const inningsRef = useRef(innings);

  const [balls, setBalls] = useState<BallEvent[]>(() => padThisOverBalls([]));

  // Keep matchRef current for use inside callbacks.
  useEffect(() => {
    matchRef.current = match;
  }, [match]);

  // When the over or innings changes, we recalculate balls from scratch.
  const renderThisOver = () => {
    if (!matchId) {
      setBalls(padThisOverBalls([]));
      return;
    }
    const current = matchRef.current;
    const snap = current ? snapFromMatch(current) : null;
    const bowled = snap ? ballsBowledFromSnap(snap) : undefined;

    const log = loadBallLog(matchId);
    const legalInLog = log.filter(isLegalBallEvent).length;

    // Use the HIGHER of the two counts so WS events are never dropped by a
    // stale REST scoreboard that hasn't ticked yet.
    const effectiveBowled =
      bowled !== undefined ? Math.max(bowled, legalInLog) : legalInLog;

    setBalls(currentOverFromList(log, effectiveBowled > 0 ? effectiveBowled : undefined));
  };

  // Reset all state when match or innings changes.
  useEffect(() => {
    wsCommentarySeenRef.current = false;
    wsLegalHighwaterRef.current = 0;
    prevSnapRef.current = null;
    inningsRef.current = innings;
  }, [matchId, innings]);

  // --- REST API snapshot (on mount + innings change ONLY) ---
  // We intentionally do NOT re-fetch on every score tick to prevent the API
  // from clobbering fresh WS events (race condition). We only re-fetch when:
  //   a) the match / innings changes (hard reset)
  //   b) the WS has never fired (wsCommentarySeenRef is false) and a new over starts
  useEffect(() => {
    if (!matchId || !match) return;

    let cancelled = false;
    const requestId = ++historyRequestRef.current;
    const ids = Array.from(new Set([matchId, altMatchId].filter(Boolean)));
    const snap = snapFromMatch(match);
    const bowled = ballsBowledFromSnap(snap);

    const trySync = async (index: number): Promise<void> => {
      if (cancelled || index >= ids.length) {
        return;
      }
      try {
        // Fetch enough balls to cover a full over including all possible extras.
        const events = await tradingService.fetchMatchEvents(ids[index], 24);
        if (cancelled || requestId !== historyRequestRef.current) return;

        const ordered = events.map(ballEventFromHistory);
        if (ordered.length === 0 && bowled > 0) {
          // API returned nothing but scoreboard says balls were bowled — try alt id.
          await trySync(index + 1);
          return;
        }

        // Only replace the log if the API result has at least as many legal balls
        // as the WS log — this prevents the API from rolling back WS events.
        const apiLegal = ordered.filter(isLegalBallEvent).length;
        const currentLog = loadBallLog(matchId);
        const currentLegal = currentLog.filter(isLegalBallEvent).length;

        if (apiLegal >= currentLegal) {
          // API has fresher or equal data — use it.
          setBallLog(matchId, ordered);
        }
        // If API is behind the WS, silently discard to keep WS events.
      } catch {
        if (!cancelled) await trySync(index + 1);
      }
    };

    void trySync(0);
    return () => {
      cancelled = true;
    };
  // Re-fetch ONLY on match/innings change — not on every score tick.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, altMatchId, innings]);

  // --- Re-render when scoreboard OR ball log changes ---
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

  // --- Score-delta inference (fallback only) ---
  // Only used when WS has never fired. Detects a new legal ball by comparing
  // the scoreboard snapshot to the previous one.
  useEffect(() => {
    if (!matchId || !match) return;
    if (wsCommentarySeenRef.current) {
      // WS is live — don't infer, trust the WS events only.
      const snap = snapFromMatch(match);
      prevSnapRef.current = snap;
      return;
    }

    const snap = snapFromMatch(match);
    const bowled = ballsBowledFromSnap(snap);

    // Brand new match / innings — don't infer, just snapshot.
    if (snap.currentScore === 0 && snap.wicketsLost === 0 && bowled <= 0) {
      const log = loadBallLog(matchId);
      if (log.length > 0) clearBallLog(matchId);
      prevSnapRef.current = snap;
      return;
    }

    const prev = prevSnapRef.current;
    prevSnapRef.current = snap;

    if (!prev || prev.matchId !== snap.matchId) {
      // First sync for this match — nothing to diff.
      return;
    }

    // Detect a new legal ball: ballsBowled must have increased by exactly 1.
    const prevBowled = ballsBowledFromSnap(prev);
    const bowledDelta = bowled - prevBowled;
    const scoreDelta = snap.currentScore - prev.currentScore;
    const wicketDelta = snap.wicketsLost - prev.wicketsLost;

    if (bowledDelta <= 0) {
      // No new legal ball. Check for wide (score up, balls same).
      if (bowledDelta === 0 && scoreDelta === 1 && wicketDelta === 0) {
        appendBall(matchId, { label: "Wd", kind: "run", detail: "Wide" });
      }
      return;
    }

    // A legal ball was bowled. Check for new over (reset displayed over).
    const prevInOver = prevBowled % 6;
    const newInOver = bowled % 6;
    if (newInOver === 1 && prevInOver === 0 && prevBowled > 0) {
      // Over just completed — clear the log and start fresh for the new over.
      clearBallLog(matchId);
    }

    // Infer the ball outcome.
    if (wicketDelta === 1 && scoreDelta === 0) {
      appendBall(matchId, { label: "W", kind: "wicket" });
    } else if (scoreDelta === 6) {
      appendBall(matchId, { label: "6", kind: "six" });
    } else if (scoreDelta === 4) {
      appendBall(matchId, { label: "4", kind: "four" });
    } else if (scoreDelta > 0 && scoreDelta <= 3) {
      appendBall(matchId, { label: String(scoreDelta), kind: "run" });
    } else {
      appendBall(matchId, { label: "0", kind: "dot" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, currentScore, wicketsLost, ballsLeft, innings]);

  // --- Live ball-by-ball via WebSocket ---
  useEffect(() => {
    if (!matchId || !wsEnabled) return;

    const onCommentary = (event: MatchCommentaryEvent) => {
      const eventInnings = Number(event.innings ?? innings);
      if (innings && Number.isFinite(eventInnings) && eventInnings !== innings) {
        return;
      }

      const ball = ballEventFromCommentary(event);
      wsCommentarySeenRef.current = true;

      // Track legal ball highwater for this over so inference doesn't interfere.
      if (isLegalBallEvent(ball)) {
        wsLegalHighwaterRef.current += 1;
      }

      appendBall(matchId, ball);
    };

    const unsubscribers = [matchId, altMatchId]
      .filter((id): id is string => Boolean(id))
      .map((id) => matchStream.subscribeMatchCommentary(id, onCommentary));

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [matchId, altMatchId, innings]);

  return matchId ? balls : padThisOverBalls([]);
}
