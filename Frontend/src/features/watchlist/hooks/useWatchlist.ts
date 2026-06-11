import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { watchlistService } from "../services/watchlist.service";
import { Watchlist } from "@/types";

export const useWatchlist = (userId: string = "user-1") => {
  return useQuery({
    queryKey: ["watchlist", userId],
    queryFn: () => watchlistService.fetchWatchlist(userId),
    staleTime: 10000,
  });
};

export const useAddWatchlist = (userId: string = "user-1") => {
  const queryClient = useQueryClient();
  const queryKey = ["watchlist", userId];

  return useMutation({
    mutationFn: (marketId: string) => watchlistService.addWatchlist(marketId),
    onMutate: async (newMarketId: string) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousWatchlist = queryClient.getQueryData<Watchlist>(queryKey);

      // Optimistically update to the new value
      if (previousWatchlist) {
        queryClient.setQueryData<Watchlist>(queryKey, {
          ...previousWatchlist,
          marketIds: [...previousWatchlist.marketIds, newMarketId],
        });
      } else {
        queryClient.setQueryData<Watchlist>(queryKey, {
          id: "default-watchlist",
          userId,
          name: "My Watchlist",
          marketIds: [newMarketId],
        });
      }

      // Return a context object with the snapshotted value
      return { previousWatchlist };
    },
    onError: (err, newMarketId, context) => {
      // Rollback to the previous value if mutation fails
      if (context?.previousWatchlist) {
        queryClient.setQueryData(queryKey, context.previousWatchlist);
      }
    },
    onSettled: () => {
      // Always refetch after success or error
      queryClient.invalidateQueries({ queryKey });
    },
  });
};

export const useRemoveWatchlist = (userId: string = "user-1") => {
  const queryClient = useQueryClient();
  const queryKey = ["watchlist", userId];

  return useMutation({
    mutationFn: (marketId: string) => watchlistService.removeWatchlist(marketId),
    onMutate: async (marketIdToRemove: string) => {
      await queryClient.cancelQueries({ queryKey });

      const previousWatchlist = queryClient.getQueryData<Watchlist>(queryKey);

      if (previousWatchlist) {
        queryClient.setQueryData<Watchlist>(queryKey, {
          ...previousWatchlist,
          marketIds: previousWatchlist.marketIds.filter((id) => id !== marketIdToRemove),
        });
      }

      return { previousWatchlist };
    },
    onError: (err, marketIdToRemove, context) => {
      if (context?.previousWatchlist) {
        queryClient.setQueryData(queryKey, context.previousWatchlist);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
