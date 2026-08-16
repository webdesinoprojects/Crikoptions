import { describe, expect, it } from "vitest";
import type { ServerChallenge } from "../services/challenges.service";
import { selectTodayChallenges, TODAY_DAILY_IDS } from "./today-challenges";

function row(
  partial: Pick<ServerChallenge, "id"> & Partial<ServerChallenge>,
): ServerChallenge {
  return {
    academyId: "today",
    title: partial.id,
    description: "",
    target: 3,
    progress: 0,
    reward: 750,
    status: "IN_PROGRESS",
    claimed: false,
    ...partial,
  };
}

describe("selectTodayChallenges", () => {
  it("finds the four daily ids in GET order and uses server progress/status", () => {
    const challenges: ServerChallenge[] = [
      row({ id: "lc-1", academyId: "long-call", status: "COMPLETE", progress: 1, target: 1 }),
      row({
        id: "powerplay-pro",
        title: "Powerplay Pro",
        progress: 3,
        target: 3,
        reward: 750,
        status: "COMPLETE",
        claimed: false,
      }),
      row({
        id: "middle-over-genius",
        title: "Middle Over Genius",
        progress: 1,
        target: 3,
        reward: 1000,
        status: "IN_PROGRESS",
      }),
      row({ id: "sc-1", academyId: "short-call" }),
      row({
        id: "death-over-assassin",
        progress: 0,
        target: 3,
        reward: 1250,
        status: "IN_PROGRESS",
      }),
      row({
        id: "last-over-hero",
        progress: 0,
        target: 1,
        reward: 1500,
        status: "IN_PROGRESS",
      }),
    ];

    const today = selectTodayChallenges(challenges);
    expect(today.map((item) => item.id)).toEqual([...TODAY_DAILY_IDS]);
    expect(today[0]?.progress).toBe(3);
    expect(today[0]?.status).toBe("COMPLETE");
    expect(today[0]?.claimed).toBe(false);
    expect(today[0]?.reward).toBe(750);
    expect(today[1]?.progress).toBe(1);
    expect(today[1]?.status).toBe("IN_PROGRESS");
  });

  it("does not invent rows or treat progress >= target as complete", () => {
    const today = selectTodayChallenges([
      row({ id: "lc-1", academyId: "long-call" }),
      row({
        id: "powerplay-pro",
        progress: 3,
        target: 3,
        status: "IN_PROGRESS",
      }),
    ]);

    expect(today).toHaveLength(1);
    expect(today[0]?.id).toBe("powerplay-pro");
    expect(today[0]?.status).toBe("IN_PROGRESS");
    expect(today.some((item) => item.id === "last-over-hero")).toBe(false);
  });
});
