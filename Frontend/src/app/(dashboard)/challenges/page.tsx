"use client";

import {
  Trophy,
  ChevronLeft,
  Flame,
  Star,
  Lock,
  CheckCircle2,
  ChevronRight,
  Calendar,
  Clock,
  Target,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MOCK_CHALLENGES } from "@/features/dashboard/components/MatchdayChallenges";
import { useState } from "react";

type FilterTab = "all" | "IN_PROGRESS" | "COMPLETE" | "LOCKED";

const TIER_CONFIG = {
  gold: {
    label: "GOLD",
    borderColor: "border-[#d4af37]/40",
    glowColor: "rgba(212, 175, 55, 0.06)",
    accentColor: "#d4af37",
    badgeBg: "bg-[#d4af37]/10",
    badgeBorder: "border-[#d4af37]/30",
    badgeText: "text-[#d4af37]",
    progressBar: "bg-[#d4af37]",
  },
  silver: {
    label: "SILVER",
    borderColor: "border-[#94a3b8]/30",
    glowColor: "rgba(148, 163, 184, 0.04)",
    accentColor: "#94a3b8",
    badgeBg: "bg-[#94a3b8]/10",
    badgeBorder: "border-[#94a3b8]/30",
    badgeText: "text-[#94a3b8]",
    progressBar: "bg-[#94a3b8]",
  },
  bronze: {
    label: "BRONZE",
    borderColor: "border-[#cd7f32]/40",
    glowColor: "rgba(205, 127, 50, 0.06)",
    accentColor: "#cd7f32",
    badgeBg: "bg-[#cd7f32]/10",
    badgeBorder: "border-[#cd7f32]/30",
    badgeText: "text-[#cd7f32]",
    progressBar: "bg-[#cd7f32]",
  },
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "IN_PROGRESS", label: "IN PROGRESS" },
  { key: "COMPLETE", label: "COMPLETED" },
  { key: "LOCKED", label: "LOCKED" },
];

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [sortBy, setSortBy] = useState("Recommended");

  const filtered =
    activeTab === "all"
      ? MOCK_CHALLENGES
      : MOCK_CHALLENGES.filter((c) => c.status === activeTab);

  const totalXP = MOCK_CHALLENGES.reduce((s, c) => s + c.xp, 0);
  const earnedXP = MOCK_CHALLENGES.filter((c) => c.status === "COMPLETE").reduce((s, c) => s + c.xp, 0);
  const completedCount = MOCK_CHALLENGES.filter((c) => c.status === "COMPLETE").length;
  const inProgressCount = MOCK_CHALLENGES.filter((c) => c.status === "IN_PROGRESS").length;
  const completionPct = Math.round((completedCount / MOCK_CHALLENGES.length) * 100);

  return (
    <div className="min-h-full bg-[#030914] text-white p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-lg bg-[#081225] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
            >
              <ChevronLeft className="w-5 h-5 text-white/70" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <Trophy className="w-6 h-6 text-[#d4af37]" />
                <h1 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-white font-sans">
                  MATCHDAY CHALLENGES
                </h1>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Complete challenges to earn XP and climb the leaderboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold font-data-tabular">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#081225] border border-white/10 text-white/70">
              <Calendar className="w-4 h-4 text-white/40" />
              <span>SEASON 04</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#081225] border border-white/10 text-bull-green">
              <Clock className="w-4 h-4 text-bull-green" />
              <span>12 DAYS LEFT</span>
            </div>
          </div>
        </div>

        {/* Stats Row - 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-[#081225] rounded-xl border border-white/10 p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-[#d4af37]" />
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                TOTAL XP EARNED
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-data-tabular text-white">{earnedXP}</span>
              <span className="text-xs text-white/40 font-data-tabular">of {totalXP}</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#081225] rounded-xl border border-white/10 p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-bull-green" />
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                COMPLETED
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-data-tabular text-white">{completedCount}</span>
              <span className="text-xs text-white/40 font-data-tabular">of {MOCK_CHALLENGES.length}</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#081225] rounded-xl border border-white/10 p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                IN PROGRESS
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-data-tabular text-white">{inProgressCount}</span>
              <span className="text-xs text-white/40 font-data-tabular">active</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-[#081225] rounded-xl border border-white/10 p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                COMPLETION
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-black font-data-tabular text-white">{completionPct}%</span>
                <span className="text-xs text-white/40 font-data-tabular">overall</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Sorting Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-[#081225] rounded-xl p-1.5 border border-white/10">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                  activeTab === tab.key
                    ? "bg-[#0ea5e9] text-black shadow-md shadow-cyan-500/20"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#081225] border border-white/10 text-xs font-bold text-white/80 hover:text-white transition-colors">
              <span>Sort: {sortBy}</span>
              <ChevronDown className="w-4 h-4 text-white/50" />
            </button>
          </div>
        </div>

        {/* Challenge Cards Grid - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((challenge) => {
            const tier = TIER_CONFIG[challenge.tier];
            const isComplete = challenge.status === "COMPLETE";
            const isLocked = challenge.status === "LOCKED";
            const progressPct = Math.round((challenge.progress / challenge.target) * 100);
            const Icon = challenge.icon;

            return (
              <div
                key={challenge.id}
                className={cn(
                  "relative rounded-xl border p-4 sm:p-5 flex gap-4 items-stretch overflow-hidden bg-[#070e1c] transition-all duration-300",
                  isComplete
                    ? "border-bull-green/30 bg-[#071617]/40"
                    : isLocked
                    ? "border-white/10 opacity-70 bg-[#050b16]"
                    : tier.borderColor
                )}
                style={{
                  boxShadow: !isLocked && !isComplete ? `inset 0 0 40px ${tier.glowColor}` : undefined,
                }}
              >
                {/* Left Icon Block */}
                <div
                  className={cn(
                    "w-16 sm:w-20 rounded-xl border flex flex-col items-center justify-center shrink-0 p-2 text-center",
                    isComplete
                      ? "border-bull-green/30 bg-bull-green/10"
                      : isLocked
                      ? "border-white/10 bg-white/5"
                      : `${tier.badgeBorder} ${tier.badgeBg}`
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-7 h-7 text-bull-green" />
                  ) : isLocked ? (
                    <Lock className="w-7 h-7 text-white/30" />
                  ) : (
                    <>
                      <Icon className="w-6 h-6 mb-1" style={{ color: tier.accentColor }} />
                      <span
                        className="text-xs font-bold font-data-tabular"
                        style={{ color: tier.accentColor }}
                      >
                        {challenge.progress} / {challenge.target}
                      </span>
                    </>
                  )}
                </div>

                {/* Right Details Block */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    {/* Header line: Title & Tier Badge */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider truncate">
                        {challenge.title}
                      </h3>
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase border shrink-0",
                          tier.badgeBg,
                          tier.badgeBorder,
                          tier.badgeText
                        )}
                      >
                        {tier.label}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-white/60 mb-3 line-clamp-2 leading-relaxed">
                      {challenge.description}
                    </p>
                  </div>

                  {/* Progress Bar & Footer */}
                  <div className="space-y-2.5">
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isComplete
                            ? "bg-bull-green"
                            : isLocked
                            ? "bg-white/10"
                            : tier.progressBar
                        )}
                        style={{ width: `${isComplete ? 100 : isLocked ? 0 : progressPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold">
                      {/* Left status indicator */}
                      <div>
                        {isComplete ? (
                          <div className="flex items-center gap-1.5 text-bull-green">
                            <span>✓</span>
                            <span>COMPLETED</span>
                          </div>
                        ) : isLocked ? (
                          <div className="flex items-center gap-1.5 text-white/40">
                            <Lock className="w-3.5 h-3.5" />
                            <span>LOCKED</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 font-data-tabular text-white/70">
                            <span>
                              {challenge.progress} / {challenge.target}
                            </span>
                            <span className="text-white/40">|</span>
                            <span>{progressPct}% COMPLETE</span>
                          </div>
                        )}
                      </div>

                      {/* Right XP reward */}
                      <div
                        className={cn(
                          "flex items-center gap-1 font-data-tabular",
                          isComplete ? "text-bull-green" : isLocked ? "text-white/40" : "text-[#d4af37]"
                        )}
                      >
                        <span>+{challenge.xp} XP</span>
                        <ChevronRight className="w-4 h-4 opacity-70" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
