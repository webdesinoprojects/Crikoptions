"use client";

import React from "react";
import { useDashboardOverview } from "@/features/dashboard/hooks";
import { TerminalKPI } from "@/components/shared/TerminalComponents";
import { MatchDNAMomentumChart } from "./MatchDNAMomentumChart";
import { DashboardOrderBook } from "./DashboardOrderBook";
import { ExposureTreemap } from "./ExposureTreemap";
import { MarketMoversHeatmap } from "./MarketMoversHeatmap";
import { DashboardTradeTicket } from "./DashboardTradeTicket";
import { DashboardWatchlist } from "./DashboardWatchlist";
import { OpportunityScanner } from "./OpportunityScanner";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardView() {
  const { data: overview, isLoading } = useDashboardOverview();
  const marginBase = (overview?.marginUsed ?? 0) + (overview?.marginAvailable ?? 0);
  const marginUsagePct = marginBase > 0 ? ((overview?.marginUsed ?? 0) / marginBase) * 100 : 0;
  const riskRating = marginUsagePct > 70 ? "HIGH" : marginUsagePct > 0 ? "ACTIVE" : "0";

  return (
    <div className="flex-1 overflow-hidden h-full">
      <div className="h-full overflow-y-auto p-4 space-y-4">
        {isLoading || !overview ? (
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[84px] rounded bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <TerminalKPI
              label="Portfolio Value"
              value={`Rs ${overview.totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              subText="Backend-derived mark value"
            />
            <TerminalKPI
              label="Daily P&L"
              value={`Rs ${overview.dailyPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              changePercent={overview.dailyPnLPercentage}
              trend={overview.dailyPnLPercentage >= 0 ? "UP" : "DOWN"}
            />
            <TerminalKPI
              label="Margin Usage"
              value={`Rs ${overview.marginUsed.toLocaleString()}`}
              progress={marginUsagePct}
            />
            <TerminalKPI label="Active Signals" value="0" subText="No backend signal feed" />
            <TerminalKPI
              label="Risk Rating"
              value={riskRating}
              subText={`Stress score: ${Math.round(marginUsagePct)}/100`}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          <div className="lg:col-span-7">
            <MatchDNAMomentumChart />
          </div>
          <div className="lg:col-span-3">
            <DashboardOrderBook />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          <div className="lg:col-span-4">
            <ExposureTreemap />
          </div>
          <div className="lg:col-span-3">
            <MarketMoversHeatmap />
          </div>
          <div className="lg:col-span-3">
            <DashboardTradeTicket />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardWatchlist />
          <OpportunityScanner />
        </div>
      </div>
    </div>
  );
}
