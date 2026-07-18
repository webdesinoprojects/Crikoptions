import type {
  BowlerStats,
  Match,
  MatchPulse,
  MomentumLevel,
  OverBall,
  PressureLevel,
  VolatilityLevel,
} from "@/types";

export type OverBallVariant = "dot" | "run" | "boundary" | "wicket" | "extra";
export type PulseTone = "cyan" | "emerald" | "amber" | "red" | "muted";

export interface MatchPulseDisplay {
  lastWicket: string;
  momentum: string;
  momentumTone: PulseTone;
  marketVolatility: string;
  volatilityTone: PulseTone;
  pressure: string;
  pressureTone: PulseTone;
}

export interface OnFieldMatrixState {
  showWaiting: boolean;
  waitingHint?: string;
  showLiveBadge: boolean;
  liveContext: Match["liveContext"];
  matchPulse: MatchPulseDisplay;
  thisOver: OverBall[];
  strikerStrikeRate: string;
  nonStrikerStrikeRate: string;
  bowlerFigures: string;
  bowlerEconomy: string;
}

const DEFAULT_MATCH_PULSE: MatchPulseDisplay = {
  lastWicket: "No wicket this over",
  momentum: "Even phase",
  momentumTone: "cyan",
  marketVolatility: "Stable",
  volatilityTone: "emerald",
  pressure: "Balanced phase",
  pressureTone: "cyan",
};

export function formatBowlerFigures(b: BowlerStats): string {
  const overs = Math.floor(b.balls / 6);
  const rem = b.balls % 6;
  return `${overs}.${rem}-${b.maidens}-${b.runs}-${b.wickets}`;
}

export function formatStrikeRate(runs: number, balls: number): string {
  if (balls <= 0) return "-";
  return ((runs / balls) * 100).toFixed(1);
}

export function formatBowlerEconomy(bowler: BowlerStats): string {
  if (bowler.balls <= 0) return "-";
  return (bowler.runs / (bowler.balls / 6)).toFixed(2);
}

export function overBallLabel(ball: OverBall): string {
  if (ball.isWicket) return "W";
  if (ball.extra === "wide") return "Wd";
  if (ball.extra === "noball") return "Nb";
  return String(ball.runs);
}

export function overBallVariant(ball: OverBall): OverBallVariant {
  if (ball.isWicket) return "wicket";
  if (ball.extra) return "extra";
  if (ball.runs >= 4) return "boundary";
  if (ball.runs === 0) return "dot";
  return "run";
}

export function overBallChipClassName(variant: OverBallVariant): string {
  switch (variant) {
    case "wicket":
      return "border-red-300/45 bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.22)]";
    case "boundary":
      return "border-cyan-200/45 bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.2)]";
    case "extra":
      return "border-amber-300/40 bg-amber-400/20 text-amber-100";
    case "run":
      return "border-teal-300/35 bg-teal-400/14 text-teal-100";
    case "dot":
    default:
      return "border-slate-400/20 bg-slate-400/12 text-slate-200";
  }
}

export function hasLiveContext(match?: Match | null): boolean {
  return Boolean(
    match?.liveContext?.striker?.name &&
      match?.liveContext?.nonStriker?.name &&
      match?.liveContext?.bowler?.name
  );
}

export function shouldShowWaitingForFeed(match?: Match | null): boolean {
  const isSportmonks = match?.dataSource === "sportmonks";
  const feedReady = !isSportmonks || match?.feedState === "healthy";
  return !hasLiveContext(match) || !feedReady;
}

export function waitingHintForFeed(match?: Match | null): string | undefined {
  const isSportmonks = match?.dataSource === "sportmonks";
  if (!isSportmonks) return undefined;

  const parts: string[] = [];
  if (match?.feedState !== "healthy") {
    parts.push(`Feed ${(match?.feedState ?? "warming").replaceAll("_", " ")}`);
  }
  if (match?.tradingBlockers?.length) {
    parts.push(match.tradingBlockers.map((b) => b.replaceAll("_", " ")).join(", "));
  }
  const validUntil = match?.feedValidUntil ? Date.parse(match.feedValidUntil) : Number.NaN;
  if (Number.isFinite(validUntil) && validUntil < Date.now()) {
    parts.push("poll stale");
  }
  if (!hasLiveContext(match) && match?.feedState === "healthy") {
    parts.push("player feed pending");
  }

  return parts.length > 0 ? parts.join(" · ") : undefined;
}

export function isHealthyLiveFeed(match?: Match | null): boolean {
  return match?.status === "LIVE" && (!match?.dataSource || match.dataSource !== "sportmonks" || match.feedState === "healthy");
}

function momentumTone(level?: MomentumLevel): PulseTone {
  switch (level) {
    case "attacking":
      return "emerald";
    case "defensive":
      return "muted";
    case "even":
    default:
      return "cyan";
  }
}

function volatilityTone(level?: VolatilityLevel): PulseTone {
  switch (level) {
    case "high":
      return "red";
    case "moderate":
      return "amber";
    case "stable":
    default:
      return "emerald";
  }
}

function pressureTone(level?: PressureLevel): PulseTone {
  switch (level) {
    case "chase":
    case "defend":
      return "amber";
    case "complete":
      return "emerald";
    case "balanced":
    default:
      return "cyan";
  }
}

export function deriveMatchPulseDisplay(matchPulse?: MatchPulse | null): MatchPulseDisplay {
  if (!matchPulse) return DEFAULT_MATCH_PULSE;

  return {
    lastWicket: matchPulse.lastWicket || DEFAULT_MATCH_PULSE.lastWicket,
    momentum: matchPulse.momentum || DEFAULT_MATCH_PULSE.momentum,
    momentumTone: momentumTone(matchPulse.momentumLevel),
    marketVolatility: matchPulse.marketVolatility || DEFAULT_MATCH_PULSE.marketVolatility,
    volatilityTone: volatilityTone(matchPulse.volatilityLevel),
    pressure: matchPulse.pressure || DEFAULT_MATCH_PULSE.pressure,
    pressureTone: pressureTone(matchPulse.pressureLevel),
  };
}

export function buildOnFieldMatrixState(match?: Match | null): OnFieldMatrixState {
  const liveContext = match?.liveContext;
  const showWaiting = shouldShowWaitingForFeed(match);

  return {
    showWaiting,
    waitingHint: showWaiting ? waitingHintForFeed(match) : undefined,
    showLiveBadge: isHealthyLiveFeed(match),
    liveContext,
    matchPulse: deriveMatchPulseDisplay(match?.matchPulse),
    thisOver: match?.thisOver ?? [],
    strikerStrikeRate: liveContext
      ? formatStrikeRate(liveContext.striker.runs, liveContext.striker.balls)
      : "-",
    nonStrikerStrikeRate: liveContext
      ? formatStrikeRate(liveContext.nonStriker.runs, liveContext.nonStriker.balls)
      : "-",
    bowlerFigures: liveContext ? formatBowlerFigures(liveContext.bowler) : "—",
    bowlerEconomy: liveContext ? formatBowlerEconomy(liveContext.bowler) : "—",
  };
}
