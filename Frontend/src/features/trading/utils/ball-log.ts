import { BallEvent } from "./terminal-context";

/**
 * Append-only, click-ordered ball log shared across browser tabs.
 *
 * Uses localStorage (NOT sessionStorage) so the admin tab and the user trading
 * terminal tab stay in sync via the native `storage` event. Each entry is one
 * legal delivery in the exact order it was applied, which guarantees that rapid
 * clicks (e.g. 4 then 6) always render in the same order.
 */

const STORAGE_PREFIX = "crikoptions:balllog:";
export const BALL_LOG_EVENT = "crikoptions:balllog-updated";
const MAX_ENTRIES = 600;

export interface BallLogMerge {
  changed: boolean;
  gapDetected: boolean;
  list: BallEvent[];
}

function storageKey(matchId: string) {
  return `${STORAGE_PREFIX}${matchId}`;
}

function hasWindow() {
  return typeof window !== "undefined";
}

export function loadBallLog(matchId: string): BallEvent[] {
  if (!hasWindow() || !matchId) return [];

  try {
    const raw = window.localStorage.getItem(storageKey(matchId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BallEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeBallLog(matchId: string, list: BallEvent[]) {
  if (!hasWindow() || !matchId) return;

  try {
    const trimmed = list.slice(-MAX_ENTRIES);
    window.localStorage.setItem(storageKey(matchId), JSON.stringify(trimmed));
    notifyBallLog(matchId);
  } catch {
    // localStorage may be unavailable (private mode / quota) — fail silently.
  }
}

export function setBallLog(matchId: string, list: BallEvent[]) {
  writeBallLog(matchId, normalizeBallLog(list));
}

export function appendBall(matchId: string, ball: BallEvent): BallLogMerge {
  const result = mergeBallLog(loadBallLog(matchId), ball);
  if (result.changed) writeBallLog(matchId, result.list);
  return result;
}

/** Apply one immutable delivery revision without trusting arrival order. */
export function mergeBallLog(current: readonly BallEvent[], ball: BallEvent): BallLogMerge {
  const list = [...current];
  const incomingSequence = validSequence(ball.sequence);
  const previousHighwater = highestBallSequence(list);
  const gapDetected = incomingSequence !== undefined && incomingSequence > previousHighwater + 1;

  if (ball.eventId) {
    const existing = list.findIndex((item) => item.eventId === ball.eventId);
    if (existing >= 0) {
      if ((ball.revision ?? 0) <= (list[existing].revision ?? 0)) {
        return { changed: false, gapDetected: false, list };
      }
      list[existing] = ball;
      return { changed: true, gapDetected, list: normalizeBallLog(list) };
    }
  }

  list.push(ball);
  return { changed: true, gapDetected, list: normalizeBallLog(list) };
}

/** Keep only the newest revision per stable event ID and sort known sequences. */
export function normalizeBallLog(input: readonly BallEvent[]): BallEvent[] {
  const newestByID = new Map<string, { ball: BallEvent; index: number }>();
  const anonymous: Array<{ ball: BallEvent; index: number }> = [];

  input.forEach((ball, index) => {
    if (!ball.eventId) {
      anonymous.push({ ball, index });
      return;
    }
    const current = newestByID.get(ball.eventId);
    if (!current || (ball.revision ?? 0) > (current.ball.revision ?? 0)) {
      newestByID.set(ball.eventId, { ball, index });
    }
  });

  return [...anonymous, ...newestByID.values()]
    .sort((left, right) => {
      const leftSequence = validSequence(left.ball.sequence);
      const rightSequence = validSequence(right.ball.sequence);
      if (leftSequence !== undefined && rightSequence !== undefined && leftSequence !== rightSequence) {
        return leftSequence - rightSequence;
      }
      if (leftSequence !== undefined && rightSequence === undefined) return 1;
      if (leftSequence === undefined && rightSequence !== undefined) return -1;
      return left.index - right.index;
    })
    .map(({ ball }) => ball);
}

export function highestBallSequence(list: readonly BallEvent[]): number {
  return list.reduce((highest, ball) => Math.max(highest, validSequence(ball.sequence) ?? 0), 0);
}

function validSequence(value?: number): number | undefined {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

export function clearBallLog(matchId: string) {
  if (!hasWindow() || !matchId) return;
  window.localStorage.removeItem(storageKey(matchId));
  notifyBallLog(matchId);
}

export function notifyBallLog(matchId: string) {
  if (!hasWindow() || !matchId) return;
  window.dispatchEvent(new CustomEvent(BALL_LOG_EVENT, { detail: { matchId } }));
}

export function subscribeBallLog(matchId: string, onUpdate: () => void) {
  if (!hasWindow() || !matchId) return () => undefined;

  const onCustom = (event: Event) => {
    const detail = (event as CustomEvent<{ matchId: string }>).detail;
    if (detail?.matchId === matchId) onUpdate();
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey(matchId)) onUpdate();
  };

  window.addEventListener(BALL_LOG_EVENT, onCustom);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(BALL_LOG_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
