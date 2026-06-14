"use client";

import { TerminalKPI } from "@/components/shared/TerminalComponents";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolio } from "../hooks";

export function PortfolioOverview() {
  const { data, isLoading } = usePortfolio();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[84px] rounded bg-white/5" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const isTotalUp = data.totalPnL >= 0;
  const isDailyUp = data.dailyPnL >= 0;
  const marginPct =
    data.usedMargin > 0 ? (data.usedMargin / Math.max(data.usedMargin + data.availableMargin, 1)) * 100 : 0;

  return (
    <div className="grid grid-cols-2 gap-2 select-none md:grid-cols-6">
      <TerminalKPI
        density="dense"
        label="Total Equity"
        value={`Rs ${formatWhole(data.totalEquity)}`}
        subText={`Cash: Rs ${formatWhole(data.baseCapital)}`}
      />
      <TerminalKPI
        density="dense"
        label="Total P&L"
        value={`${isTotalUp ? "+" : ""}Rs ${formatWhole(Math.abs(data.totalPnL))}`}
        changePercent={data.totalPnLPct}
        trend={isTotalUp ? "UP" : "DOWN"}
      />
      <TerminalKPI
        density="dense"
        label="Daily P&L"
        value={`${isDailyUp ? "+" : ""}Rs ${formatWhole(Math.abs(data.dailyPnL))}`}
        changePercent={data.dailyPnLPct}
        trend={isDailyUp ? "UP" : "DOWN"}
      />
      <TerminalKPI
        density="dense"
        label="Win Rate (30D)"
        value={`${data.winRate.toFixed(1)}%`}
        subText={`${data.closedTradesCount} trades closed`}
      />
      <TerminalKPI
        density="dense"
        label="Reserved"
        value={`Rs ${formatWhole(data.usedMargin)}`}
        progress={marginPct}
      />
      <TerminalKPI
        density="dense"
        label="Available"
        value={`Rs ${formatWhole(data.availableMargin)}`}
        subText="Paper wallet balance"
      />
    </div>
  );
}

function formatWhole(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
