// ─────────────────────────────────────────────────────────────────────────────
// Intelligence Service — Mock Generator
// All data is seeded from matchId for determinism (same matchId = same DNA profile).
// Replace these functions with real API calls when backend adds /intelligence endpoints.
// Every function is match-aware (matchId is the primary context key).
// ─────────────────────────────────────────────────────────────────────────────

import type {
  MatchIntelligence,
  DNAMatch,
  AISignal,
  IntelligencePattern,
  EventImpact,
  MomentumScore,
  OutcomePoint,
  Scenario,
  ScenarioProjection,
} from "../types/intelligence";

// ── Seeded pseudo-random ──────────────────────────────────────────────────────
function seededRng(seed: string, index: number = 0): () => number {
  let h = 0;
  for (let i = 0; i < seed.length + index; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i % seed.length), 0x9e3779b1);
  }
  return () => {
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return (h >>> 0) / 0xffffffff;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ── Mock Data Pools ───────────────────────────────────────────────────────────
const TEAMS = ["CSK", "MI", "RCB", "KKR", "DC", "SRH", "PBKS", "RR"];
const VENUES = ["Wankhede", "Chepauk", "Chinnaswamy", "Eden Gardens", "Arun Jaitley", "JSCA"];
const TOURNAMENTS = ["IPL 2024", "IPL 2023", "IPL 2022", "WC 2023", "IPL 2019"];
const PLAYERS = ["MS Dhoni", "Virat Kohli", "Rohit Sharma", "Jasprit Bumrah", "Ruturaj Gaikwad", "Hardik Pandya"];
const PATTERN_NAMES = [
  { name: "Death Slog Acceleration", desc: "Last 5 overs generate 65+ runs.", cat: "BATTING" as const },
  { name: "Spin Choke Phase", desc: "Run rate drops 1.5+ in middle overs.", cat: "BOWLING" as const },
  { name: "Top Order Collapse", desc: "3 wickets in 15 deliveries.", cat: "MATCH_STATE" as const },
  { name: "Boundary Drought", desc: "24+ balls without a boundary.", cat: "PRESSURE" as const },
  { name: "Pressure Release Shot", desc: "Big shot after 3 dot balls.", cat: "BATTING" as const },
  { name: "Partnership Builder", desc: "50+ run stand in overs 6–15.", cat: "BATTING" as const },
  { name: "Death Over Surge", desc: "Wickets spiking volatility late.", cat: "MATCH_STATE" as const },
];

// ── Generators ────────────────────────────────────────────────────────────────

export function generateDNAMatches(matchId: string): DNAMatch[] {
  const rng = seededRng(matchId);
  const count = 6;
  const base = [95, 88, 82, 74, 68, 61];

  return Array.from({ length: count }, (_, i) => {
    const teamA = pick(TEAMS, rng);
    const teamB = pick(TEAMS.filter((t) => t !== teamA), rng);
    const similarity = base[i] - Math.floor(rng() * 4);

    return {
      matchId: `hist-${matchId}-${i}`,
      teamA,
      teamB,
      venue: pick(VENUES, rng),
      year: 2019 + Math.floor(rng() * 6),
      tournament: pick(TOURNAMENTS, rng),
      similarity,
      outcome: pick(["DEFENDED", "CHASED", "DEFENDED"] as const, rng),
      finalScore: `${180 + Math.floor(rng() * 60)}/${Math.floor(rng() * 5) + 5}`,
      overState: 10 + Math.floor(rng() * 30),
      dnaConfirmed: similarity > 80,
    };
  });
}

export function generateAISignals(matchId: string, count = 5): AISignal[] {
  const rng = seededRng(matchId + "signals");
  return PLAYERS.slice(0, count).map((player, i) => {
    const confidence = 65 + Math.floor(rng() * 30);
    const currentPrice = 80 + Math.floor(rng() * 120);
    const action: AISignal["action"] =
      confidence > 80 ? "BUY" : confidence < 70 ? "SELL" : "HOLD";

    return {
      id: `sig-${matchId}-${i}`,
      matchId,
      marketId: `mkt-${player.toLowerCase().replace(/ /g, "-")}`,
      player,
      action,
      confidence,
      drivers: [
        pick(["Momentum", "Historical DNA", "Crowd Sentiment", "Pressure Index", "Wicket Proximity"], rng),
        pick(["Run Rate", "Form Index", "Venue Analytics", "Opposition DNA"], rng),
      ],
      targetPrice: currentPrice * (action === "BUY" ? 1.08 : 0.92),
      currentPrice,
      generatedAt: new Date(Date.now() - Math.floor(rng() * 300_000)).toISOString(),
      engine: pick(["DNA", "NEURAL", "SENTIMENT"] as const, rng),
    };
  });
}

export function generatePatterns(matchId: string): IntelligencePattern[] {
  const rng = seededRng(matchId + "patterns");
  return PATTERN_NAMES.map((p, i) => {
    const matchPct = Math.floor(rng() * 90) + 5;
    return {
      id: `P-${String(i + 100).padStart(4, "0")}`,
      name: p.name,
      description: p.desc,
      matchPct,
      status: matchPct > 60 ? ("ACTIVE" as const) : ("INACTIVE" as const),
      category: p.cat,
      occurrences: 5 + Math.floor(rng() * 20),
      historicalOutcome: pick(["High Score", "Collapse", "Close Finish", "Dominant Win"], rng),
    };
  });
}

export function generateEventImpacts(_matchId: string): EventImpact[] {
  return [
    { event: "WICKET", label: "Wicket", volatilityDelta: 18, direction: "UP", affectedMarkets: ["Win", "Runs"], confidence: 91 },
    { event: "BOUNDARY", label: "Boundary", volatilityDelta: 4, direction: "UP", affectedMarkets: ["Runs"], confidence: 84 },
    { event: "SIX", label: "Six", volatilityDelta: 7, direction: "UP", affectedMarkets: ["Runs", "Strike Rate"], confidence: 88 },
    { event: "POWERPLAY_END", label: "Powerplay End", volatilityDelta: 9, direction: "DOWN", affectedMarkets: ["Win", "Runs"], confidence: 79 },
    { event: "DEATH_OVER_START", label: "Death Overs", volatilityDelta: 14, direction: "UP", affectedMarkets: ["Win", "Runs", "Strike Rate"], confidence: 86 },
    { event: "PARTNERSHIP_BROKEN", label: "Partnership Broken", volatilityDelta: 11, direction: "UP", affectedMarkets: ["Win", "Runs"], confidence: 82 },
  ];
}

export function generateMomentum(matchId: string): MomentumScore {
  const rng = seededRng(matchId + "momentum");
  const score = 40 + Math.floor(rng() * 55);
  return {
    matchId,
    score,
    winProbability: 35 + Math.floor(rng() * 55),
    pressureIndex: 20 + Math.floor(rng() * 60),
    trend: pick(["RISING", "FALLING", "STABLE", "RISING"] as const, rng),
    runRate: 7 + rng() * 6,
    requiredRunRate: 9 + rng() * 5,
    overs: 12 + rng() * 28,
  };
}

export function generateOutcomeDistribution(_matchId: string): OutcomePoint[] {
  return [
    { label: "High Scoring Finish (>360)", probability: 24, range: ">360 runs", sentiment: "BULLISH" },
    { label: "Mid Scoring Finish (330–360)", probability: 62, range: "330–360 runs", sentiment: "NEUTRAL" },
    { label: "Lower Scoring Collapse (<330)", probability: 14, range: "<330 runs", sentiment: "BEARISH" },
  ];
}

export function getScenarios(): Scenario[] {
  return [
    { id: "s1", label: "Middle Order Wicket (Overs 16–20)", description: "Key batter dismissed in slog overs", branch: "WICKET" },
    { id: "s2", label: "Acceleration Surge (12+ RPO Next 3)", description: "Batting side hits 3 boundaries in 2 overs", branch: "ACCELERATION" },
    { id: "s3", label: "Bowling Change (Leg Spin Introduction)", description: "Spinner introduced mid-powerplay", branch: "BOWLING_CHANGE" },
    { id: "s4", label: "Death Overs Begin", description: "Final 5 overs commencing", branch: "POWERPLAY" },
  ];
}

export function generateScenarioProjection(
  matchId: string,
  scenarioId: string
): ScenarioProjection {
  const rng = seededRng(matchId + scenarioId);
  const isWicket = scenarioId === "s1";
  const delta = isWicket ? -0.46 : 0.18;
  const baseOdds = 1.42;

  return {
    scenarioId,
    matchId,
    marketImpacts: [
      {
        market: "Match Win Odds",
        currentOdds: baseOdds,
        projectedOdds: parseFloat((baseOdds + delta).toFixed(2)),
        delta: `${baseOdds.toFixed(2)} → ${(baseOdds + delta).toFixed(2)}`,
        direction: delta > 0 ? "UP" : "DOWN",
        confidence: 85 + Math.floor(rng() * 10),
      },
      {
        market: "Team Total Runs",
        currentOdds: 284,
        projectedOdds: isWicket ? 262 : 301,
        delta: `284 → ${isWicket ? "262" : "301"}`,
        direction: isWicket ? "DOWN" : "UP",
        confidence: 78 + Math.floor(rng() * 12),
      },
    ],
    playerImpacts: [
      {
        player: "MS Dhoni",
        delta: isWicket ? -12.5 : 8.4,
        confidence: 89,
      },
      {
        player: "Virat Kohli",
        delta: isWicket ? -8.1 : 5.2,
        confidence: 76,
      },
    ],
    winProbabilityShift: isWicket ? -18 : 12,
  };
}

export function generateMatchIntelligence(matchId: string): MatchIntelligence {
  const rng = seededRng(matchId + "master");
  const teams = matchId.split("-vs-") as [string, string];
  const teamA = teams[0]?.toUpperCase() ?? "CSK";
  const teamB = teams[1]?.toUpperCase() ?? "MI";
  const dnaConfidence = 88 + Math.floor(rng() * 10);

  return {
    matchId,
    matchLabel: `${teamA} vs ${teamB}`,
    teamA,
    teamB,
    currentScore: `${160 + Math.floor(rng() * 60)}/${Math.floor(rng() * 5) + 3}`,
    currentOvers: parseFloat((8 + rng() * 32).toFixed(1)),
    innings: 1,
    dnaConfidence,
    dnaStatus: "LIVE",
    momentum: generateMomentum(matchId),
    signals: generateAISignals(matchId),
    patterns: generatePatterns(matchId),
    similarMatches: generateDNAMatches(matchId),
    eventImpacts: generateEventImpacts(matchId),
    outcomeDistribution: generateOutcomeDistribution(matchId),
    processingLatencyMs: 18 + Math.floor(rng() * 20),
  };
}
