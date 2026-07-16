import { adaptMatchStatus } from "@/lib/adapters/match.adapter";
import type { MatchScoreUpdateEvent } from "@/lib/websocket/match.stream";
import type { Match } from "@/types";

export type MatchScoreAction = "ignore" | "patch" | "resync";

export function classifyMatchScoreEvent(current: Match | undefined, event: MatchScoreUpdateEvent): MatchScoreAction {
  const currentVersion = current?.stateVersion ?? 0;
  const incomingVersion = event.stateVersion ?? 0;

  if (incomingVersion > 0 && incomingVersion <= currentVersion) return "ignore";
  if (event.isCorrection) return "resync";
  if (current?.dataSource === "sportmonks" && incomingVersion <= 0) return "resync";
  if (currentVersion > 0 && incomingVersion > currentVersion + 1) return "resync";
  return "patch";
}

export function patchMatchScore(current: Match, event: MatchScoreUpdateEvent): Match {
  const feedState = (event.feedState ?? current.feedState) as Match["feedState"];

  return {
    ...current,
    status: adaptMatchStatus(event.status, feedState),
    innings: event.innings ?? current.innings,
    currentScore: event.currentScore,
    wicketsLost: event.wicketsLost,
    ballsLeft: event.ballsLeft,
    targetScore: event.targetScore ?? current.targetScore,
    currentOver: event.oversText,
    homeScore: `${event.currentScore}/${event.wicketsLost}`,
    liveContext: event.liveContext ?? current.liveContext,
    stateVersion: event.stateVersion ?? current.stateVersion,
    tradingVersion: event.tradingVersion ?? current.tradingVersion,
    feedState,
    tradingState: event.tradingState ?? current.tradingState,
    tradingBlockers: event.tradingBlockers ?? current.tradingBlockers,
    providerPhase: event.providerPhase ?? current.providerPhase,
    lastSuccessfulPollAt: event.lastSuccessfulPollAt ?? current.lastSuccessfulPollAt,
    feedValidUntil: event.feedValidUntil ?? current.feedValidUntil,
  };
}
