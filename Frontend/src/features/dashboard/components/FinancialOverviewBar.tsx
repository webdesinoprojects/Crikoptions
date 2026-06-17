"use client";

import { useDashboardOverview } from "@/features/dashboard/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DataSourceBadge } from "@/components/shared/DataSourceBadge";

export function FinancialOverviewBar() {
  const { data, isLoading, isError } = useDashboardOverview();

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl bg-surface-container" />
        ))}
      </div>
    );
  }

  if (isError || !data) return null;

  const metrics = [
    { label: "Total Equity", value: `Rs ${data.totalEquity.toLocaleString()}` },
    { label: "Daily P&L", value: `Rs ${data.dailyPnL.toLocaleString()}`, trend: data.dailyPnLPercentage },
    { label: "Margin Available", value: `Rs ${data.marginAvailable.toLocaleString()}` },
    { label: "Open Positions", value: data.openPositionsCount },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric) => (
        <Card key={metric.label} className="bg-surface-container-lowest border-outline-variant shadow-sm">
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                {metric.label}
              </span>
              <DataSourceBadge source="derived" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-headline-md font-bold">{metric.value}</span>
              {metric.trend !== undefined && (
                <span className={`text-xs font-bold ${metric.trend >= 0 ? "text-bull-green" : "text-bear-red"}`}>
                  {metric.trend >= 0 ? "+" : ""}
                  {metric.trend}%
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
