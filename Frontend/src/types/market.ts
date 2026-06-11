export interface Market {
  id: string;
  matchId: string;
  title: string;
  type: "PLAYER_RUNS" | "MATCH_WINNER" | "PLAYER_WICKETS" | "TEAM_TOTAL" | "match_depth" | "future" | "technical" | string;
  status: "ACTIVE" | "SUSPENDED" | "SETTLED" | "active" | "closed" | string;
}

export interface MarketDepth {
  marketId: string;
  bids: Array<{ price: number; quantity: number }>;
  asks: Array<{ price: number; quantity: number }>;
  spread: number;
}
