"use client";

import { usePortfolio } from "../hooks";
import { TerminalKPI } from "@/components/shared/TerminalComponents";
import { Skeleton } from "@/components/ui/skeleton";

export function PortfolioOverview() {
  const { data, isLoading } = usePortfolio();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[84px] rounded bg-white/5" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const isTotalUp = data.totalPnL >= 0;
  const isDailyUp = data.dailyPnL >= 0;
  const marginPct = data.usedMargin > 0
    ? (data.usedMargin / (data.usedMargin + data.availableMargin)) * 100
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 select-none">
      <TerminalKPI
        label="Total Equity"
        value={`₹${data.totalEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        subText={`Base: ₹${data.baseCapital.toLocaleString()}`}
      />
      <TerminalKPI
        label="Total P&L"
        value={`${isTotalUp ? "+" : ""}₹${Math.abs(data.totalPnL).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        changePercent={data.totalPnLPct}
        trend={isTotalUp ? "UP" : "DOWN"}
      />
      <TerminalKPI
        label="Daily P&L"
        value={`${isDailyUp ? "+" : ""}₹${Math.abs(data.dailyPnL).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        changePercent={data.dailyPnLPct}
        trend={isDailyUp ? "UP" : "DOWN"}
      />
      <TerminalKPI
        label="Win Rate (30D)"
        value={`${data.winRate.toFixed(1)}%`}
        subText={`${data.closedTradesCount} trades closed`}
      />
      <TerminalKPI
        label="Margin Usage"
        value={`₹${data.usedMargin.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        progress={marginPct}
      />
      <TerminalKPI
        label="Available Margin"
        value={`₹${data.availableMargin.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        subText={`Free cash balance`}
      />
    </div>
  );
}
