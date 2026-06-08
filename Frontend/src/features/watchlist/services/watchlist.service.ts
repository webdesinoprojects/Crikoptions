import { apiClient } from "@/lib/api/client";
import { adaptWatchlist, BackendWatchlistItem } from "@/lib/adapters/watchlist.adapter";
import { Watchlist } from "@/types";

export const watchlistService = {
  fetchWatchlist: async (userId: string = "user-1"): Promise<Watchlist> => {
    const response = await apiClient.get<{ success: boolean; data: BackendWatchlistItem[] }>("/v1/watchlist");
    return adaptWatchlist(userId, response.data.data);
  },

  addWatchlist: async (marketId: string): Promise<any> => {
    const response = await apiClient.post("/v1/watchlist", { marketId });
    return response.data;
  },

  removeWatchlist: async (marketId: string): Promise<any> => {
    const response = await apiClient.delete(`/v1/watchlist/${marketId}`);
    return response.data;
  },
};
