"use client";

import { useDashboardOverview } from "@/features/dashboard/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";

export function PortfolioSnapshot() {
  const { data, isLoading } = useDashboardOverview();

  if (isLoading || !data) return null;

  const usagePercent = Math.round((data.marginUsed / (data.marginUsed + data.marginAvailable)) * 100);

  return (
    <Card className="bg-surface-container-lowest border-outline-variant flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <PieChart className="w-4 h-4 text-secondary-container" /> Portfolio Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-on-surface-variant uppercase font-bold tracking-wider">Margin Utilized</span>
            <span className="font-bold">{usagePercent}%</span>
          </div>
          <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
            <div 
              className="bg-secondary-container h-full rounded-full" 
              style={{ width: `${usagePercent}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 border border-outline-variant rounded-lg bg-surface-container/30">
            <span className="text-on-surface-variant block mb-1">Active Positions</span>
            <span className="font-bold font-data-tabular text-sm">{data.openPositionsCount}</span>
          </div>
          <div className="p-2 border border-outline-variant rounded-lg bg-surface-container/30">
            <span className="text-on-surface-variant block mb-1">Available Funds</span>
            <span className="font-bold font-data-tabular text-sm">Rs {data.marginAvailable.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
