import { BackendMarket } from "@/lib/adapters/market.adapter";
import { Match } from "@/types";
import { CalculatedPrice, CalculatePricePayload, MatchBallHistoryEvent, OptionChainStrike } from "../services/trading.service";

export type BallKind = "empty" | "dot" | "run" | "four" | "six" | "wicket" | "bowled" | "lbw" | "caught" | "runOut";

export interface BallEvent {
  eventId?: string;
  sequence?: number;
  revision?: number;
  label: string;
  kind: BallKind;
  detail?: string;
}

export interface ChainRow {
  strike: number;
  premium: number;
  bid: number;
  ask: number;
  bidQty: number;
  askQty: number;
  moneyness: "ITM" | "ATM" | "OTM";
}

export function buildPricePayload(match?: Match, market?: BackendMarket): CalculatePricePayload | undefined {
  if (!match) return undefined;

  const innings = match.innings ?? 1;
  const totalBalls = totalBallsForFormat(match.format);
  const currentScoreDisplay = currentInningsScoreParts(match);
  const currentScore = numberFromDisplay(currentScoreDisplay.runs);
  const wicketsLost = numberFromDisplay(currentScoreDisplay.wickets);
  const ballsLeft = Math.max(0, Math.min(totalBalls, match.ballsLeft ?? totalBalls));

  if (innings === 2) {
    const targetScore = Math.max(currentScore + 1, match.targetScore ?? Math.ceil(market?.high ?? market?.ltp ?? currentScore + 1));

    return {
      innings,
      currentScore,
      wicketsLost,
      ballsBowled: totalBalls - ballsLeft,
      targetScore,
    };
  }

  return {
    innings,
    currentScore,
    wicketsLost,
    ballsLeft,
  };
}

export function roundScoreToNearestStrike(score: number): number {
  if (!Number.isFinite(score) || score <= 0) return 0;

  const remainder = score % 10;
  if (remainder <= 5) {
    return Math.floor(score / 10) * 10;
  }
  return Math.ceil(score / 10) * 10;
}

export function currentMatchRuns(match?: Match): number {
  return numberFromDisplay(currentInningsScoreParts(match).runs);
}

export function buildOptionRows(
  calculated?: CalculatedPrice,
  market?: BackendMarket,
  options?: { match?: Match; currentScore?: number }
): ChainRow[] {
  const chain = (calculated?.optionChain ?? [])
    .map((item) => ({
      strike: numberOrZero(item?.strike),
      premium: numberOrZero(item?.premium),
    }))
    .filter((item) => item.strike >= 10)
    .sort((left, right) => left.strike - right.strike);
  if (!chain.length) return [];

  const currentScore =
    options?.currentScore ?? (options?.match ? currentMatchRuns(options.match) : 0);
  const projected = calculated?.projectedS0 ?? chain[Math.floor(chain.length / 2)]?.strike ?? 0;
  const referenceStrike = currentScore > 0 ? roundScoreToNearestStrike(currentScore) : projected;
  const atmStrike = nearestStrike(chain, referenceStrike);
  const itmReference = currentScore > 0 ? currentScore : projected;
  const ladder = market?.quantityLadder ?? [];

  return chain.map((item, index) => {
    const ladderEntry = ladder[index % Math.max(ladder.length, 1)];
    const { bid, ask } = quoteFromPremium(item.premium);

    return {
      strike: item.strike,
      premium: item.premium,
      bid,
      ask,
      bidQty: ladderEntry?.buyerQty ?? 0,
      askQty: ladderEntry?.sellerQty ?? 0,
      moneyness: item.strike === atmStrike ? "ATM" : item.strike < itmReference ? "ITM" : "OTM",
    };
  });
}

export function findAtmRow(rows: ChainRow[]) {
  return rows.find((row) => row.moneyness === "ATM") ?? rows[Math.floor(rows.length / 2)];
}

export function buildLastSixBalls(score: number, wickets: number, ballsLeft: number): BallEvent[] {
  const sequence: BallEvent[] = [
    { label: "0", kind: "dot" },
    { label: "1", kind: "run" },
    { label: "2", kind: "run" },
    { label: "4", kind: "four" },
    { label: "6", kind: "six" },
    { label: "1", kind: "run" },
    { label: "0", kind: "dot" },
    { label: "2", kind: "run" },
  ];

  const seed = Math.abs(score * 3 + wickets * 11 + ballsLeft * 5);
  const balls = Array.from({ length: 6 }, (_, index) => sequence[(seed + index) % sequence.length]);

  if (wickets > 0) {
    balls[seed % balls.length] = { label: "W", kind: "wicket" };
  }

  return balls;
}

