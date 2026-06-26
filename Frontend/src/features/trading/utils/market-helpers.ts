import type { Market } from "@/types";

export const PRIMARY_MARKET_PRIORITY: Record<string, number> = {
  match_depth: 0,
  team_total: 1,
};

export function selectPrimaryMarket(markets: Market[]): Market | undefined {
  let primary = markets[0];
  let primaryRank = Number.POSITIVE_INFINITY;

  for (const market of markets) {
    const rank = PRIMARY_MARKET_PRIORITY[(market.type ?? "").toLowerCase()] ?? Number.POSITIVE_INFINITY;
    if (rank < primaryRank) {
      primary = market;
      primaryRank = rank;
      if (rank === 0) break;
    }
  }

  return primary;
}
