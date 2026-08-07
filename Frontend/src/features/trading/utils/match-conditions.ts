import type { Match } from "@/types";

/**
 * Why a fixture is not behaving normally — a weather delay, a shortened match,
 * a revised target. The provider reports the phase but never the cause, so the
 * copy names rain/light as the usual reason without asserting it as fact.
 */
export interface MatchConditionNotice {
  /** Stable key, handy for React keys and tests. */
  kind: "super_over" | "revised_target" | "reduced_overs" | "interrupted" | "delayed" | "abandoned";
  /** Headline, e.g. "Reduced to 47 overs a side". */
  title: string;
  /** What it means for the user, especially for trading. */
  detail: string;
  /** "critical" = match is over or unplayable; "warning" = still expected to play. */
  tone: "warning" | "critical";
}

function normalizePhase(phase?: string | null): string {
  return (phase ?? "").trim().toLowerCase().replace(/\.+$/, "").replace(/\s+/g, " ");
}

function hasBlocker(match: Match, blocker: string): boolean {
  return (match.tradingBlockers ?? []).some(
    (value) => (value ?? "").trim().toLowerCase().replace(/[\s.-]+/g, "_") === blocker
  );
}

/** Per-innings over limit in force, falling back to the ball count. */
export function scheduledOversFor(match?: Match | null): number | undefined {
  if (!match) return undefined;
  if (typeof match.scheduledOvers === "number" && match.scheduledOvers > 0) {
    return match.scheduledOvers;
  }
  if (typeof match.scheduledBalls === "number" && match.scheduledBalls > 0) {
    return Math.floor(match.scheduledBalls / 6);
  }
  return undefined;
}

export function matchConditionNotice(match?: Match | null): MatchConditionNotice | null {
  if (!match) return null;

  if (hasBlocker(match, "super_over")) {
    return {
      kind: "super_over",
      title: "Super over",
      detail: "The match is being decided by a super over. Trading stays closed.",
      tone: "warning",
    };
  }

  if (hasBlocker(match, "revised_target")) {
    return {
      kind: "revised_target",
      title: "Revised target (DLS)",
      detail:
        "Rain has forced a Duckworth-Lewis-Stern revision. Scores stay live, but trading is suspended while the target is recalculated.",
      tone: "warning",
    };
  }

  if (match.reducedOvers || hasBlocker(match, "reduced_overs")) {
    const overs = scheduledOversFor(match);
    return {
      kind: "reduced_overs",
      title: overs ? `Reduced to ${overs} overs a side` : "Reduced-overs match",
      detail:
        "Overs were cut after a stoppage — usually rain or bad light. Live scores keep updating, but trading is suspended because pricing assumes a full-length match.",
      tone: "warning",
    };
  }

  const phase = normalizePhase(match.providerPhase);

  if (phase.startsWith("aban")) {
    return {
      kind: "abandoned",
      title: "Match abandoned",
      detail: "Play has been called off, typically because of rain or an unfit ground.",
      tone: "critical",
    };
  }

  if (phase === "int" || phase.startsWith("interrupt")) {
    return {
      kind: "interrupted",
      title: "Play interrupted",
      detail:
        "Play has stopped — usually rain or bad light. Trading is paused until the match restarts.",
      tone: "warning",
    };
  }

  if (phase.startsWith("delay") || phase.startsWith("postp")) {
    const postponed = phase.startsWith("postp");
    return {
      kind: "delayed",
      title: postponed ? "Match postponed" : "Start delayed",
      detail: postponed
        ? "The fixture has been pushed to another day, usually because of weather."
        : "The start has been pushed back — usually rain or wet-ground conditions. Trading opens once play begins.",
      tone: postponed ? "critical" : "warning",
    };
  }

  return null;
}

/** Compact form for cards and strips, e.g. "Reduced · 47 ov". */
export function matchConditionBadge(match?: Match | null): string {
  const notice = matchConditionNotice(match);
  if (!notice) return "";
  if (notice.kind === "reduced_overs") {
    const overs = scheduledOversFor(match);
    return overs ? `Reduced · ${overs} ov` : "Reduced overs";
  }
  return notice.title;
}
