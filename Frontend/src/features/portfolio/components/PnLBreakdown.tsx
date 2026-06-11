"use client";

import { usePerformance } from "../hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { Skeleton } from "@/components/ui/skeleton";

function StatRow({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean | null;
}) {
  const color =
    positive === true
      ? "text-bull-green"
      : positive === false
      ? "text-bear-red"
      : "text-on-surface";

  return (
    <div className="flex items-center justify-between py-1 border-b border-outline/5 last:border-0 select-none">
      <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
        {label}
      </span>
      <span className={`text-[12px] font-mono font-bold ${color}`}>{value}</span>
    </div>
  );
}

export function PnLBreakdown() {
  const { data: perf, isLoading } = usePerformance();

  if (isLoading) {
    return (
      <TerminalPanel density="dense" title="PnL Attribution" className="h-[300px]" subtitle="Performance ratios">
        <div className="space-y-2 flex-1 flex flex-col justify-center">
          <Skeleton className="h-6 w-full bg-white/5" />
          <Skeleton className="h-6 w-[80%] bg-white/5" />
          <Skeleton className="h-6 w-[90%] bg-white/5" />
        </div>
      </TerminalPanel>
    );
  }

  if (!perf) return null;

  const pf =
    perf.profitFactor === Infinity
      ? "∞"
      : perf.profitFactor === 0
      ? "—"
      : perf.profitFactor.toFixed(2);

  return (
    <TerminalPanel
      density="dense"
      title="PnL Attribution"
      subtitle="Hedge-fund analytics & efficiency metrics"
      className="h-[300px]"
    >
      <div className="flex-1 flex flex-col justify-center gap-1">
        <StatRow
          label="Total P&L"
          value={`${perf.totalPnL >= 0 ? "+" : ""}₹${Math.abs(perf.totalPnL).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          positive={perf.totalPnL >= 0}
        />
        <StatRow
          label="Daily P&L"
          value={`${perf.dailyPnL >= 0 ? "+" : ""}₹${Math.abs(perf.dailyPnL).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          positive={perf.dailyPnL >= 0}
        />
        <StatRow
          label="Win Rate"
          value={`${perf.winRate.toFixed(1)}%`}
          positive={perf.winRate >= 50}
        />
        <StatRow
          label="Avg. Win"
          value={perf.avgWin > 0 ? `+₹${perf.avgWin.toFixed(0)}` : "—"}
          positive={perf.avgWin > 0 ? true : null}
        />
        <StatRow
          label="Avg. Loss"
          value={perf.avgLoss > 0 ? `-₹${perf.avgLoss.toFixed(0)}` : "—"}
          positive={perf.avgLoss > 0 ? false : null}
        />
        <StatRow
          label="Profit Factor"
          value={pf}
          positive={perf.profitFactor >= 1.5 ? true : perf.profitFactor < 1 ? false : null}
        />
        <StatRow label="Trades Closed" value={`${perf.closedTradesCount}`} positive={null} />
      </div>
    </TerminalPanel>
  );
}
