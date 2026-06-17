export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  marketIds: string[];
  items?: WatchlistItem[];
}

export interface WatchlistItem {
  id: string;
  marketId: string;
  symbol: string;
  name: string;
  matchId: string;
  ltp: number;
  createdAt: string;
}
