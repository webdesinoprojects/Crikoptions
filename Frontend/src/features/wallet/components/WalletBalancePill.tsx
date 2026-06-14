"use client";

import { Wallet } from "lucide-react";
import { useWallet } from "../hooks";

interface WalletBalancePillProps {
  enabled?: boolean;
}

export function WalletBalancePill({ enabled = true }: WalletBalancePillProps) {
  const { data: wallet, isLoading } = useWallet(enabled);

  if (!enabled) return null;

  return (
    <div className="hidden min-h-10 min-w-[178px] xl:flex items-center gap-3 rounded-lg border border-outline/15 bg-surface px-3.5 py-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
        <Wallet className="h-4.5 w-4.5 text-primary" />
      </div>
      <div className="leading-none">
        <div className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Paper Balance</div>
        <div className="mt-1 font-data-tabular text-sm font-black text-on-surface">
          {isLoading ? "Loading" : `Rs ${formatMoney(wallet?.availableBalance ?? 0)}`}
        </div>
      </div>
    </div>
  );
}

function formatMoney(value: number) {
  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
}
