"use client";

import { useLiveTicker } from "@/features/dashboard/hooks";
import { TrendBadge } from "@/components/shared/Primitives";
import { DataSourceBadge } from "@/components/shared/DataSourceBadge";

export function LiveMarketTicker() {
  const { data: tickers, isLoading } = useLiveTicker();

  if (isLoading || !tickers) return null;

  return (
    <div className="flex-1 max-w-xl mx-8 px-4 py-2 bg-surface-container rounded-lg flex items-center gap-4 overflow-hidden">
      <DataSourceBadge source="simulated" />
      {tickers.map((ticker, index) => (
        <div key={ticker.id} className="flex items-center gap-4">
          <span className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-bold text-xs text-on-surface">{ticker.symbol}:</span>
            <TrendBadge 
              trend={ticker.trend} 
              value={ticker.lastTradedPrice} 
              percentage={ticker.percentageChange}
              className="text-xs font-data-tabular"
            />
          </span>
          {index < tickers.length - 1 && (
            <div className="w-px h-4 bg-outline-variant"></div>
          )}
        </div>
      ))}
    </div>
  );
}
