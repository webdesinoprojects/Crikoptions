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
import { DashboardRightRail } from "./DashboardRightRail";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardView() {
  const { data: overview, isLoading } = useDashboardOverview();

  return (
    <div className="flex-1 flex overflow-hidden h-full">
      {/* Center workspace (Fluid width) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Row 1: KPI strip */}
        {isLoading || !overview ? (
          <div className="grid grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-[84px] rounded bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <TerminalKPI
              label="Portfolio Value"
              value={`₹${overview.totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              subText="Base ₹1,00,000"
            />
            <TerminalKPI
              label="Daily P&L"
              value={`₹${overview.dailyPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              changePercent={overview.dailyPnLPercentage}
              trend={overview.dailyPnLPercentage >= 0 ? "UP" : "DOWN"}
            />
            <TerminalKPI
              label="Margin Usage"
              value={`₹${overview.marginUsed.toLocaleString()}`}
              progress={(overview.marginUsed / overview.totalEquity) * 100}
            />
            <TerminalKPI
              label="Active Signals"
              value="12 Signals"
              subText="4 Live engines running"
            />
            <TerminalKPI
              label="Risk Rating"
              value="MODERATE"
              subText="Stress score: 42/100"
            />
          </div>
        )}

        {/* Row 2: Match DNA Chart + Order Book */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          <div className="lg:col-span-7">
            <MatchDNAMomentumChart />
          </div>
          <div className="lg:col-span-3">
            <DashboardOrderBook />
          </div>
        </div>

        {/* Row 3: Treemap + Heatmap + Ticket */}
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

        {/* Row 4: Watchlist + Opportunity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardWatchlist />
          <OpportunityScanner />
        </div>
      </div>

      {/* Right Intelligence Rail */}
      <DashboardRightRail />
    </div>
  );
}
