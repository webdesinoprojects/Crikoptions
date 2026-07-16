import { describe, expect, it } from "vitest";
import { isOrderPreviewFresh } from "./order-preview";

describe("provider order preview expiry", () => {
  const expiry = "2026-07-16T12:00:05.000Z";

  it("is valid only before the server deadline", () => {
    expect(isOrderPreviewFresh(expiry, Date.parse("2026-07-16T12:00:04.999Z"))).toBe(true);
    expect(isOrderPreviewFresh(expiry, Date.parse(expiry))).toBe(false);
    expect(isOrderPreviewFresh(expiry, Date.parse("2026-07-16T12:00:06.000Z"))).toBe(false);
  });

  it("fails closed for missing or malformed deadlines", () => {
    expect(isOrderPreviewFresh(undefined, Date.now())).toBe(false);
    expect(isOrderPreviewFresh("invalid", Date.now())).toBe(false);
    expect(isOrderPreviewFresh(expiry, Number.NaN)).toBe(false);
  });
});
