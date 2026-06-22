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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 py-2 pb-6 border-b border-white/5">
      {/* Left side: Greeting and context */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold font-display text-white tracking-tight">
          Good evening, {userName}
        </h1>
        <p className="text-sm text-on-surface-variant">
          {activePositions > 0 
            ? `Two matches are live. You have ${activePositions} open positions.`
            : "Welcome to CricOptions. The market is waiting for your next move."}
        </p>
      </div>

      {/* Right side: Key metrics horizontal list */}
      <div className="flex flex-wrap items-center gap-6 md:gap-8 bg-[#0a1428]/50 p-4 rounded-xl border border-white/5">
        {/* Paper Balance */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-on-surface-variant" />
          </div>
          <div>
            <div className="text-xs text-on-surface-variant mb-0.5">Paper Balance</div>
            <div className="text-lg font-bold text-white font-data-tabular">
              Rs {paperBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-white/10 hidden md:block" />

        {/* Today's P&L */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-bull-green/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-bull-green" />
          </div>
          <div>
            <div className="text-xs text-on-surface-variant mb-0.5">Today's P&L</div>
            <div className="text-lg font-bold text-bull-green font-data-tabular">
              +{todaysPnL < 0 ? "-" : ""}Rs {Math.abs(todaysPnL).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-white/10 hidden md:block" />

        {/* Active Positions */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-on-surface-variant" />
          </div>
          <div>
            <div className="text-xs text-on-surface-variant mb-0.5">Active Positions</div>
            <div className="text-lg font-bold text-white font-data-tabular">
              {activePositions}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-white/10 hidden md:block" />

        {/* Prediction Streak */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-[#d4af37]" />
          </div>
          <div>
            <div className="text-xs text-on-surface-variant mb-0.5">Prediction Streak</div>
            <div className="text-lg font-bold text-[#d4af37] font-data-tabular">
              {predictionStreak}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
