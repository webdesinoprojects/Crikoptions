type MarketLike = { id: string; status?: string; type?: string };

/**
 * Choose the best tradable market for a match. Prefers an active `match_depth`
 * market, then `team_total`, then the first active market, falling back to the
 * first market of any status. Shared by the match strip, dashboard cards, and
 * the trading terminal so every "open this match" entry point agrees.
 */
export function pickPrimaryMarket<T extends MarketLike>(markets: T[]): T | undefined {
  const tradable = markets.filter((market) => {
    const status = (market.status ?? "").toLowerCase();
    return status !== "closed" && status !== "settled" && status !== "suspended";
  });
  const candidates = tradable.length > 0 ? tradable : markets;

  return (
    candidates.find((market) => (market.type ?? "").toLowerCase() === "match_depth") ??
    candidates.find((market) => (market.type ?? "").toLowerCase() === "team_total") ??
    candidates[0]
  );
}