export function buildThisOverBalls(score: number, wickets: number, ballsLeft: number, totalBalls = 120): BallEvent[] {
  const sequence: BallEvent[] = [
    { label: "0", kind: "dot" },
    { label: "1", kind: "run" },
    { label: "2", kind: "run" },
    { label: "4", kind: "four" },
    { label: "6", kind: "six" },
    { label: "1", kind: "run" },
    { label: "0", kind: "dot" },
    { label: "2", kind: "run" },
  ];
  const clampedBallsLeft = Math.max(0, Math.min(totalBalls, ballsLeft));
  const ballsBowled = totalBalls - clampedBallsLeft;
  const ballsInOver = ballsBowled % 6;
  const dealtSlots = ballsBowled > 0 && ballsInOver === 0 ? 6 : ballsInOver;
  const seed = Math.abs(score * 3 + wickets * 11 + ballsLeft * 5);
  const firstOverBalls = ballsBowled <= 6 ? buildFirstOverBalls(score, wickets, dealtSlots) : undefined;

  return Array.from({ length: 6 }, (_, index) => {
    if (index >= dealtSlots) {
      return { label: "", kind: "empty" };
    }
    if (firstOverBalls?.[index]) {
      return firstOverBalls[index];
    }
    if (wickets > 0 && index === seed % Math.max(dealtSlots, 1)) {
      return { label: "W", kind: "wicket" };
    }
    return sequence[(seed + index) % sequence.length];
  });
}

function buildFirstOverBalls(score: number, wickets: number, dealtSlots: number): BallEvent[] {
  if (dealtSlots <= 0) return [];
  const wicketSlot = wickets > 0 ? dealtSlots - 1 : -1;
  let remainingRuns = Math.max(0, score);
  const balls: BallEvent[] = [];
  for (let index = 0; index < dealtSlots; index++) {
    if (index === wicketSlot) {
      balls.push({ label: "W", kind: "wicket" });
      continue;
    }
    const runs = Math.min(6, remainingRuns);
    remainingRuns -= runs;
    balls.push(ballFromRuns(runs));
  }
  return balls;
}

export function ballFromRuns(runs: number): BallEvent {
  const value = Math.max(0, Math.min(6, Math.round(runs)));
  if (value >= 6) return { label: "6", kind: "six" };
  if (value === 4) return { label: "4", kind: "four" };
  if (value > 0) return { label: String(value), kind: "run" };
  return { label: "0", kind: "dot" };
}

export interface ScoreboardSnap {
  matchId: string;
  currentScore: number;
  wicketsLost: number;
  ballsLeft: number;
  totalBalls: number;
}

export function snapFromMatch(match: Match): ScoreboardSnap {
  const totalBalls = totalBallsForFormat(match.format);
  const score = currentInningsScoreParts(match);

  return {
    matchId: match.id,
    currentScore: numberFromDisplay(score.runs),
    wicketsLost: numberFromDisplay(score.wickets),
    ballsLeft: Math.max(0, Math.min(totalBalls, match.ballsLeft ?? totalBalls)),
    totalBalls,
  };
}

export function ballsBowledFromSnap(snap: ScoreboardSnap) {
  return snap.totalBalls - snap.ballsLeft;
}

export function padThisOverBalls(balls: BallEvent[]): BallEvent[] {
  const filled = balls.filter((ball) => ball.kind !== "empty");
  const legalCount = filled.filter(isLegalBallEvent).length;
  // Only pad up to 6 legal slots, but never add blanks when the over already
  // has 6+ legal balls (extras made it longer than a standard over).
  const blanksNeeded = Math.max(0, 6 - legalCount);
  return [...filled, ...Array.from({ length: blanksNeeded }, () => ({ label: "", kind: "empty" as const }))];
}

export function ballEventFromCommentary(event: { eventId?: string; sequence?: number; revision?: number; runs: number; isWicket: boolean; extra?: string | null }): BallEvent {
  const identity = { eventId: event.eventId, sequence: event.sequence, revision: event.revision };
  const isWicket = event.isWicket === true;
  const runs = Number.isFinite(Number(event.runs)) ? Number(event.runs) : 0;
  if (isWicket) return { ...wicketBallFromType(), ...identity };
  if (event.extra === "wide") return { ...identity, label: "Wd", kind: "run", detail: "Wide" };
  if (event.extra === "noball") return { ...identity, label: "Nb", kind: "run", detail: "No ball" };
  return { ...ballFromRuns(runs), ...identity };
}

