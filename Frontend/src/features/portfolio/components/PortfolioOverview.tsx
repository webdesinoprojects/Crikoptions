"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolio } from "../hooks";
import { TrendingUp, TrendingDown, Wallet, ShieldCheck, Target } from "lucide-react";
import type { ReactNode } from "react";

export function PortfolioOverview() {
  const { data, isLoading } = usePortfolio();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[96px] rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const isTotalUp = data.totalPnL >= 0;
  const marginPct = data.marginUsagePct;

  return (
    <div className="grid grid-cols-2 gap-3 select-none md:grid-cols-6">
      {/* Primary Equity Card - Sweeping Gradient */}
      <div className="col-span-2 row-span-2 relative overflow-hidden rounded-xl border border-white/10 bg-[#060d1a] p-5 shadow-2xl group hover:border-white/20 transition-all duration-300">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(14,165,233,0.1),transparent_50%)] opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Wallet className="w-16 h-16 text-primary" />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
              Total Equity
            </div>
            <div className="mt-2 font-display text-4xl font-bold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
              Rs {formatWhole(data.totalEquity)}
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-white/5 px-2.5 py-1.5 backdrop-blur-sm border border-white/5 w-fit">
            <span className="text-[10px] font-medium text-on-surface-variant">Base Capital</span>
            <span className="text-xs font-bold text-on-surface">Rs {formatWhole(data.baseCapital)}</span>
          </div>
        </div>
      </div>

      {/* Total PnL */}
      <PremiumKpiCard
        label="Total P&L"
        value={`Rs ${formatWhole(Math.abs(data.totalPnL))}`}
        prefix={isTotalUp ? "+" : "-"}
        positive={isTotalUp}
        pct={data.totalPnLPct}
        icon={isTotalUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
      />

      {/* Available Wallet (Moved up to fill Row 1) */}
      <div className="col-span-2 rounded-xl border border-primary/20 bg-[linear-gradient(180deg,rgba(14,165,233,0.05),transparent)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
        <div className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Available to Trade</div>
        <div className="text-2xl font-bold text-white mb-0.5">Rs {formatWhole(data.availableMargin)}</div>
        <div className="text-[10px] text-primary/70">Paper wallet balance</div>
      </div>

      {/* Win Rate (Expanded to col-span-2) */}
      <div className="col-span-2 rounded-xl border border-white/5 bg-surface-dim/40 p-4 backdrop-blur-sm hover:bg-surface-dim/60 transition-colors">
        <div className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-1 flex items-center justify-between">
          Win Rate (30D)
          <Target className="w-3.5 h-3.5 text-on-surface-variant opacity-50" />
        </div>
        <div className="text-xl font-bold text-white mb-0.5">{data.winRate.toFixed(1)}%</div>
        <div className="text-[10px] text-on-surface-variant">{data.closedTradesCount} trades closed</div>
      </div>

      {/* Margin Usage (Expanded to col-span-2) */}
      <div className="col-span-2 rounded-xl border border-white/5 bg-surface-dim/40 p-4 backdrop-blur-sm hover:bg-surface-dim/60 transition-colors">
        <div className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-1 flex items-center justify-between">
          Reserved Margin
          <ShieldCheck className="w-3.5 h-3.5 text-on-surface-variant opacity-50" />
        </div>
        <div className="text-xl font-bold text-white mb-2">Rs {formatWhole(data.usedMargin)}</div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(marginPct, 100)}%` }} />
        </div>
      </div>
    </div>
  );
}

interface PremiumKpiCardProps {
  label: string;
  value: string;
  prefix: string;
  positive: boolean;
  pct: number;
  icon: ReactNode;
}

function PremiumKpiCard({ label, value, prefix, positive, pct, icon }: PremiumKpiCardProps) {
  const colorClass = positive ? "text-bull-green" : "text-bear-red";
  const glowClass = positive ? "shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "shadow-[0_0_15px_rgba(239,68,68,0.15)]";
  const bgClass = positive ? "bg-bull-green/10" : "bg-bear-red/10";
  const borderClass = positive ? "border-bull-green/20" : "border-bear-red/20";

  return (
    <div className={`col-span-2 relative overflow-hidden rounded-xl border ${borderClass} bg-surface-dim/60 p-4 backdrop-blur-md ${glowClass} transition-all hover:scale-[1.02]`}>
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${bgClass} blur-2xl opacity-50`} />
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{label}</span>
          <div className={`p-1.5 rounded-md ${bgClass} ${colorClass}`}>{icon}</div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl font-bold tracking-tight ${colorClass}`}>
            {prefix}{value}
          </span>
          <span className={`text-xs font-bold ${colorClass} px-1.5 py-0.5 rounded ${bgClass}`}>
            {pct > 0 ? "+" : ""}{pct.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function formatWhole(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
