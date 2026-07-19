import { describe, expect, it } from "vitest";
import { canTradeMatch, isSoftSyncFeed, tradeBlockerMessage } from "@/types/match-trading";

describe("canTradeMatch", () => {
  it("allows trading during soft sync even when tradingState is blocked", () => {
    expect(
      canTradeMatch({
        status: "LIVE",
        feedState: "reconciling",
        tradingState: "blocked",
        tradingBlockers: ["reconciling"],
        tradable: false,
      })
    ).toBe(true);

    expect(
      canTradeMatch({
        status: "live",
        feedState: "warming",
        tradingState: "blocked",
        tradingBlockers: ["warming"],
      })
    ).toBe(true);
  });

  it("allows healthy live with open trading", () => {
    expect(
      canTradeMatch({
        status: "LIVE",
        feedState: "healthy",
        tradingState: "open",
        tradingBlockers: [],
        tradable: true,
      })
    ).toBe(true);
  });

  it("blocks hard gates like feed_stale", () => {
    expect(
      canTradeMatch({
        status: "live",
        feedState: "stale",
        tradingState: "blocked",
        tradingBlockers: ["feed_stale"],
        tradable: false,
      })
    ).toBe(false);

    expect(tradeBlockerMessage({
      status: "live",
      feedState: "stale",
      tradingState: "blocked",
      tradingBlockers: ["feed_stale"],
    })).toMatch(/stale/i);
  });

  it("blocks innings break / not live", () => {
    expect(
      canTradeMatch({
        status: "INNINGS_BREAK",
        feedState: "healthy",
        tradingState: "open",
      })
    ).toBe(false);
  });

  it("marks soft sync feed for badge only", () => {
    expect(isSoftSyncFeed("reconciling")).toBe(true);
    expect(isSoftSyncFeed("warming")).toBe(true);
    expect(isSoftSyncFeed("healthy")).toBe(false);
    expect(isSoftSyncFeed("stale")).toBe(false);
  });

  it("does not show blocked message during soft sync", () => {
    expect(
      tradeBlockerMessage({
        status: "LIVE",
        feedState: "reconciling",
        tradingState: "blocked",
        tradingBlockers: ["reconciling"],
        tradable: false,
      })
    ).toBe("");
  });
});
