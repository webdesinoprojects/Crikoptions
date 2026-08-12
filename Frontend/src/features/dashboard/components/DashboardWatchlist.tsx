"use client";

import React from "react";
import { useRemoveWatchlist, useWatchlist } from "@/features/watchlist/hooks/useWatchlist";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { Star } from "lucide-react";
import { toast } from "sonner";

export function DashboardWatchlist() {
  const { data: watchlist, isLoading } = useWatchlist();
  const removeMutation = useRemoveWatchlist();
  const items = watchlist?.items ?? [];

  const handleRemove = (marketId: string, name: string) => {
    removeMutation.mutate(marketId, {
      onSuccess: () => toast.success(`Removed ${name} from watchlist`),
    });
  };

  return (
    <TerminalPanel title="Global Watchlist" subtitle="Backend watchlist market tracking" className="h-[280px]">
      <div className="flex-1 overflow-y-auto text-xs font-data-tabular min-h-0 select-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline/10 text-[9px] text-on-surface-variant uppercase tracking-wider font-bold">
              <th className="pb-1.5 font-bold">Symbol</th>
              <th className="pb-1.5 font-bold text-right">LTP (Rs)</th>
              <th className="pb-1.5 font-bold text-right">Change</th>
              <th className="pb-1.5 font-bold text-right">Volume</th>
              <th className="pb-1.5 text-center font-bold w-10">Act</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/5">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-on-surface-variant">
                  Loading watchlist
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-on-surface-variant">
                  No backend watchlist data
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 group transition-colors">
                  <td className="py-2 flex flex-col justify-center">
                    <span className="font-bold text-white">{item.symbol}</span>
                    <span className="text-[9px] text-on-surface-variant uppercase font-sans font-medium">{item.name}</span>
                  </td>
                  <td className="py-2 text-right font-bold text-white">₵{item.ltp.toFixed(2)}</td>
                  <td className="py-2 text-right font-bold text-on-surface-variant">0.00%</td>
                  <td className="py-2 text-right text-on-surface-variant">0</td>
                  <td className="py-2 text-center">
                    <button
                      onClick={() => handleRemove(item.marketId, item.symbol)}
                      className="p-1 rounded hover:bg-white/10 text-premium-gold transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </TerminalPanel>
  );
}
