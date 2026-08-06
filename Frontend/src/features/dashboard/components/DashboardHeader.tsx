"use client";

import React, { useState, useEffect } from "react";
import { Wallet, TrendingUp, Briefcase, Trophy, Plus } from "lucide-react";
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import { usePositions } from "@/features/portfolio/hooks";
import { AddFundsModal } from "@/features/wallet/components/AddFundsModal";import { PortfolioSummary } from "@/types";

interface DashboardHeaderProps {
  overview: PortfolioSummary | undefined;
}

function getGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  if (hour < 21) return `Good evening, ${name}`;
  return `Good night, ${name}`;
}

function formatINR(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function DashboardHeader({ overview }: DashboardHeaderProps) {
  const { user } = useAuthStore();
  const { data: positions } = usePositions();
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [greeting, setGreeting] = useState("");

  const userName = user?.name ? user.name.split(" ")[0] : "Trader";
  const paperBalance = overview?.totalEquity ?? 0;
  const todaysPnL = overview?.dailyPnL ?? 0;
  const activePositions = positions?.length ?? 0;
  const predictionStreak = 4;
  const pnlPositive = todaysPnL >= 0;

  useEffect(() => {
    const timerId = setTimeout(() => {
      setGreeting(getGreeting(userName));
    }, 0);
    const intervalId = setInterval(() => setGreeting(getGreeting(userName)), 60_000);
    return () => {
      clearTimeout(timerId);
      clearInterval(intervalId);
    };
  }, [userName]);

  return (
    <>
      <div className="flex flex-col items-start justify-between gap-4 border-b border-white/5 pb-4 md:flex-row md:items-center">
        {/* Greeting */}
        <div className="min-w-0 space-y-1">
          <h1 className="truncate font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
            {greeting || `Welcome, ${userName}`}
          </h1>
          <p className="max-w-[55ch] text-xs text-white/40 sm:text-sm">
            {activePositions > 0
              ? `${activePositions} open position${activePositions > 1 ? "s" : ""} across live matches.`
              : "Welcome to CricOptions. The market is waiting for your next move."}
          </p>
        </div>

        {/* Right: Metrics + CTA */}
        <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
          {/* Metric cards row */}
          <div className="flex flex-1 flex-wrap items-center gap-px overflow-hidden rounded-xl md:flex-none"
            style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(10,20,40,0.6)" }}
          >
            {/* Paper Balance — hero metric */}
            <MetricCard
              icon={<Wallet className="h-4 w-4" />}
              label="Paper Balance"
              value={`₵${formatINR(paperBalance)}`}
              valueClass="text-white"
              iconBg="rgba(255,255,255,0.06)"
              hero
            />
            <Divider />
            {/* Today's P&L */}
            <MetricCard
              icon={<TrendingUp className="h-4 w-4" style={{ color: pnlPositive ? "#14b8a6" : "#f43f5e" }} />}
              label="Today's P&L"
              value={`${pnlPositive ? "+" : ""}₵${formatINR(Math.abs(todaysPnL))}`}
              valueClass={pnlPositive ? "text-teal-400" : "text-rose-400"}
              iconBg={pnlPositive ? "rgba(20,184,166,0.1)" : "rgba(244,63,94,0.1)"}
            />
            <Divider />
            {/* Positions */}
            <MetricCard
              icon={<Briefcase className="h-4 w-4 text-white/40" />}
              label="Positions"
              value={String(activePositions)}
              valueClass="text-white"
              iconBg="rgba(255,255,255,0.05)"
            />
            <Divider />
            {/* Streak */}
            <MetricCard
              icon={<Trophy className="h-4 w-4 text-[#d4af37]" />}
              label="Streak"
              value={`${predictionStreak} 🔥`}
              valueClass="text-[#d4af37]"
              iconBg="rgba(212,175,55,0.1)"
            />
          </div>

          {/* Add Funds — gold CTA */}
          <button
            onClick={() => setShowAddFunds(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#000d1a] transition active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #d4af37 0%, #f5d060 50%, #d4af37 100%)",
              boxShadow: "0 4px 20px rgba(212,175,55,0.25)",
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Funds
          </button>
        </div>
      </div>

      <AddFundsModal
        isOpen={showAddFunds}
        onClose={() => setShowAddFunds(false)}
      />
    </>
  );
}

/* ─── Sub-components ─────────────────────────────── */

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass: string;
  iconBg: string;
  hero?: boolean;
}

function MetricCard({ icon, label, value, valueClass, iconBg, hero }: MetricCardProps) {
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 ${hero ? "sm:px-5" : ""}`}>
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-white/35">{label}</div>
        <div className={`mt-0.5 font-bold tabular-nums ${hero ? "text-base sm:text-lg" : "text-sm"} ${valueClass}`}>
          {value}
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="hidden h-8 w-px bg-white/5 sm:block" />;
}