export function ballEventFromAdmin(event: {
  runs: number;
  wicket: boolean;
  wide?: boolean;
  noBall?: boolean;
}): BallEvent {
  if (event.wicket) return { label: "W", kind: "wicket" };
  if (event.wide) return { label: "Wd", kind: "run" };
  if (event.noBall) return { label: "Nb", kind: "run" };
  return ballFromRuns(event.runs);
}

export function ballEventFromHistory(event: MatchBallHistoryEvent): BallEvent {
  const identity = { eventId: event.eventId, sequence: event.sequence, revision: event.revision };
  const extra = String(event.extra ?? "").toLowerCase().replace(/[\s_-]+/g, "");
  if (extra === "wide" || extra === "wd") return { ...identity, label: "Wd", kind: "run" };
  if (extra === "noball" || extra === "nb") return { ...identity, label: "Nb", kind: "run" };
  if (event.isWicket === true) return { ...identity, label: "W", kind: "wicket" };
  return { ...ballFromRuns(Number(event.runs) || 0), ...identity };
}

/** Render the 6 "this over" slots from an append-only delivery log.
 *  When `ballsBowled` is provided (from the live scoreboard), use it to decide
 *  how many legal deliveries belong to the *current* over — not the log length. */
export function currentOverFromList(list: BallEvent[], ballsBowled?: number): BallEvent[] {
  const filled = list.filter((ball) => ball.kind !== "empty");
  if (filled.length === 0) return padThisOverBalls([]);

  const legalInLog = filled.filter(isLegalBallEvent).length;
  
  // If ballsBowled is 0 or undefined, we're at the start — nothing to show.
  if (!ballsBowled || ballsBowled <= 0) {
    if (legalInLog === 0) return padThisOverBalls([]);
  }

  // Use the higher of the two counts so WS events ahead of the REST scoreboard
  // are never discarded.
  const targetLegal = Math.max(
    legalInLog,
    typeof ballsBowled === "number" && ballsBowled > 0 ? ballsBowled : 0
  );

  if (targetLegal === 0) return padThisOverBalls([]);

  // Assign an absolute over index (0-based) to every ball in the log.
  let currentAbsolute = targetLegal;
  const overIndices: number[] = [];

  for (let i = filled.length - 1; i >= 0; i--) {
    const ball = filled[i];
    
    // A legal ball belongs to `currentAbsolute`.
    // An illegal ball (wide/no-ball) belongs to the same over as the NEXT legal ball.
    const belongsToAbsolute = isLegalBallEvent(ball) ? currentAbsolute : currentAbsolute;
    
    const overIdx = Math.floor((Math.max(1, belongsToAbsolute) - 1) / 6);
    overIndices[i] = Math.max(0, overIdx);
    
    if (isLegalBallEvent(ball)) {
      currentAbsolute--;
    }
  }

  const lastOverIdx = overIndices[overIndices.length - 1] ?? 0;
  const currentOverBalls = filled.filter((_, i) => overIndices[i] === lastOverIdx);

  return padThisOverBalls(currentOverBalls);
}

/** Drop the oldest legal deliveries when the log has more than the scoreboard says were bowled. */
export function trimBallLogToBowled(list: BallEvent[], bowled: number): BallEvent[] {
  if (bowled <= 0) return list;

  const legalIndices: number[] = [];
  list.forEach((ball, index) => {
    if (isLegalBallEvent(ball)) legalIndices.push(index);
  });

  if (legalIndices.length <= bowled) return list;

  const dropCount = legalIndices.length - bowled;
  return list.slice(legalIndices[dropCount] ?? 0);
}

export function currentOverBallIndices(snap: ScoreboardSnap): { start: number; count: number } {
  const bowled = ballsBowledFromSnap(snap);
  if (bowled <= 0) return { start: 0, count: 0 };
  const inOver = bowled % 6;
  const count = inOver === 0 ? 6 : inOver;
  return { start: bowled - count, count };
}

export function buildThisOverFromHistory(snap: ScoreboardSnap, history: ReadonlyMap<number, BallEvent>): BallEvent[] {
  const { start, count } = currentOverBallIndices(snap);
  const filled: BallEvent[] = [];
  for (let index = 0; index < count; index += 1) {
    filled.push(history.get(start + index) ?? { label: "", kind: "empty" });
  }
  return padThisOverBalls(filled);
}

