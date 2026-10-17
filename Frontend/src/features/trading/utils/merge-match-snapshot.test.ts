import { describe, expect, it } from "vitest";
import type { Match } from "@/types";
import { mergeMatchSnapshot } from "./merge-match-snapshot";

const base: Match = {
  id: "match-1",
  title: "Alpha vs Beta",
  status: "LIVE",
  homeTeam: { id: "a", name: "Alpha", shortName: "A" },
  awayTeam: { id: "b", name: "Beta", shortName: "B" },
  startTime: "2026-07-16T12:00:00Z",
  dataSource: "criclive",
  stateVersion: 12,
  liveContext: {
    striker: { name: "Ruturaj Gaikwad", runs: 42, balls: 28 },
    nonStriker: { name: "Shivam Dube", runs: 9, balls: 4 },
    bowler: { name: "Bumrah", balls: 6, maidens: 0, runs: 13, wickets: 0 },
    partnership: { runs: 17, balls: 10 },
  },
};

describe("mergeMatchSnapshot", () => {
  it("keeps liveContext when a partial REST poll omits it", () => {
    const incoming: Match = {
      ...base,
      stateVersion: 12,
      currentScore: 142,
      wicketsLost: 3,
      liveContext: undefined,
    };

    expect(mergeMatchSnapshot(base, incoming).liveContext).toEqual(base.liveContext);
  });

  it("accepts newer liveContext from websocket events", () => {
    const incoming: Match = {
      ...base,
      stateVersion: 13,
      liveContext: {
        striker: { name: "Dhoni", runs: 1, balls: 1 },
        nonStriker: { name: "Jadeja", runs: 5, balls: 3 },
        bowler: { name: "Archer", balls: 12, maidens: 0, runs: 20, wickets: 1 },
        partnership: { runs: 6, balls: 4 },
      },
    };

    expect(mergeMatchSnapshot(base, incoming).liveContext?.striker.name).toBe("Dhoni");
  });
});
