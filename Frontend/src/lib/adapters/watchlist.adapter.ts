import { Watchlist as FrontendWatchlist, WatchlistItem } from "@/types";

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
  const source = items ?? [];
  const adaptedItems: WatchlistItem[] = source.map((item) => {
    const market = item.market;
    const title = market?.title?.trim() || "0";
    return {
      id: item._id,
      marketId: item.marketId,
      matchId: market?.matchId || "0",
      symbol: symbolFromTitle(title),
      name: title,
      ltp: market?.ltp ?? 0,
      createdAt: item.createdAt,
    };
  });

  return {
    id: "default-watchlist",
    userId: userId || "0",
    name: "My Watchlist",
    marketIds: source.map((item) => item.marketId),
    items: adaptedItems,
  };
}

function symbolFromTitle(title: string): string {
  const words = title
    .split(/[\s/_-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (words.length === 0) return "0";
  return words.map((word) => word[0]).join("").toUpperCase() || "0";
}
