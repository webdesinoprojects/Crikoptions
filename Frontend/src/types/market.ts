export interface Market {
  id: string;
  matchId: string;
  title: string;
  type: "PLAYER_RUNS" | "MATCH_WINNER" | "PLAYER_WICKETS" | "TEAM_TOTAL";
  status: "ACTIVE" | "SUSPENDED" | "SETTLED";
}

export interface MarketDepth {
  marketId: string;
  bids: Array<{ price: number; quantity: number }>;
  asks: Array<{ price: number; quantity: number }>;
  spread: number;
}
