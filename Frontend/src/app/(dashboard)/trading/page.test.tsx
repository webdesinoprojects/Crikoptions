import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Market, Match } from "@/types";
import TradingIndexPage from "./page";

const state = vi.hoisted(() => ({
  matches: [] as Match[],
  markets: {} as Record<string, Market[]>,
  errors: [] as string[],
  params: "",
  matchesLoading: false,
  queried: [] as string[],
  effects: [] as Array<() => unknown>,
  replace: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: state.replace, push: state.push }),
  useSearchParams: () => new URLSearchParams(state.params),
}));
vi.mock("@/features/dashboard/hooks", () => ({
  useHomeStripMatches: () => ({ data: state.matches, isLoading: state.matchesLoading }),
}));
vi.mock("@/features/trading/hooks", () => ({
  useMarkets: (id: string) => ({ data: state.markets[id] ?? [] }),
}));
vi.mock("@/features/trading/hooks/useOrderBook", () => ({
  marketListQueryOptions: (id: string) => ({ queryKey: ["markets", id] }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQueries: ({ queries }: { queries: Array<{ queryKey: string[] }> }) => queries.map(({ queryKey }) => {
    const id = queryKey[1];
    state.queried.push(id);
    return { data: state.markets[id], isError: state.errors.includes(id) };
  }),
}));
vi.mock("@/components/ui/feature-section-with-bento-grid", () => ({
  FeaturesSectionWithBentoGrid: () => <div>No fixtures</div>,
}));

function match(id: string, overrides: Partial<Match> = {}): Match {
  return { id, title: id, status: "LIVE", feedState: "healthy", tradingState: "open", ...overrides } as Match;
}
function market(id: string, status = "ACTIVE"): Market {
  return { id, matchId: id, title: id, type: "match_depth", status };
}
function render() {
  const html = renderToStaticMarkup(<TradingIndexPage />);
  state.effects.forEach((effect) => effect());
  return html;
}

beforeEach(() => {
  state.matches = [];
  state.markets = {};
  state.errors = [];
  state.params = "";
  state.matchesLoading = false;
  state.queried = [];
  state.effects = [];
  state.replace.mockReset();
  state.push.mockReset();
  vi.spyOn(React, "useEffect").mockImplementation((effect) => { state.effects.push(effect); });
});
afterEach(() => vi.restoreAllMocks());

describe("trading landing navigation", () => {
  it("opens the available live match after an innings break", () => {
    state.matches = [match("break", { status: "INNINGS_BREAK" }), match("live")];
    state.markets = { break: [market("old", "SETTLED")], live: [market("open")] };
    render();
    expect(state.queried).toEqual(["live"]);
    expect(state.replace).toHaveBeenCalledWith("/trading/open");
  });

  it("skips a blocked live match and its market lookup", () => {
    state.matches = [match("blocked", { tradingBlockers: ["feed_stale"] }), match("live")];
    state.markets = { blocked: [market("blocked-market")], live: [market("open")] };
    render();
    expect(state.queried).toEqual(["live"]);
    expect(state.replace).toHaveBeenCalledWith("/trading/open");
  });

  it("does not let a settled market capture the redirect ahead of another match", () => {
    state.matches = [match("old"), match("live")];
    state.markets = { old: [market("settled", "SETTLED")], live: [market("open")] };
    render();
    expect(state.replace).toHaveBeenCalledExactlyOnceWith("/trading/open");
  });

  it("shows break cards and leaves manual access available when none are live", () => {
    state.matches = [match("break", { status: "INNINGS_BREAK" })];
    const html = render();
    expect(html).toContain("Choose a match");
    expect(html).toContain(">Break</span>");
    expect(html).toContain("<button");
    expect(state.replace).not.toHaveBeenCalled();
  });

  it("keeps View fixtures in the list even across refreshes with a tradable match", () => {
    state.params = "fixtures=1";
    state.matches = [match("live")];
    state.markets = { live: [market("open")] };
    expect(render()).toContain("Choose a match");
    expect(render()).toContain("live");
    expect(state.queried).toEqual([]);
    expect(state.replace).not.toHaveBeenCalled();
  });

  it("keeps fixtures reachable while markets load, fail, or do not exist", () => {
    state.matches = [match("pending"), match("failed"), match("empty")];
    state.markets = { failed: [market("stale-cache")], empty: [] };
    state.errors = ["failed"];
    expect(render()).toContain("Choose a match");
    expect(state.replace).not.toHaveBeenCalled();
  });

  it("still opens a usable match while an earlier market lookup is pending", () => {
    state.matches = [match("pending"), match("live")];
    state.markets = { live: [market("open")] };
    render();
    expect(state.replace).toHaveBeenCalledWith("/trading/open");
  });

  it("retains the empty-fixtures fallback", () => {
    expect(render()).toContain("No fixtures");
    expect(state.replace).not.toHaveBeenCalled();
  });
});