/** Rebuild current-over ball history when the page loads mid-match (e.g. 6/0 after first ball). */
export function seedHistoryFromSnap(snap: ScoreboardSnap, history: ReadonlyMap<number, BallEvent>): Map<number, BallEvent> {
  const bowled = ballsBowledFromSnap(snap);
  if (bowled <= 0) return new Map(history);

  const { start, count } = currentOverBallIndices(snap);
  const missingIndices = Array.from({ length: count }, (_, index) => start + index).filter((index) => !history.has(index));
  if (missingIndices.length === 0) return new Map(history);

  const next = new Map(history);

  // First over: total score maps directly to the balls visible in this over.
  if (start === 0 && count === bowled) {
    const balls = distributeRunsAcrossBalls(count, snap.currentScore, snap.wicketsLost);
    balls.forEach((ball, offset) => {
      const index = offset;
      if (!next.has(index)) next.set(index, ball);
    });
    return next;
  }

  return next;
}

export function runsFromBallEvent(ball: BallEvent): number {
  if (ball.kind === "wicket") return 0;
  if (ball.kind === "six") return 6;
  if (ball.kind === "four") return 4;
  if (ball.kind === "dot" || ball.kind === "empty") return 0;
  return Number.parseInt(ball.label, 10) || 0;
}

export function isLegalBallEvent(ball: BallEvent) {
  return ball.kind !== "empty" && ball.label !== "Wd" && ball.label !== "Nb";
}

export type ScoreDeltaResult = BallEvent[] | "reset" | null;

export function inferBallsFromScoreDelta(prev: ScoreboardSnap, next: ScoreboardSnap): ScoreDeltaResult {
  const scoreDelta = next.currentScore - prev.currentScore;
  const wicketsDelta = next.wicketsLost - prev.wicketsLost;
  const prevBowled = ballsBowledFromSnap(prev);
  const nextBowled = ballsBowledFromSnap(next);
  const ballsBowledDelta = nextBowled - prevBowled;

  if (
    next.currentScore === 0 &&
    next.wicketsLost === 0 &&
    next.ballsLeft >= next.totalBalls - 1 &&
    (prev.currentScore > 0 || prev.wicketsLost > 0)
  ) {
    return "reset";
  }

  if (scoreDelta === 0 && wicketsDelta === 0 && ballsBowledDelta === 0) {
    return null;
  }

  if (ballsBowledDelta === 0 && scoreDelta === 1) {
    return [{ label: "Wd", kind: "run" }];
  }

  // ballsLeft can lag behind score on some API responses — still show the last ball.
  if (ballsBowledDelta <= 0 && scoreDelta > 0 && wicketsDelta === 0 && scoreDelta <= 6) {
    return [ballFromRuns(scoreDelta)];
  }

  if (ballsBowledDelta <= 0) {
    return null;
  }

  if (ballsBowledDelta === 1) {
    if (wicketsDelta === 1 && scoreDelta === 0) {
      return [{ label: "W", kind: "wicket" }];
    }
    if (wicketsDelta > 1) {
      return null;
    }
    if (scoreDelta >= 0 && scoreDelta <= 6) {
      return [ballFromRuns(scoreDelta)];
    }
    return null;
  }

  return distributeRunsAcrossBalls(ballsBowledDelta, scoreDelta, wicketsDelta);
}

export function distributeRunsAcrossBalls(ballCount: number, totalRuns: number, wickets: number): BallEvent[] {
  if (ballCount <= 0) return [];

  const runsPerBall = Array<number>(ballCount).fill(0);
  let runs = Math.max(0, totalRuns);

  // Fill from the end of the over so paired runs keep click order (4 then 6, not 6 then 4).
  for (let index = ballCount - 1; index >= 0; index -= 1) {
    const chunk = Math.min(6, runs);
    runsPerBall[index] = chunk;
    runs -= chunk;
  }

  const balls = runsPerBall.map((value) => ballFromRuns(value));
  let wicketsLeft = Math.max(0, wickets);

  for (let index = ballCount - 1; index >= 0 && wicketsLeft > 0; index -= 1) {
    if (runsPerBall[index] === 0) {
      balls[index] = { label: "W", kind: "wicket" };
      wicketsLeft -= 1;
    }
  }

  return balls;
}

