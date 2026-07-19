import type { Market } from "@/types";

export const PRIMARY_MARKET_PRIORITY: Record<string, number> = {
  match_depth: 0,
  team_total: 1,
};

const RETIRED_LIFECYCLES = new Set(["settling", "settled", "void"]);
const RETIRED_STATUSES = new Set(["SETTLED", "CLOSED"]);

/** Shape shared by the adapted Market and the raw backend market payload. */
type MarketStateLike = { status?: string | null; lifecycle?: string | null } | null | undefined;

/**
 * A retired market can never take another order — its innings has settled (or
 * voided). Distinct from SUSPENDED, which is a transient feed-sync state that
 * clears on its own.
 */
export function isMarketRetired(market: MarketStateLike): boolean {
  if (!market) return false;
  if (RETIRED_LIFECYCLES.has((market.lifecycle ?? "").toLowerCase())) return true;
  return RETIRED_STATUSES.has((market.status ?? "").toUpperCase());
}

// Tradability outranks type priority: once innings 1 settles, its market stays
// first in the match's market list while the open innings-2 market trails it —
// picking by index alone routed the terminal to a market where every order fails.
function tradabilityTier(market: Market): number {
  if (isMarketRetired(market)) return 2;
  return (market.status ?? "").toUpperCase() === "SUSPENDED" ? 1 : 0;
}

export function selectPrimaryMarket(markets: Market[]): Market | undefined {
  let primary: Market | undefined;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const market of markets) {
    const typeRank = PRIMARY_MARKET_PRIORITY[(market.type ?? "").toLowerCase()] ?? 9;
    const score = tradabilityTier(market) * 100 + typeRank;
    if (score < bestScore) {
      primary = market;
      bestScore = score;
    }
  }

  return primary;
}
