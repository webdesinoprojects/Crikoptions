import { apiClient } from "@/lib/api/client";
import { BackendMatch } from "@/lib/adapters/match.adapter";
import {
  AISignal,
  DNAMatch,
  EventImpact,
  IntelligencePattern,
  MatchIntelligence,
  MomentumScore,
  OutcomePoint,
  Scenario,
  ScenarioProjection,
} from "../types/intelligence";

export async function fetchMatchIntelligence(matchId: string): Promise<MatchIntelligence> {
  const match = await fetchMatch(matchId);
  const momentum = buildMomentum(match);

  return {
    matchId: match._id || matchId,
    matchLabel: `${match.teamAName || "0"} vs ${match.teamBName || "0"}`,
    teamA: match.teamAName || "0",
    teamB: match.teamBName || "0",
    currentScore: `${numberOrZero(match.currentScore)}/${numberOrZero(match.wicketsLost)}`,
    currentOvers: oversFromMatch(match),
    innings: match.innings === 2 ? 2 : 1,
    dnaConfidence: 0,
    dnaStatus: match.status?.toLowerCase() === "live" ? "LIVE" : "STALE",
    momentum,
    signals: [],
    patterns: [],
    similarMatches: [],
    eventImpacts: [],
    outcomeDistribution: [],
    processingLatencyMs: 0,
  };
}

export async function fetchDNAMatches(matchId: string): Promise<DNAMatch[]> {
  void matchId;
  return [];
}

export async function fetchAISignals(matchId: string, count = 0): Promise<AISignal[]> {
  void matchId;
  void count;
  return [];
}

export async function fetchPatterns(matchId: string): Promise<IntelligencePattern[]> {
  void matchId;
  return [];
}

export async function fetchMomentum(matchId: string): Promise<MomentumScore> {
  const match = await fetchMatch(matchId);
  return buildMomentum(match);
}

export async function fetchEventImpacts(matchId: string): Promise<EventImpact[]> {
  void matchId;
  return [];
}

export async function fetchOutcomeDistribution(matchId: string): Promise<OutcomePoint[]> {
  void matchId;
  return [];
}

export function getScenarios(): Scenario[] {
  return [];
}

export async function fetchScenarioProjection(
  matchId: string,
  scenarioId: string
): Promise<ScenarioProjection | null> {
  void matchId;
  void scenarioId;
  return null;
}

async function fetchMatch(matchId: string): Promise<BackendMatch> {
  const response = await apiClient.get<{ success: boolean; data: BackendMatch }>(`/v1/matches/${matchId}`);
  return response.data.data;
}

function buildMomentum(match: BackendMatch): MomentumScore {
  const ballsLeft = numberOrZero(match.ballsLeft);
  const ballsBowled = Math.max(0, 120 - ballsLeft);
  const overs = oversFromMatch(match);
  const runRate = ballsBowled > 0 ? numberOrZero(match.currentScore) / (ballsBowled / 6) : 0;
  const pressureIndex = Math.min(100, numberOrZero(match.wicketsLost) * 10);
  const score = Math.max(0, Math.min(100, Math.round(runRate * 10 - pressureIndex / 2)));

  return {
    matchId: match._id,
    score,
    winProbability: 0,
    pressureIndex,
    trend: "STABLE",
    runRate: round2(runRate),
    requiredRunRate: 0,
    overs,
  };
}

function oversFromMatch(match: BackendMatch): number {
  const parsed = Number.parseFloat(match.oversText);
  if (Number.isFinite(parsed)) return parsed;
  const ballsBowled = Math.max(0, 120 - numberOrZero(match.ballsLeft));
  return round2(Math.floor(ballsBowled / 6) + (ballsBowled % 6) / 10);
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function round2(value: number): number {
  return Math.round(numberOrZero(value) * 100) / 100;
}
