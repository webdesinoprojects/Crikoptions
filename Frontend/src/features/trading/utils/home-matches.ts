import type { Match } from "@/types";
import { matchConditionNotice } from "./match-conditions";

/** How many soonest upcoming fixtures to pin beside live cards in the terminal strip. */
export const HOME_STRIP_UPCOMING_LIMIT = 10;

export function isLiveOrBreak(match: Match): boolean {
  return match.status === "LIVE" || match.status === "INNINGS_BREAK";
}

export function isUpcomingMatch(match: Match): boolean {
  return match.status === "UPCOMING";
}

/** Check if a match is an offline/replay test or demo match (CSK vs MI, RCB vs KKR, etc.) */
export function isSimulatorMatch(match?: Match | null): boolean {
  if (!match) return false;
  if (match.status === "UPCOMING") return false;
  if (match.dataSource === "simulator" || match.dataSource === "demo") return true;
  const idStr = String(match.id ?? "").toLowerCase();
  const titleStr = String(match.title ?? "").toLowerCase();
  if (idStr.includes("csk") || idStr.includes("rcb") || idStr.includes("sim") || idStr.includes("demo")) return true;
  if (titleStr.includes("csk") || titleStr.includes("mi vs") || titleStr.includes("rcb") || titleStr.includes("kkr") || titleStr.includes("warm up") || titleStr.includes("24/7")) return true;
  return false;
}

/** Home strip order: live/break first, then upcoming by start time. */
export function sortHomeMatches(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => {
    const aLive = isLiveOrBreak(a) ? 0 : 1;
    const bLive = isLiveOrBreak(b) ? 0 : 1;
    if (aLive !== bLive) return aLive - bLive;
    return new Date(a.startTime ?? 0).getTime() - new Date(b.startTime ?? 0).getTime();
  });
}

/**
 * Trading terminal strip: all live/break fixtures from home, plus the N soonest
 * upcoming fixtures from GET /matches/upcoming. Dedupes by id so a match that
 * just went live is not shown twice while caches catch up.
 */
export function selectHomeStripMatches(
  homeMatches: Match[],
  upcomingMatches: Match[],
  upcomingLimit = HOME_STRIP_UPCOMING_LIMIT
): Match[] {
  const filteredHome = homeMatches.filter((match) => {
    const title = String(match.title ?? "").toUpperCase();
    if (title.includes("EZONE") || title.includes("SZONE")) return false;
    return true;
  });

  const live = sortHomeMatches(filteredHome.filter(isLiveOrBreak));
  const liveIds = new Set(live.map((match) => match.id));

  // Every fixture shown here comes from the feed. There is deliberately no
  // padding with invented matches when the list is short: a fabricated fixture
  // carrying dataSource "criclive" is indistinguishable from a real one and
  // would offer a market that cannot settle.
  const upcoming = sortHomeMatches(
    upcomingMatches.filter((match) => isUpcomingMatch(match) && !liveIds.has(match.id))
  ).slice(0, Math.max(0, upcomingLimit));

  return [...live, ...upcoming];
}

export function formatMatchStartTime(startTime?: string): string {
  if (!startTime) return "TBD";
  const date = new Date(startTime);
  if (!Number.isFinite(date.getTime())) return "TBD";

  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return time;

  const day = date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  return `${day} · ${time}`;
}

export function tradingOpensMessage(match?: Match | null): string {
  if (!match) return "Trading opens when the match goes live.";
  // A rain delay or a shortened match is the actual reason trading is shut.
  // Saying "opens when the match goes live" there is simply wrong — it may
  // already be live, or may never start.
  const notice = matchConditionNotice(match);
  if (notice) return notice.title;
  if (match.status === "UPCOMING" || match.tradingState === "blocked") {
    return "Trading opens when match goes live";
  }
  return "Trading is currently unavailable for this match.";
}
