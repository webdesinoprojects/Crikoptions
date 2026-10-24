import type { Market, Match } from "@/types";
import { canTradeMatch, hasHardTradeBlockers } from "@/types/match-trading";
import { isMarketRetired, selectPrimaryMarket } from "./market-helpers";

// An explicit escape from the terminal must not auto-open the same market again.
export const FIXTURE_LIST_HREF = "/trading?fixtures=1";

export interface TerminalCandidate {
  match: Match;
  markets: Market[];
}

/** Auto-open only an available contract; manual fixture/history access stays unchanged. */
export function selectAutoOpenMarket(
  candidates: TerminalCandidate[],
  fixturesOnly = false
): Market | undefined {
  if (fixturesOnly) return undefined;

  for (const { match, markets } of candidates) {
    if (!canTradeMatch(match)) continue;
    const available = markets.filter((market) =>
      Boolean(market.id) &&
      market.status.toUpperCase() === "ACTIVE" &&
      (!market.lifecycle || market.lifecycle.toLowerCase() === "open") &&
      !isMarketRetired(market) &&
      !hasHardTradeBlockers(market.blockers)
    );
    const primary = selectPrimaryMarket(available);
    if (primary) return primary;
  }
  return undefined;
}
