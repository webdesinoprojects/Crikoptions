// ─────────────────────────────────────────────────────────────────────────────
// Intelligence Domain Types
// All types are match-aware. matchId is the primary context key.
// Backend-derived services return these shapes.
// ─────────────────────────────────────────────────────────────────────────────

/** Historical match fingerprint from DNA similarity engine */
export interface DNAMatch {
  matchId: string;
  teamA: string;
  teamB: string;
  venue: string;
  year: number;
  tournament: string;
  /** 0–100 similarity to current match state */
  similarity: number;
  outcome: "DEFENDED" | "CHASED" | "NO_RESULT";
  finalScore: string;
  overState: number;
  /** DNA-confirmed or pattern-matched */
  dnaConfirmed: boolean;
}

/** AI-generated trading signal for a player market */
export interface AISignal {
  id: string;
  matchId: string;
  marketId: string;
  player: string;
  action: "BUY" | "SELL" | "HOLD";
  /** 0–100 confidence */
  confidence: number;
  /** Driver labels e.g. "Momentum", "Crowd Sentiment", "Historical DNA" */
  drivers: string[];
  targetPrice: number;
  currentPrice: number;
  generatedAt: string;
  /** "DNA" | "NEURAL" | "SENTIMENT" */
  engine: "DNA" | "NEURAL" | "SENTIMENT";
}

/** DNA/pattern match from archive */
export interface IntelligencePattern {
  /** e.g. "P-0182" */
  id: string;
  name: string;
  description: string;
  /** 0–100 — how strongly this pattern is active in current match */
  matchPct: number;
  status: "ACTIVE" | "INACTIVE";
  category: "BATTING" | "BOWLING" | "MATCH_STATE" | "PRESSURE";
  /** Historical occurrences count */
  occurrences: number;
  /** Historical outcome when pattern was active */
  historicalOutcome: string;
}

/** Event-driven market impact vector */
export interface EventImpact {
  event: "WICKET" | "BOUNDARY" | "SIX" | "POWERPLAY_END" | "DEATH_OVER_START" | "PARTNERSHIP_BROKEN";
  label: string;
  volatilityDelta: number;   // e.g. +18 or -6 (percent)
  direction: "UP" | "DOWN";
  affectedMarkets: string[]; // market types affected
  confidence: number;        // 0–100
}

/** Real-time momentum snapshot */
export interface MomentumScore {
  matchId: string;
  /** 0–100 momentum score for batting team */
  score: number;
  winProbability: number;    // 0–100
  pressureIndex: number;     // 0–100 (higher = more pressure on batting side)
  trend: "RISING" | "FALLING" | "STABLE";
  runRate: number;
  requiredRunRate?: number;
  overs: number;
}

/** Outcome probability distribution point */
export interface OutcomePoint {
  label: string;
  probability: number;  // 0–100
  range?: string;       // e.g. ">360 runs"
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
}

/** Hypothetical scenario for AI Scenario Lab */
export interface Scenario {
  id: string;
  label: string;
  description: string;
  branch: "WICKET" | "ACCELERATION" | "BOWLING_CHANGE" | "POWERPLAY" | "RAIN";
}

/** Projected impact of a hypothetical DNA branch */
export interface ScenarioProjection {
  scenarioId: string;
  matchId: string;
  marketImpacts: {
    market: string;
    currentOdds: number;
    projectedOdds: number;
    delta: string;           // e.g. "1.42 → 1.88"
    direction: "UP" | "DOWN";
    confidence: number;
  }[];
  playerImpacts: {
    player: string;
    delta: number;           // points change
    confidence: number;
  }[];
  winProbabilityShift: number; // delta in %
}

/** Full aggregated intelligence context for a match */
export interface MatchIntelligence {
  matchId: string;
  matchLabel: string;
  teamA: string;
  teamB: string;
  currentScore: string;
  currentOvers: number;
  innings: 1 | 2;
  dnaConfidence: number;      // 0–100
  dnaStatus: "LIVE" | "STALE" | "SYNCING";
  momentum: MomentumScore;
  signals: AISignal[];
  patterns: IntelligencePattern[];
  similarMatches: DNAMatch[];
  eventImpacts: EventImpact[];
  outcomeDistribution: OutcomePoint[];
  processingLatencyMs: number;
}
