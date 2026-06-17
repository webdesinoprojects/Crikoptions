import { BackendMarket } from "@/lib/adapters/market.adapter";
import { Match } from "@/types";
import { CalculatedPrice, CalculatePricePayload, OptionChainStrike } from "../services/trading.service";

export type BallKind = "empty" | "dot" | "run" | "four" | "six" | "wicket";

export interface BallEvent {
  label: string;
  kind: BallKind;
}

export interface ChainRow {
  strike: number;
  premium: number;
  bid: number;
  ask: number;
  bidQty: number;
  askQty: number;
  moneyness: "ITM" | "ATM" | "OTM";
  impliedProbability: number;
}

export function buildPricePayload(match?: Match, market?: BackendMarket): CalculatePricePayload | undefined {
  if (!match) return undefined;

  const innings = match.innings ?? 1;
  const totalBalls = totalBallsForFormat(match.format);
  const currentScore = match.currentScore ?? scoreFromDisplay(match.homeScore);
  const wicketsLost = match.wicketsLost ?? wicketsFromDisplay(match.homeScore);
  const ballsLeft = Math.max(0, Math.min(totalBalls, match.ballsLeft ?? totalBalls));

  if (innings === 2) {
    const targetScore = Math.max(currentScore + 1, Math.ceil(market?.high ?? market?.ltp ?? currentScore + 1));

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

export function buildOptionRows(calculated?: CalculatedPrice, market?: BackendMarket): ChainRow[] {
  const chain = calculated?.optionChain ?? [];
  if (!chain.length) return [];

  const projected = calculated?.projectedS0 ?? chain[Math.floor(chain.length / 2)]?.strike ?? 0;
  const atmStrike = nearestStrike(chain, projected);
  const ladder = market?.quantityLadder ?? [];

  return chain.map((item, index) => {
    const ladderEntry = ladder[index % Math.max(ladder.length, 1)];
    const spread = item.premium >= 20 ? 1 : item.premium >= 5 ? 0.5 : 0.1;
    const bid = round2(Math.max(0, item.premium - spread / 2));
    const ask = round2(item.premium + spread / 2);

    return {
      strike: item.strike,
      premium: item.premium,
      bid,
      ask,
      bidQty: ladderEntry?.buyerQty ?? 0,
      askQty: ladderEntry?.sellerQty ?? 0,
      moneyness: item.strike === atmStrike ? "ATM" : item.strike < projected ? "ITM" : "OTM",
      impliedProbability: impliedProbability(item.premium, item.strike, projected),
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

function ballFromRuns(runs: number): BallEvent {
  if (runs >= 6) return { label: String(runs), kind: "six" };
  if (runs === 4) return { label: "4", kind: "four" };
  if (runs > 0) return { label: String(runs), kind: "run" };
  return { label: "0", kind: "dot" };
}

export function ballClassName(kind: BallKind) {
  switch (kind) {
    case "empty":
      return "border-slate-500/35 bg-transparent text-transparent";
    case "wicket":
      return "border-bear-red/50 bg-bear-red text-white";
    case "six":
      return "border-orange-500/40 bg-orange-500/90 text-black";
    case "four":
      return "border-primary/50 bg-primary text-on-primary";
    case "run":
      return "border-teal-500/40 bg-teal-500/20 text-teal-200";
    case "dot":
    default:
      return "border-slate-500/30 bg-slate-500/30 text-slate-200";
  }
}

export function scoreParts(score?: string) {
  const [runs, wickets] = (score || "0/0").split("/");
  return {
    runs: runs || "0",
    wickets: wickets || "0",
  };
}

export function projectedRange(projected?: number) {
  if (!projected) return "0-0";
  return `${Math.max(0, Math.floor(projected - 3))}-${Math.ceil(projected + 5)}`;
}

function impliedProbability(premium: number, strike: number, projected: number) {
  const intrinsicBias = projected > 0 ? projected / Math.max(strike, 1) : 0;
  const premiumBias = premium / Math.max(premium + Math.max(strike - premium, 1), 1);
  return Math.round(Math.min(98, Math.max(2, (intrinsicBias * 0.62 + premiumBias * 0.38) * 100)));
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

function scoreFromDisplay(score?: string) {
  const value = Number.parseInt((score ?? "0").split("/")[0], 10);
  return Number.isFinite(value) ? value : 0;
}

function wicketsFromDisplay(score?: string) {
  const value = Number.parseInt((score ?? "0/0").split("/")[1] ?? "0", 10);
  return Number.isFinite(value) ? value : 0;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}
