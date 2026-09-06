import { describe, expect, it } from "vitest";
import type { Match } from "@/types";
import { selectHomeStripMatches } from "./home-matches";

function match(partial: Partial<Match> & Pick<Match, "id" | "status">): Match {
  return {
    title: partial.title ?? partial.id,
    format: "ODI",
    homeTeam: { id: "a", name: "A", shortName: "A" },
    awayTeam: { id: "b", name: "B", shortName: "B" },
    homeScore: { runs: 0, wickets: 0, overs: 0 },
    awayScore: { runs: 0, wickets: 0, overs: 0 },
    currentOver: "0.0",
    innings: 1,
    startTime: partial.startTime,
    ...partial,
  } as Match;
}

describe("selectHomeStripMatches", () => {
  it("keeps live matches and pins the two soonest upcoming", () => {
    const live = match({ id: "live-1", status: "LIVE", title: "ENG vs IND" });
    const soon = match({
      id: "up-1",
      status: "UPCOMING",
      title: "WI vs NZ",
      startTime: "2026-07-19T14:00:00Z",
    });
    const later = match({
      id: "up-2",
      status: "UPCOMING",
      title: "WI vs NZ 2",
      startTime: "2026-07-21T18:30:00Z",
    });
    const far = match({
      id: "up-3",
      status: "UPCOMING",
      title: "AUS vs PAK",
      startTime: "2026-07-25T10:00:00Z",
    });

    const strip = selectHomeStripMatches([live], [far, later, soon], 2);

    expect(strip.map((item) => item.id)).toEqual(["live-1", "up-1", "up-2"]);
  });

  it("dedupes a fixture that already appears as live", () => {
    const live = match({ id: "same", status: "LIVE", startTime: "2026-07-19T10:00:00Z" });
    const staleUpcoming = match({
      id: "same",
      status: "UPCOMING",
      startTime: "2026-07-19T10:00:00Z",
    });
    const other1 = match({
      id: "other1",
      status: "UPCOMING",
      startTime: "2026-07-20T10:00:00Z",
    });
    const other2 = match({
      id: "other2",
      status: "UPCOMING",
      startTime: "2026-07-21T10:00:00Z",
    });

    const strip = selectHomeStripMatches([live], [staleUpcoming, other1, other2], 2);
    expect(strip.map((item) => item.id)).toEqual(["same", "other1", "other2"]);
  });
});
