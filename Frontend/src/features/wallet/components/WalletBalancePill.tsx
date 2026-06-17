"use client";

import { Wallet } from "lucide-react";
import { useWallet } from "../hooks";

interface WalletBalancePillProps {
  enabled?: boolean;
}

export function WalletBalancePill({ enabled = true }: WalletBalancePillProps) {
  const { data: wallet, isError, isLoading } = useWallet(enabled);

  if (!enabled) return null;

  return (
    <div className="hidden min-h-9 min-w-[150px] items-center gap-2 rounded-lg border border-outline/15 bg-surface px-2.5 py-1.5 shadow-sm shadow-black/10 lg:flex xl:min-w-[178px]">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
        <Wallet className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 leading-none">
        <div className="truncate text-[8px] font-black uppercase tracking-wider text-muted-foreground xl:text-[9px]">
          Paper Balance
        </div>
        <div className="mt-1 truncate font-data-tabular text-[12px] font-black text-on-surface xl:text-sm">
          {isLoading ? "Loading" : isError ? "Unavailable" : `Rs ${formatMoney(wallet?.availableBalance ?? 0)}`}
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
