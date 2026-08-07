import { describe, expect, it } from "vitest";
import type { Match } from "@/types";
import { matchConditionBadge, matchConditionNotice, scheduledOversFor } from "./match-conditions";
import { canTradeMatch, tradeBlockerMessage } from "@/types/match-trading";
import { tradingOpensMessage } from "./home-matches";

function match(overrides: Partial<Match>): Match {
  return {
    id: "m1",
    title: "Ireland vs Afghanistan",
    status: "LIVE",
    homeTeam: { id: "a", name: "Ireland", shortName: "IRE", logoUrl: "" },
    awayTeam: { id: "b", name: "Afghanistan", shortName: "AFG", logoUrl: "" },
    homeScore: "",
    awayScore: "",
    currentOver: "0.0",
    format: "ODI",
    innings: 1,
    currentScore: 0,
    wicketsLost: 0,
    ballsLeft: 0,
    startTime: new Date().toISOString(),
    ...overrides,
  } as Match;
}

describe("matchConditionNotice", () => {
  it("explains a rain-shortened match with the over limit", () => {
    const shortened = match({
      reducedOvers: true,
      scheduledOvers: 47,
      feedState: "healthy",
      tradingState: "blocked",
      tradingBlockers: ["reduced_overs"],
    });

    const notice = matchConditionNotice(shortened);
    expect(notice?.kind).toBe("reduced_overs");
    expect(notice?.title).toBe("Reduced to 47 overs a side");
    expect(notice?.detail).toMatch(/rain/i);
    expect(matchConditionBadge(shortened)).toBe("Reduced · 47 ov");
  });

  it("keeps a shortened live match untradable", () => {
    const shortened = match({
      reducedOvers: true,
      scheduledOvers: 47,
      feedState: "healthy",
      tradingState: "blocked",
      tradingBlockers: ["reduced_overs"],
    });

    expect(canTradeMatch(shortened)).toBe(false);
    expect(tradeBlockerMessage(shortened)).toBe("Overs reduced — trading suspended");
  });

  it("names a delayed start instead of implying the match simply has not begun", () => {
    const delayed = match({ status: "UPCOMING", providerPhase: "Delayed" });

    expect(matchConditionNotice(delayed)?.kind).toBe("delayed");
    expect(tradingOpensMessage(delayed)).toBe("Start delayed");
  });

  it("distinguishes postponed and abandoned as critical", () => {
    expect(matchConditionNotice(match({ providerPhase: "Postp." }))).toMatchObject({
      kind: "delayed",
      title: "Match postponed",
      tone: "critical",
    });
    expect(matchConditionNotice(match({ providerPhase: "Aban." }))).toMatchObject({
      kind: "abandoned",
      tone: "critical",
    });
  });

  it("reports an interrupted match without matching the innings phases", () => {
    expect(matchConditionNotice(match({ providerPhase: "Int." }))?.kind).toBe("interrupted");
    expect(matchConditionNotice(match({ providerPhase: "1st Innings" }))).toBeNull();
    expect(matchConditionNotice(match({ providerPhase: "2nd Innings" }))).toBeNull();
  });

  it("flags a DLS revision and a super over ahead of other conditions", () => {
    expect(matchConditionNotice(match({ tradingBlockers: ["revised_target"] }))?.kind).toBe(
      "revised_target"
    );
    expect(matchConditionNotice(match({ tradingBlockers: ["super_over"] }))?.kind).toBe("super_over");
  });

  it("says nothing for a normal live match", () => {
    const normal = match({ providerPhase: "1st Innings", feedState: "healthy", scheduledBalls: 300 });
    expect(matchConditionNotice(normal)).toBeNull();
    expect(matchConditionBadge(normal)).toBe("");
    expect(tradingOpensMessage(normal)).toBe("Trading is currently unavailable for this match.");
  });

  it("falls back to the ball count when scheduledOvers is absent", () => {
    expect(scheduledOversFor(match({ scheduledBalls: 282 }))).toBe(47);
    expect(scheduledOversFor(match({ scheduledOvers: 20, scheduledBalls: 120 }))).toBe(20);
  });
});
