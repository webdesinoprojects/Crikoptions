"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { DataSourceBadge } from "@/components/shared/DataSourceBadge";
import {
  EquityCurveChart,
  PnLBreakdown,
  PortfolioOverview,
  RiskMetrics,
  TradeOperationsWorkspace,
} from "../components";

export function PortfolioView() {
  const qc = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ["portfolio"] });
    await qc.invalidateQueries({ queryKey: ["wallet"] });
    await qc.invalidateQueries({ queryKey: ["orders"] });
    setTimeout(() => setRefreshing(false), 800);
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b border-outline/10 bg-background/95 backdrop-blur">
        <div>
          <h1 className="text-sm font-bold text-white uppercase tracking-wider font-display">
            Portfolio Hub
          </h1>
          <p className="text-[9px] text-on-surface-variant">
            Aggregated exposure, order workflow, and holding period analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DataSourceBadge source="derived" />
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-[9px] font-bold text-on-surface hover:text-white transition-all px-2.5 py-1 rounded border border-outline/10 bg-surface-dim hover:bg-surface-bright"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
            REFRESH
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        <PortfolioOverview />
        <TradeOperationsWorkspace />

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-3">
          <div className="lg:col-span-7">
            <EquityCurveChart />
          </div>
          <div className="lg:col-span-3">
            <PnLBreakdown />
          </div>
        </div>

        <RiskMetrics />
      </div>
    </div>
  );
}

export default PortfolioView;
