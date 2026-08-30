import { describe, expect, it } from "vitest";
import { marginForSide } from "./margin";

describe("side margin", () => {
  it("charges a short twice the margin of the same buy", () => {
    expect(marginForSide(5000, "BUY")).toBe(5000);
    expect(marginForSide(5000, "SELL")).toBe(10000);
  });

  it("stays at zero when there is nothing to open", () => {
    expect(marginForSide(0, "SELL")).toBe(0);
  });
});
