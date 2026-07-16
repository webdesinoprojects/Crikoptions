import { describe, expect, it } from "vitest";
import { isTradingStateConflict } from "./useOrders";

describe("order conflict handling", () => {
  it("recognizes version-fence and generic HTTP 409 conflicts", () => {
    expect(isTradingStateConflict({ response: { status: 409, data: { code: "TRADING_STATE_CHANGED" } } })).toBe(true);
    expect(isTradingStateConflict({ response: { status: 409, data: {} } })).toBe(true);
    expect(isTradingStateConflict({ response: { status: 400, data: { code: "TRADING_STATE_CHANGED" } } })).toBe(true);
  });

  it("does not clear previews for unrelated failures", () => {
    expect(isTradingStateConflict({ response: { status: 500, data: { code: "INTERNAL_ERROR" } } })).toBe(false);
    expect(isTradingStateConflict(new Error("network"))).toBe(false);
  });
});
