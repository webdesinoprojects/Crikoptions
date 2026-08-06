"use client";

import { Wallet } from "lucide-react";
import { useWallet } from "@/features/wallet/hooks";

interface WalletBalancePillProps {
  enabled?: boolean;
}

export function WalletBalancePill({ enabled = true }: WalletBalancePillProps) {
  // Wallet is invalidated on every order/exit/WS update — use it directly so
  // Available Margin updates without a full page refresh.
  const { data: wallet, isError, isLoading } = useWallet(enabled, 5_000);

  if (!enabled) return null;

  return (
    <div 
      className="hidden min-h-9 min-w-[150px] items-center gap-2 rounded-lg px-2.5 py-1.5 shadow-sm lg:flex xl:min-w-[178px] transition-all hover:bg-white/5"
      style={{ border: "1px solid rgba(212,175,55,0.2)", background: "rgba(10,20,40,0.6)" }}
    >
      <div 
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{ background: "rgba(212,175,55,0.1)" }}
      >
        <Wallet className="h-4 w-4 text-[#d4af37]" />
      </div>
      <div className="min-w-0 leading-none">
        <div className="truncate text-[8px] font-black uppercase tracking-wider text-white/50 xl:text-[9px]">
          Available Margin
        </div>
        <div className="mt-1 truncate font-data-tabular text-[12px] font-black text-white xl:text-sm">
          {isLoading ? "Loading" : isError ? "Unavailable" : `₵${formatMoney(wallet?.availableBalance ?? 0)}`}
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
