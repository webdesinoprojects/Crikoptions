import { describe, expect, it } from "vitest";
import type { Market } from "@/types";
import { isMarketRetired, selectPrimaryMarket } from "./market-helpers";

function market(overrides: Partial<Market>): Market {
  return {
    id: "m1",
    matchId: "match1",
    title: "Innings Score",
    type: "innings_score",
    status: "ACTIVE",
    ...overrides,
  } as Market;
}

describe("selectPrimaryMarket", () => {
  it("skips a settled innings-1 market for the open innings-2 market", () => {
    // Backend lists markets in innings order, so the settled one comes first.
    const settled = market({ id: "innings1", status: "SETTLED" });
    const open = market({ id: "innings2", status: "ACTIVE" });

    expect(selectPrimaryMarket([settled, open])?.id).toBe("innings2");
  });

  it("prefers an active market over a transiently suspended one", () => {
    const suspended = market({ id: "suspended", status: "SUSPENDED" });
    const open = market({ id: "open", status: "ACTIVE" });

    expect(selectPrimaryMarket([suspended, open])?.id).toBe("open");
  });

  it("falls back to a suspended market when nothing is active", () => {
    const settled = market({ id: "settled", status: "SETTLED" });
    const suspended = market({ id: "suspended", status: "SUSPENDED" });

    expect(selectPrimaryMarket([settled, suspended])?.id).toBe("suspended");
  });

  it("honours type priority among equally tradable markets", () => {
    const total = market({ id: "total", type: "team_total" });
    const depth = market({ id: "depth", type: "match_depth" });

    expect(selectPrimaryMarket([total, depth])?.id).toBe("depth");
  });

  it("treats lowercase backend statuses as terminal", () => {
    const closed = market({ id: "closed", status: "closed" });
    const active = market({ id: "active", status: "active" });

    expect(selectPrimaryMarket([closed, active])?.id).toBe("active");
  });

  it("returns undefined for an empty list", () => {
    expect(selectPrimaryMarket([])).toBeUndefined();
  });
});

describe("isMarketRetired", () => {
  it("treats settled, settling and void lifecycles as retired", () => {
    // Raw backend payload shape: lowercase status plus explicit lifecycle.
    expect(isMarketRetired({ status: "closed", lifecycle: "settled" })).toBe(true);
    expect(isMarketRetired({ status: "active", lifecycle: "settling" })).toBe(true);
    expect(isMarketRetired({ status: "active", lifecycle: "void" })).toBe(true);
  });

  it("does not treat a transient suspension as retired", () => {
    expect(isMarketRetired({ status: "suspended", lifecycle: "open" })).toBe(false);
    expect(isMarketRetired({ status: "SUSPENDED" })).toBe(false);
  });

  it("recognises the adapted SETTLED status without a lifecycle", () => {
    expect(isMarketRetired({ status: "SETTLED" })).toBe(true);
    expect(isMarketRetired({ status: "ACTIVE" })).toBe(false);
  });

  it("is safe on missing markets", () => {
    expect(isMarketRetired(null)).toBe(false);
    expect(isMarketRetired(undefined)).toBe(false);
  });
});
