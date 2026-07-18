import type { Match } from "@/types";

export function isLiveOrBreak(match: Match): boolean {
  return match.status === "LIVE" || match.status === "INNINGS_BREAK";
}

export function isUpcomingMatch(match: Match): boolean {
  return match.status === "UPCOMING";
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
  if (match.status === "UPCOMING" || match.tradingState === "blocked") {
    return "Trading opens when match goes live";
  }
  return "Trading is currently unavailable for this match.";
}
