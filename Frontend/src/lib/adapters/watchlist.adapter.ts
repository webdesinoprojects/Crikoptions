import { Watchlist as FrontendWatchlist } from "@/types";

export interface BackendWatchlistItem {
  _id: string;
  userId: string;
  marketId: string;
  market?: {
    _id: string;
    matchId: string;
    title: string;
    type: string;
    ltp: number;
  };
  createdAt: string;
}

export function adaptWatchlist(userId: string, items: BackendWatchlistItem[]): FrontendWatchlist {
  return {
    id: "default-watchlist",
    userId: userId || "user-1",
    name: "My Watchlist",
    marketIds: items ? items.map((item) => item.marketId) : [],
  };
}
