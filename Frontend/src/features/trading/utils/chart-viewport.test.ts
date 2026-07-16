import { describe, expect, it } from "vitest";
import {
  getInitialLogicalRange,
  isAtLiveEdge,
  shiftLogicalRange,
  translatePriceRange,
} from "./chart-viewport";

describe("getInitialLogicalRange", () => {
  it("fits all bars when the dataset is smaller than the available viewport", () => {
    expect(getInitialLogicalRange(18, 1200)).toBeNull();
  });

  it("opens a large dataset at its latest candles with breathing room", () => {
    expect(getInitialLogicalRange(240, 1200)).toEqual({ from: 162, to: 242 });
  });

  it("uses a readable minimum candle count on narrow screens", () => {
    expect(getInitialLogicalRange(80, 240)).toEqual({ from: 58, to: 82 });
  });
});

describe("isAtLiveEdge", () => {
  it("recognizes a range that still contains the latest candle", () => {
    expect(isAtLiveEdge({ from: 70, to: 99 }, 100)).toBe(true);
  });

  it("detects when the user has moved back into history", () => {
    expect(isAtLiveEdge({ from: 40, to: 72 }, 100)).toBe(false);
  });
});

describe("translatePriceRange", () => {
  it("moves the price window without changing its scale", () => {
    expect(translatePriceRange({ from: 100, to: 200 }, 50, 500)).toEqual({
      from: 110,
      to: 210,
    });
  });

  it("ignores invalid pane dimensions", () => {
    const range = { from: 100, to: 200 };
    expect(translatePriceRange(range, 20, 0)).toBe(range);
  });
});

describe("shiftLogicalRange", () => {
  it("keeps the same candles visible when older history is prepended", () => {
    expect(shiftLogicalRange({ from: 40, to: 70 }, 12)).toEqual({ from: 52, to: 82 });
  });

  it("keeps the original range when no history was prepended", () => {
    const range = { from: 40, to: 70 };
    expect(shiftLogicalRange(range, 0)).toBe(range);
  });
});
