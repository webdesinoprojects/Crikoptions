import { describe, expect, it } from "vitest";
import type { BallEvent } from "./terminal-context";
import { mergeBallLog, normalizeBallLog } from "./ball-log";

function delivery(eventId: string, sequence: number, revision = 1, label = "1"): BallEvent {
  return { eventId, sequence, revision, label, kind: "run" };
}

describe("provider delivery log", () => {
  it("detects a sequence gap and sorts an out-of-order repair", () => {
    const skipped = mergeBallLog([delivery("a", 1)], delivery("c", 3));
    expect(skipped.gapDetected).toBe(true);
    expect(skipped.list.map((ball) => ball.eventId)).toEqual(["a", "c"]);

    const repaired = mergeBallLog(skipped.list, delivery("b", 2));
    expect(repaired.gapDetected).toBe(false);
    expect(repaired.list.map((ball) => ball.eventId)).toEqual(["a", "b", "c"]);
  });

  it("ignores duplicate and stale revisions, then replaces a correction once", () => {
    const original = [delivery("a", 1, 1, "4")];
    expect(mergeBallLog(original, delivery("a", 1, 1, "6"))).toEqual({
      changed: false,
      gapDetected: false,
      list: original,
    });

    const corrected = mergeBallLog(original, delivery("a", 1, 2, "2"));
    expect(corrected.changed).toBe(true);
    expect(corrected.list).toEqual([delivery("a", 1, 2, "2")]);
    expect(mergeBallLog(corrected.list, delivery("a", 1, 1, "4")).changed).toBe(false);
  });

  it("normalizes an authoritative history to the latest revision", () => {
    const normalized = normalizeBallLog([
      delivery("b", 2),
      delivery("a", 1, 1, "4"),
      delivery("a", 1, 2, "2"),
    ]);

    expect(normalized.map(({ eventId, revision, label }) => ({ eventId, revision, label }))).toEqual([
      { eventId: "a", revision: 2, label: "2" },
      { eventId: "b", revision: 1, label: "1" },
    ]);
  });
});
