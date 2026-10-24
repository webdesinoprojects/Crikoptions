import { describe, expect, it } from "vitest";
import type { Market, Match } from "@/types";
import { selectAutoOpenMarket } from "./terminal-selection";

function match(overrides: Partial<Match> = {}): Match {
  return { id: "match-1", status: "LIVE", feedState: "healthy", tradingState: "open", ...overrides } as Match;
}
function market(overrides: Partial<Market> = {}): Market {
  return { id: "market-1", matchId: "match-1", title: "Score", type: "match_depth", status: "ACTIVE", lifecycle: "open", ...overrides };
}

describe("selectAutoOpenMarket", () => {
  it("skips an innings break for another live match", () => {
    expect(selectAutoOpenMarket([
      { match: match({ status: "INNINGS_BREAK" }), markets: [market()] },
      { match: match({ id: "match-2" }), markets: [market({ id: "market-2", matchId: "match-2" })] },
    ])?.id).toBe("market-2");
  });

  it.each(["stale", "quota_limited", "finalizing", "terminal", "unsupported"] as const)(
    "skips a live match whose feed is %s", (feedState) => {
      expect(selectAutoOpenMarket([
        { match: match({ feedState }), markets: [market()] },
        { match: match({ id: "match-2" }), markets: [market({ id: "market-2" })] },
      ])?.id).toBe("market-2");
    }
  );

  it("honours hard match blockers without blocking soft sync", () => {
    expect(selectAutoOpenMarket([
      { match: match({ tradingBlockers: ["manual"] }), markets: [market()] },
      { match: match({ id: "soft", feedState: "reconciling", tradingState: "blocked", tradable: false, tradingBlockers: ["reconciling"] }), markets: [market({ id: "soft-market", blockers: ["reconciling"] })] },
    ])?.id).toBe("soft-market");
  });

  it.each([
    { status: "SETTLED" }, { status: "CLOSED" }, { status: "SUSPENDED" },
    { lifecycle: "pending" }, { lifecycle: "settling" }, { lifecycle: "settled" },
    { lifecycle: "void" }, { blockers: ["innings_break"] }, { id: "" },
  ])("skips an unavailable contract %j and checks the next match", (overrides) => {
    expect(selectAutoOpenMarket([
      { match: match(), markets: [market(overrides)] },
      { match: match({ id: "match-2" }), markets: [market({ id: "market-2" })] },
    ])?.id).toBe("market-2");
  });

  it("prefers the available second innings over settled first innings", () => {
    expect(selectAutoOpenMarket([{ match: match(), markets: [
      market({ status: "SETTLED", lifecycle: "settled" }), market({ id: "innings-2" }),
    ] }])?.id).toBe("innings-2");
  });

  it("preserves type priority among available contracts", () => {
    expect(selectAutoOpenMarket([{ match: match(), markets: [
      market({ id: "total", type: "team_total" }), market({ id: "depth" }),
    ] }])?.id).toBe("depth");
  });

  it("supports raw lowercase statuses and legacy contracts without lifecycle", () => {
    expect(selectAutoOpenMarket([{ match: match(), markets: [market({ status: "active", lifecycle: undefined })] }])?.id).toBe("market-1");
  });

  it("accepts a market's short match alias when the match lookup used its hex ID", () => {
    expect(selectAutoOpenMarket([{ match: match({ id: "6ada40477b51ea6e15d0f720" }), markets: [market({ matchId: "wa-nsw" })] }])?.id).toBe("market-1");
  });

  it("leaves explicit fixture browsing alone even when an open market exists", () => {
    expect(selectAutoOpenMarket([{ match: match(), markets: [market()] }], true)).toBeUndefined();
  });

  it("returns no destination when every match is at break or has no market", () => {
    expect(selectAutoOpenMarket([
      { match: match({ status: "INNINGS_BREAK" }), markets: [market()] },
      { match: match(), markets: [] },
    ])).toBeUndefined();
  });
});
