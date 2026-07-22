import type { Match } from "./match";

/** Soft sync — display only; must NOT disable Buy/Sell. */
export const SOFT_TRADE_BLOCKERS = new Set(["reconciling", "warming"]);

/** Hard gates — Buy/Sell must stay disabled. */
export const HARD_TRADE_BLOCKERS = new Set([
  "feed_stale",
  "innings_break",
  "finalizing",
  "not_live",
  "quota_limited",
  "unsupported",
  "league_disabled",
  "global_kill",
  "manual",
  "cancellation_pending",
]);

/** Feed states that are OK (or soft-syncing) for trading. */
export const SOFT_FEED_STATES = new Set(["healthy", "reconciling", "warming", ""]);

export type TradeGateMatch = {
  status?: string;
  feedState?: string;
  tradingState?: string;
  tradingBlockers?: string[];
  tradable?: boolean;
  dataSource?: string;
};

/**
 * Authoritative trade gate for live matches.
 * SYNCING / soft sync must never disable Buy/Sell.
 * Prefer backend `tradable: true`, but override `tradable: false` when the only
 * reasons are soft sync (reconciling/warming) — backend sometimes lags.
 */
export function canTradeMatch(match?: TradeGateMatch | null): boolean {
  if (!match) return false;

  const status = normalizeToken(match.status);
  if (status !== "live") return false;

  const feed = normalizeToken(match.feedState);
  const rawBlockers = (match.tradingBlockers ?? []).map(normalizeToken);
  const hardBlockers = rawBlockers.filter((b) => HARD_TRADE_BLOCKERS.has(b));
  const softOnly =
    rawBlockers.length === 0 || rawBlockers.every((b) => SOFT_TRADE_BLOCKERS.has(b));
  const softOrHealthyFeed = SOFT_FEED_STATES.has(feed);

  // Hard blockers always win.
  if (hardBlockers.length > 0) return false;
  if (feed === "stale" || feed === "feed_stale") return false;
  if (feed === "quota_limited" || feed === "unsupported" || feed === "finalizing" || feed === "terminal") {
    return false;
  }

  // Soft sync / healthy live match → always tradable (ignore tradingState=blocked).
  if (softOrHealthyFeed && softOnly) {
    return true;
  }

  if (typeof match.tradable === "boolean") {
    return match.tradable;
  }

  const tradingState = normalizeToken(match.tradingState);
  if (tradingState && tradingState !== "open") return false;

  return softOrHealthyFeed;
}

export function hasHardTradeBlockers(blockers?: string[] | null): boolean {
  return (blockers ?? []).some((b) => HARD_TRADE_BLOCKERS.has(normalizeToken(b)));
}

export function isSoftSyncFeed(feedState?: string | null): boolean {
  const feed = normalizeToken(feedState);
  return feed === "reconciling" || feed === "warming";
}

export function tradeBlockerMessage(match?: TradeGateMatch | null): string {
  if (!match) return "Trading unavailable";
  if (canTradeMatch(match)) return "";

  const status = normalizeToken(match.status);
  if (status !== "live") {
    if (status === "upcoming") return "Trading opens when match goes live";
    if (status === "innings_break") return "Trading paused during innings break";
    return "Trading unavailable for this match state";
  }

  const hard = (match.tradingBlockers ?? [])
    .map(normalizeToken)
    .filter((b) => HARD_TRADE_BLOCKERS.has(b));
  if (hard.length > 0) {
    return hard.map((b) => b.replaceAll("_", " ")).join(", ");
  }

  const feed = normalizeToken(match.feedState);
  if (feed === "stale" || feed === "feed_stale") return "Feed stale — trading paused";
  if (feed === "quota_limited") return "Provider quota limited — trading paused";
  if (feed === "unsupported") return "Feed unsupported — trading paused";

  return "Trading unavailable";
}

export type TradeGateMarket = {
  status?: string | null;
  blockers?: string[] | null;
};

/**
 * Why the contract itself is untradable, when the match looks fine.
 * Returns "" when the market is not the blocking side.
 */
export function marketBlockerMessage(market?: TradeGateMarket | null): string {
  if (!market) return "Contract unavailable";

  const hard = (market.blockers ?? []).map(normalizeToken).filter((b) => HARD_TRADE_BLOCKERS.has(b));
  if (hard.length > 0) {
    return `Contract paused — ${hard.map((b) => b.replaceAll("_", " ")).join(", ")}`;
  }

  const status = normalizeToken(market.status);
  if (status === "settled") return "Contract settled";
  if (status === "suspended") return "Contract suspended";
  return "";
}

/** @deprecated Prefer canTradeMatch — kept for existing imports. */
export function isMatchTradable(match?: Match, _now = Date.now()): boolean {
  return canTradeMatch(match);
}

function normalizeToken(value?: string | null): string {
  return (value ?? "").trim().toLowerCase().replace(/[\s.-]+/g, "_");
}
