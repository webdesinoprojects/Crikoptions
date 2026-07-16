import { describe, expect, it } from "vitest";
import { adaptMatch, adaptMatchStatus, type BackendMatch } from "./match.adapter";

const baseMatch: BackendMatch = {
  _id: "507f1f77bcf86cd799439011",
  tournamentId: "league-1",
  format: "T20",
  teamAId: "a",
  teamBId: "b",
  teamAName: "Alpha",
  teamBName: "Beta",
  teamALogo: "",
  teamBLogo: "",
  startTime: "2026-07-16T12:00:00Z",
  status: "live",
  innings: 1,
  currentScore: 42,
  wicketsLost: 2,
  ballsLeft: 84,
  oversText: "6.0",
  createdAt: "2026-07-16T11:00:00Z",
  updatedAt: "2026-07-16T12:10:00Z",
};

describe("Sportmonks match adapter", () => {
  it("preserves feed and trading versions", () => {
    const match = adaptMatch({
      ...baseMatch,
      dataSource: "sportmonks",
      feedState: "healthy",
      tradingState: "open",
      stateVersion: 9,
      tradingVersion: 4,
      tradingBlockers: [],
    });

    expect(match).toMatchObject({
      status: "LIVE",
      dataSource: "sportmonks",
      feedState: "healthy",
      tradingState: "open",
      stateVersion: 9,
      tradingVersion: 4,
    });
  });

  it("maps provider lifecycle states without presenting them as upcoming", () => {
    expect(adaptMatchStatus("Innings Break")).toBe("INNINGS_BREAK");
    expect(adaptMatchStatus("Finished", "finalizing")).toBe("FINALIZING");
    expect(adaptMatchStatus("Aban.")).toBe("ABANDONED");
    expect(adaptMatchStatus("3rd Innings", "unsupported")).toBe("UNSUPPORTED");
  });
});
