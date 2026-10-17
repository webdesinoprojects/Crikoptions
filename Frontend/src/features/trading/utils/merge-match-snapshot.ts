import type { LiveMatchContext, Match, MatchPulse, OverBall } from "@/types";

/**
 * Merge an incoming REST/WS snapshot onto cached match state without dropping
 * nested feed fields that the backend may omit on partial polls.
 */
export function mergeMatchSnapshot(current: Match | undefined, incoming: Match): Match {
  if (!current) return incoming;

  const incomingVersion = incoming.stateVersion ?? 0;
  const currentVersion = current.stateVersion ?? 0;
  const incomingIsOlder =
    (incoming.dataSource === "criclive" || incoming.dataSource === "sportmonks") &&
    incomingVersion > 0 &&
    currentVersion > 0 &&
    incomingVersion < currentVersion;

  const liveContext = pickLiveContext(incoming.liveContext, current.liveContext, incomingIsOlder);
  const matchPulse = pickMatchPulse(incoming.matchPulse, current.matchPulse, incomingIsOlder);
  const thisOver = pickThisOver(incoming.thisOver, current.thisOver, incomingIsOlder);

  return {
    ...current,
    ...incoming,
    id: current.id || incoming.id,
    liveContext,
    matchPulse,
    thisOver,
    tradable: incoming.tradable ?? current.tradable,
    stateVersion: Math.max(currentVersion, incomingVersion) || incoming.stateVersion || current.stateVersion,
    tradingVersion: Math.max(current.tradingVersion ?? 0, incoming.tradingVersion ?? 0) || incoming.tradingVersion || current.tradingVersion,
  };
}

function pickLiveContext(
  incoming?: LiveMatchContext,
  current?: LiveMatchContext,
  incomingIsOlder?: boolean
): LiveMatchContext | undefined {
  if (incomingIsOlder && hasNamedLiveContext(current)) return current;
  if (hasNamedLiveContext(incoming)) return incoming;
  if (hasNamedLiveContext(current)) return current;
  return incoming ?? current;
}

function pickMatchPulse(
  incoming?: MatchPulse | null,
  current?: MatchPulse | null,
  incomingIsOlder?: boolean
): MatchPulse | null | undefined {
  if (incomingIsOlder && current) return current;
  if (incoming) return incoming;
  return current ?? incoming;
}

function pickThisOver(
  incoming?: OverBall[],
  current?: OverBall[],
  incomingIsOlder?: boolean
): OverBall[] | undefined {
  if (incomingIsOlder && current?.length) return current;
  if (incoming !== undefined) return incoming;
  return current;
}

function hasNamedLiveContext(liveContext?: LiveMatchContext): boolean {
  return Boolean(
    liveContext?.striker?.name?.trim() &&
      liveContext?.nonStriker?.name?.trim() &&
      liveContext?.bowler?.name?.trim()
  );
}
