"use client";

import React from "react";
import { useWatchlist, useRemoveWatchlist } from "@/features/watchlist/hooks/useWatchlist";
import { useDashboardOverview } from "@/features/dashboard/hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { Star } from "lucide-react";
import { toast } from "sonner";

export function DashboardWatchlist() {
  const { data: watchlist, isLoading: watchlistLoading } = useWatchlist();
  const removeMutation = useRemoveWatchlist();

  const handleRemove = (marketId: string, name: string) => {
    removeMutation.mutate(marketId, {
      onSuccess: () => {
        toast.success(`Removed ${name} from watchlist`);
      },
    });
  };

  // Mock list of watchlisted items if watchlist is empty or loading
  const mockWatchlist = [
    { id: "market-1", symbol: "MSDHONI", name: "MS Dhoni", ltp: 154.50, change: 4.2, volume: "₹8.4M" },
    { id: "market-2", symbol: "VKOHLI", name: "Virat Kohli", ltp: 182.10, change: -1.8, volume: "₹12.1M" },
    { id: "market-3", symbol: "JBUMRAH", name: "Jasprit Bumrah", ltp: 520.00, change: 3.4, volume: "₹6.8M" },
  ];

  return (
    <TerminalPanel
      title="Global Watchlist"
      subtitle="Selected player derivatives contract tracking"
      className="h-[280px]"
    >
      <div className="flex-1 overflow-y-auto text-xs font-data-tabular min-h-0 select-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline/10 text-[9px] text-on-surface-variant uppercase tracking-wider font-bold">
              <th className="pb-1.5 font-bold">Symbol</th>
              <th className="pb-1.5 font-bold text-right">LTP (₹)</th>
              <th className="pb-1.5 font-bold text-right">Change</th>
              <th className="pb-1.5 font-bold text-right">Volume</th>
              <th className="pb-1.5 text-center font-bold w-10">Act</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/5">
            {mockWatchlist.map((item) => (
              <tr key={item.id} className="hover:bg-white/5 group transition-colors">
                <td className="py-2 flex flex-col justify-center">
                  <span className="font-bold text-white">{item.symbol}</span>
                  <span className="text-[9px] text-on-surface-variant uppercase font-sans font-medium">{item.name}</span>
                </td>
                <td className="py-2 text-right font-bold text-white">₹{item.ltp.toFixed(2)}</td>
                <td className={`py-2 text-right font-bold ${item.change >= 0 ? "text-bull-green" : "text-bear-red"}`}>
                  {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
                </td>
                <td className="py-2 text-right text-on-surface-variant">{item.volume}</td>
                <td className="py-2 text-center">
                  <button
                    onClick={() => handleRemove(item.id, item.symbol)}
                    className="p-1 rounded hover:bg-white/10 text-premium-gold transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TerminalPanel>
  );
}
