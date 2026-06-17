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
  writeBallLog(matchId, list);
}

export function appendBall(matchId: string, ball: BallEvent) {
  const list = loadBallLog(matchId);
  list.push(ball);
  writeBallLog(matchId, list);
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
