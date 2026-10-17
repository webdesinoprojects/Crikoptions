import { describe, expect, it } from "vitest";
import type { MatchScoreUpdateEvent } from "@/lib/websocket/match.stream";
import type { Match } from "@/types";
import { classifyMatchScoreEvent, patchMatchScore } from "./match-score-reducer";

const match: Match = {
  id: "match-1",
  title: "Alpha vs Beta",
  status: "LIVE",
  homeTeam: { id: "a", name: "Alpha", shortName: "A" },
  awayTeam: { id: "b", name: "Beta", shortName: "B" },
  startTime: "2026-07-16T12:00:00Z",
  dataSource: "criclive",
  currentScore: 80,
  wicketsLost: 2,
  ballsLeft: 60,
  stateVersion: 10,
  tradingVersion: 4,
  feedState: "healthy",
};

function scoreEvent(stateVersion: number, currentScore = 81): MatchScoreUpdateEvent {
  return {
    matchId: match.id,
    innings: 1,
    currentScore,
    wicketsLost: 2,
    ballsLeft: 59,
    oversText: "10.1",
    status: "live",
    stateVersion,
  };
}

describe("provider match score reducer", () => {
  it("ignores duplicate and out-of-order versions", () => {
    expect(classifyMatchScoreEvent(match, scoreEvent(10))).toBe("ignore");
    expect(classifyMatchScoreEvent(match, scoreEvent(9))).toBe("ignore");
  });

  it("resynchronizes on gaps, corrections, and unversioned provider events", () => {
    expect(classifyMatchScoreEvent(match, scoreEvent(12))).toBe("resync");
    expect(classifyMatchScoreEvent(match, { ...scoreEvent(11), isCorrection: true })).toBe("resync");
    expect(classifyMatchScoreEvent(match, scoreEvent(0))).toBe("resync");
  });

  it("allows a newer authoritative event to revise the score downward", () => {
    const event = scoreEvent(11, 76);
    expect(classifyMatchScoreEvent(match, event)).toBe("patch");
    expect(patchMatchScore(match, event)).toMatchObject({
      currentScore: 76,
      homeScore: "76/2",
      stateVersion: 11,
    });
  });

  it("patches matchPulse and thisOver from score events", () => {
    const event: MatchScoreUpdateEvent = {
      ...scoreEvent(11),
      matchPulse: {
        lastWicket: "No wicket this over",
        momentum: "CSK attacking",
        momentumLevel: "attacking",
        marketVolatility: "High",
        volatilityLevel: "high",
        pressure: "On MI",
        pressureLevel: "chase",
      },
      thisOver: [{ runs: 4, isWicket: false, legalBall: true }],
    };

    expect(patchMatchScore(match, event)).toMatchObject({
      matchPulse: event.matchPulse,
      thisOver: event.thisOver,
    });
  });
});
