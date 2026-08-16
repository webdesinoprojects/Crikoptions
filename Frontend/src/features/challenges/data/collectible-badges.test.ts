import { describe, expect, it } from "vitest";
import type { ServerChallenge } from "../services/challenges.service";
import { ACADEMIES } from "./challenges-data";
import { buildCollectibleBadges } from "./collectible-badges";

function row(
  partial: Pick<ServerChallenge, "id" | "academyId" | "status"> & Partial<ServerChallenge>,
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

describe("buildCollectibleBadges", () => {
  it("counts 4 daily + 5 academy badges from the GET list", () => {
    const longCall = ACADEMIES.find((item) => item.id === "long-call")!;
    const challenges = [
      ...longCall.challenges.map((task) =>
        row({ id: task.id, academyId: "long-call", status: "COMPLETE" }),
      ),
      row({
        id: "powerplay-pro",
        academyId: "today",
        status: "IN_PROGRESS",
        progress: 1,
        target: 3,
      }),
      row({
        id: "middle-over-genius",
        academyId: "today",
        status: "COMPLETE",
        progress: 3,
        target: 3,
      }),
      row({
        id: "death-over-assassin",
        academyId: "today",
        status: "IN_PROGRESS",
        progress: 0,
        target: 3,
      }),
      row({
        id: "last-over-hero",
        academyId: "today",
        status: "IN_PROGRESS",
        progress: 0,
        target: 1,
      }),
    ];

    const badges = buildCollectibleBadges(challenges);
    const daily = badges.filter((item) => item.kind === "daily");
    const academy = badges.filter((item) => item.kind === "academy");

    expect(daily).toHaveLength(4);
    expect(academy).toHaveLength(5);
    expect(badges).toHaveLength(9);
    expect(badges.filter((item) => item.unlocked)).toHaveLength(2);
    expect(daily.find((item) => item.academyId === "powerplay-pro")?.unlocked).toBe(false);
    expect(daily.find((item) => item.academyId === "middle-over-genius")?.unlocked).toBe(true);
    expect(academy.find((item) => item.academyId === "long-call")?.unlocked).toBe(true);
  });
});
