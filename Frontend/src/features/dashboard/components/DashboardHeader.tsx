import React from "react";
import { Wallet, TrendingUp, Briefcase, Trophy } from "lucide-react";
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import { usePositions } from "@/features/portfolio/hooks";

interface DashboardHeaderProps {
  overview: any;
}

export function DashboardHeader({ overview }: DashboardHeaderProps) {
  const { user } = useAuthStore();
  const { data: positions } = usePositions();

  // Use real values or fallbacks if loading
  const userName = user?.name ? user.name.split(" ")[0] : "Trader";
  const paperBalance = overview?.totalEquity ?? 2088082;
  const todaysPnL = overview?.dailyPnL ?? 1240;
  const activePositions = positions?.length ?? 0;
  const predictionStreak = 4; // Mocked for now

  return (
    <div className="flex flex-col items-start justify-between gap-3 border-b border-white/5 py-1 pb-3 sm:gap-5 sm:py-2 sm:pb-5 md:flex-row md:items-center">
      {/* Left side: Greeting and context */}
      <div className="min-w-0 space-y-1">
        <h1 className="truncate font-display text-lg font-bold tracking-tight text-white sm:text-2xl">
          Good evening, {userName}
        </h1>
        <p className="max-w-[65ch] text-xs text-on-surface-variant sm:text-sm">
          {activePositions > 0 
            ? `Two matches are live. You have ${activePositions} open positions.`
            : "Welcome to CricOptions. The market is waiting for your next move."}
        </p>
      </div>

      {/* Right side: Key metrics horizontal list */}
      <div className="grid w-full grid-cols-2 gap-2 rounded-xl border border-white/5 bg-[#0a1428]/50 p-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-6 sm:p-4 md:w-auto md:gap-8">
        {/* Paper Balance */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 sm:h-10 sm:w-10">
            <Wallet className="h-4 w-4 text-on-surface-variant sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <div className="mb-0.5 truncate text-[10px] text-on-surface-variant sm:text-xs">Paper Balance</div>
            <div className="truncate font-data-tabular text-sm font-bold text-white sm:text-lg">
              Rs {paperBalance.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-white/10 hidden md:block" />

        {/* Today's P&L */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bull-green/10 sm:h-10 sm:w-10">
            <TrendingUp className="h-4 w-4 text-bull-green sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <div className="mb-0.5 truncate text-[10px] text-on-surface-variant sm:text-xs">Today's P&L</div>
            <div className="truncate font-data-tabular text-sm font-bold text-bull-green sm:text-lg">
              +{todaysPnL < 0 ? "-" : ""}Rs {Math.abs(todaysPnL).toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-white/10 hidden md:block" />

        {/* Active Positions */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 sm:h-10 sm:w-10">
            <Briefcase className="h-4 w-4 text-on-surface-variant sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <div className="mb-0.5 truncate text-[10px] text-on-surface-variant sm:text-xs">Active Positions</div>
            <div className="truncate font-data-tabular text-sm font-bold text-white sm:text-lg">
              {activePositions}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-white/10 hidden md:block" />

        {/* Prediction Streak */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d4af37]/10 sm:h-10 sm:w-10">
            <Trophy className="h-4 w-4 text-[#d4af37] sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <div className="mb-0.5 truncate text-[10px] text-on-surface-variant sm:text-xs">Prediction Streak</div>
            <div className="truncate font-data-tabular text-sm font-bold text-[#d4af37] sm:text-lg">
              {predictionStreak}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
