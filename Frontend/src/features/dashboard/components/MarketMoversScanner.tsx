"use client";

import { useMarketMovers } from "@/features/dashboard/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendBadge } from "@/components/shared/Primitives";
import { DataSourceBadge } from "@/components/shared/DataSourceBadge";

export function MarketMoversScanner() {
  const { data: movers, isLoading } = useMarketMovers();

  if (isLoading || !movers) return null;

  return (
    <Card className="bg-surface-container-lowest border-outline-variant flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center justify-between gap-2">
          Market Movers
          <DataSourceBadge source="derived" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {movers.map((mover) => (
          <div key={mover.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container transition-colors">
            <div>
              <div className="font-bold text-xs">{mover.symbol}</div>
              <div className="text-[10px] text-on-surface-variant">{mover.name}</div>
            </div>
            
            <div className="flex flex-col items-end">
              <TrendBadge 
                trend={mover.type === "GAINER" ? "UP" : "DOWN"} 
                value={mover.price} 
                percentage={mover.changePercent}
                className="text-xs font-data-tabular"
              />
              <span className={`text-[9px] px-1.5 py-0.5 rounded mt-1 font-bold ${
                mover.sentiment === "BULLISH" ? "bg-bull-green/10 text-bull-green" : "bg-bear-red/10 text-bear-red"
              }`}>
                {mover.sentiment}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
