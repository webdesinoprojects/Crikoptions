import { describe, expect, it } from "vitest";
import type { OverBall } from "@/types";
import { ballEventFromOverBall, isLegalBallEvent, padThisOverBalls } from "./terminal-context";

function overBall(partial: Partial<OverBall>): OverBall {
  return { runs: 0, isWicket: false, legalBall: true, ...partial };
}

describe("ballEventFromOverBall", () => {
  it("maps run outcomes to their display chip", () => {
    expect(ballEventFromOverBall(overBall({ runs: 0 }))).toMatchObject({ label: "0", kind: "dot" });
    expect(ballEventFromOverBall(overBall({ runs: 1 }))).toMatchObject({ label: "1", kind: "run" });
    expect(ballEventFromOverBall(overBall({ runs: 3 }))).toMatchObject({ label: "3", kind: "run" });
    expect(ballEventFromOverBall(overBall({ runs: 4 }))).toMatchObject({ label: "4", kind: "four" });
    expect(ballEventFromOverBall(overBall({ runs: 6 }))).toMatchObject({ label: "6", kind: "six" });
  });

  it("maps a wicket regardless of runs", () => {
    expect(ballEventFromOverBall(overBall({ runs: 0, isWicket: true }))).toMatchObject({ kind: "wicket", label: "W" });
    expect(ballEventFromOverBall(overBall({ runs: 1, isWicket: true }))).toMatchObject({ kind: "wicket", label: "W" });
  });

  it("labels wides and no-balls so they are excluded from the legal count", () => {
    const wide = ballEventFromOverBall(overBall({ runs: 1, legalBall: false, extra: "wide" }));
    const noBall = ballEventFromOverBall(overBall({ runs: 1, legalBall: false, extra: "noball" }));

    expect(wide.label).toBe("Wd");
    expect(noBall.label).toBe("Nb");
    expect(isLegalBallEvent(wide)).toBe(false);
    expect(isLegalBallEvent(noBall)).toBe(false);
  });

  it("reports the extra runs conceded beyond the one-run penalty", () => {
    expect(ballEventFromOverBall(overBall({ runs: 5, legalBall: false, extra: "wide" })).detail).toBe("Wide +4");
    expect(ballEventFromOverBall(overBall({ runs: 1, legalBall: false, extra: "wide" })).detail).toBe("Wide");
  });

  it("keeps byes and leg byes as legal deliveries", () => {
    const bye = ballEventFromOverBall(overBall({ runs: 2, extra: "bye" }));
    const legBye = ballEventFromOverBall(overBall({ runs: 1, extra: "legbye" }));

    expect(isLegalBallEvent(bye)).toBe(true);
    expect(isLegalBallEvent(legBye)).toBe(true);
    expect(bye.detail).toBe("2 byes");
    expect(legBye.detail).toBe("1 leg bye");
  });
});

describe("server over rendering", () => {
  it("pads a partial over to six slots", () => {
    const balls = [overBall({ runs: 1 }), overBall({ runs: 4 })].map(ballEventFromOverBall);
    const padded = padThisOverBalls(balls);

    expect(padded).toHaveLength(6);
    expect(padded.slice(2).every((ball) => ball.kind === "empty")).toBe(true);
  });

  it("does not pad away extras that push the over past six entries", () => {
    // Six legal balls plus a wide is a complete over with seven chips.
    const balls = [
      ...Array.from({ length: 6 }, () => overBall({ runs: 1 })),
      overBall({ runs: 1, legalBall: false, extra: "wide" }),
    ].map(ballEventFromOverBall);

    expect(padThisOverBalls(balls)).toHaveLength(7);
  });

  it("renders an empty strip when the server sends no balls", () => {
    expect(padThisOverBalls([])).toHaveLength(6);
    expect(padThisOverBalls([]).every((ball) => ball.kind === "empty")).toBe(true);
  });
});
