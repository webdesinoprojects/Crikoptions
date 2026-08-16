import { describe, expect, it } from "vitest";
import { ACADEMIES } from "./challenges-data";
import { isAcademyComplete, unlockedAcademyIds } from "./academy-badges";
import type { ServerChallenge } from "../services/challenges.service";

function challenge(
  partial: Pick<ServerChallenge, "id" | "academyId" | "status">,
): ServerChallenge {
  return {
    title: partial.id,
    description: "",
    target: 1,
    progress: partial.status === "COMPLETE" ? 1 : 0,
    reward: 500,
    claimed: false,
    ...partial,
  };
}

describe("academy badges", () => {
  it("unlocks a badge only when every task in that academy is complete", () => {
    const longCall = ACADEMIES.find((a) => a.id === "long-call")!;
    const incomplete = longCall.challenges.map((task, index) =>
      challenge({
        id: task.id,
        academyId: "long-call",
        status: index === 0 ? "IN_PROGRESS" : "COMPLETE",
      }),
    );

    expect(isAcademyComplete(longCall, incomplete)).toBe(false);

    const complete = longCall.challenges.map((task) =>
      challenge({ id: task.id, academyId: "long-call", status: "COMPLETE" }),
    );
    expect(isAcademyComplete(longCall, complete)).toBe(true);
  });

  it("unlocks each academy independently", () => {
    const longCall = ACADEMIES.find((a) => a.id === "long-call")!;
    const shortCall = ACADEMIES.find((a) => a.id === "short-call")!;
    const challenges = [
      ...longCall.challenges.map((task) =>
        challenge({ id: task.id, academyId: "long-call", status: "COMPLETE" }),
      ),
      ...shortCall.challenges.map((task) =>
        challenge({ id: task.id, academyId: "short-call", status: "LOCKED" }),
      ),
    ];

    const unlocked = unlockedAcademyIds(challenges);
    expect(unlocked.has("long-call")).toBe(true);
    expect(unlocked.has("short-call")).toBe(false);
    expect(unlocked.has("bull-spread")).toBe(false);
  });
});