/** @deprecated Use inferBallsFromScoreDelta instead. */
export function inferBallFromScoreDelta(prev: ScoreboardSnap, next: ScoreboardSnap): BallEvent | "reset" | null {
  const result = inferBallsFromScoreDelta(prev, next);
  if (result === "reset" || result === null) return result;
  return result[result.length - 1] ?? null;
}

export function appendBallToCurrentOver(
  current: BallEvent[],
  ball: BallEvent,
  prev: ScoreboardSnap,
  next: ScoreboardSnap
): BallEvent[] {
  const prevBowled = ballsBowledFromSnap(prev);
  const nextBowled = ballsBowledFromSnap(next);
  const prevInOver = prevBowled % 6;
  const nextInOver = nextBowled % 6;
  const filled = current.filter((item) => item.kind !== "empty");

  if (nextInOver === 1 && prevInOver === 0 && prevBowled > 0 && nextBowled > prevBowled) {
    return [ball];
  }

  if (nextInOver === 0 && nextBowled > prevBowled) {
    if (filled.length >= 5) return [...filled.slice(0, 5), ball];
    return [...filled, ball];
  }

  return [...filled, ball];
}

export function ballClassName(kind: BallKind) {
  switch (kind) {
    case "empty":
      return "border-white/8 bg-transparent text-transparent";
    case "wicket":
    case "bowled":
    case "lbw":
    case "caught":
    case "runOut":
      return "border-red-300/45 bg-red-500 text-white shadow-[0_0_18px_rgba(239,68,68,0.22)]";
    case "six":
      return "border-orange-300/45 bg-orange-500 text-black shadow-[0_0_18px_rgba(249,115,22,0.22)]";
    case "four":
      return "border-cyan-200/45 bg-cyan-400 text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.2)]";
    case "run":
      return "border-teal-300/35 bg-teal-400/14 text-teal-100";
    case "dot":
    default:
      return "border-slate-400/20 bg-slate-400/12 text-slate-200";
  }
}

export function wicketBallFromType(): BallEvent {
  return { label: "W", kind: "wicket", detail: "Wicket" };
}

export function scoreParts(score?: string) {
  const [runs, wickets] = (score || "0/0").split("/");
  return {
    runs: runs || "0",
    wickets: wickets || "0",
  };
}

export function currentInningsScoreParts(match?: Match) {
  const innings = match?.innings ?? 1;
  const scoreText = innings === 2 ? match?.awayScore || match?.homeScore : match?.homeScore || match?.awayScore;
  const parsed = scoreParts(scoreText);

  return {
    runs: String(match?.currentScore ?? numberFromDisplay(parsed.runs)),
    wickets: String(match?.wicketsLost ?? numberFromDisplay(parsed.wickets)),
  };
}

export function battingTeamForMatch(match?: Match) {
  if (!match) return undefined;
  return (match.innings ?? 1) === 2 ? match.awayTeam : match.homeTeam;
}

export function bowlingTeamForMatch(match?: Match) {
  if (!match) return undefined;
  return (match.innings ?? 1) === 2 ? match.homeTeam : match.awayTeam;
}

export function teamCode(value?: string) {
  const normalized = (value ?? "TEAM").trim();
  const words = normalized.split(/\s+/).filter(Boolean);
  if (words.length > 1) return words.map((word) => word[0]).join("").slice(0, 3).toUpperCase();
  return normalized.slice(0, 3).toUpperCase();
}

export function projectedRange(projected?: number) {
  if (!projected) return "0-0";
  return `${Math.max(0, Math.floor(projected - 3))}-${Math.ceil(projected + 5)}`;
}

function nearestStrike(chain: OptionChainStrike[], projected: number) {
  return chain.reduce((closest, item) => {
    return Math.abs(item.strike - projected) < Math.abs(closest - projected) ? item.strike : closest;
  }, chain[0]?.strike ?? 0);
}

function totalBallsForFormat(format?: string) {
  const upper = (format ?? "T20").toUpperCase();
  return upper.includes("ODI") || upper.includes("ONE") ? 300 : 120;
}

function numberFromDisplay(value?: string) {
  const parsed = Number.parseInt(value ?? "0", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function numberOrZero(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function quoteFromPremium(premium: number) {
  const spread = premium >= 20 ? 1 : premium >= 5 ? 0.5 : 0.1;
  const bid = Math.max(0, round2(premium - spread / 2));
  const ask = Math.max(bid, round2(premium + spread / 2));
  return { bid, ask };
}
