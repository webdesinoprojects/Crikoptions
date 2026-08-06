"use client";

import {
  Trophy,
  CheckCircle2,
  ChevronRight,
  Lock,
  Sparkles,
  Swords,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useChallenges } from "@/features/challenges/hooks/useChallenges";
import { ACADEMIES, formatCC } from "@/features/challenges/data/challenges-data";

export function MatchdayChallenges() {
  const {
    academyStates,
    completedCount,
    totalChallenges,
    totalEarned,
  } = useChallenges();

  // Pick the first non-locked academy with an IN_PROGRESS challenge as featured
  const activeAcademies = ACADEMIES.filter((a) => !a.locked);
  const featuredAcademy = activeAcademies[0];
  const featuredStates = academyStates.find(
    (a) => a.academyId === featuredAcademy?.id,
  );

  // Find first IN_PROGRESS challenge in the featured academy
  const featuredIdx = featuredStates?.challenges.findIndex(
    (c) => c.status === "IN_PROGRESS",
  ) ?? 0;
  const featuredChallenge = featuredAcademy?.challenges[featuredIdx >= 0 ? featuredIdx : 0];
  const featuredState = featuredStates?.challenges[featuredIdx >= 0 ? featuredIdx : 0];

  // Other active challenges from other academies
  const otherHighlights = activeAcademies.slice(0, 3).map((academy) => {
    const states = academyStates.find((a) => a.academyId === academy.id);
    const inProgress = states?.challenges.find(
      (c) => c.status === "IN_PROGRESS",
    );
    const challenge = inProgress
      ? academy.challenges.find((c) => c.id === inProgress.id)
      : academy.challenges[0];
    return {
      academy,
      challenge: challenge!,
      state: inProgress ?? states?.challenges[0],
    };
  });

  const completionPct =
    featuredAcademy && featuredStates
      ? Math.round(
          (featuredStates.challenges.filter((c) => c.status === "COMPLETE")
            .length /
            featuredStates.challenges.length) *
            100,
        )
      : 0;

  return (
    <div className="bg-[#0b101c] rounded-xl border border-white/5 overflow-hidden shadow-lg h-full">
      <div className="flex flex-col h-full">
        {/* Top/Left Section: Progress List */}
        <div className="p-5 sm:p-6 flex flex-col flex-1">
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold tracking-widest text-white uppercase">
            CHALLENGES
          </h3>
          <div className="flex items-center gap-1.5 text-xs font-bold font-data-tabular">
            <Trophy className="w-4 h-4 text-[#d4af37]" />
            <span className="text-[#d4af37]">₵{formatCC(totalEarned)}</span>
            <span className="text-white/40 ml-1 font-normal">
              {completedCount}/{totalChallenges}
            </span>
          </div>
        </div>

        {/* Featured Highlighted Challenge Card */}
        {featuredAcademy && featuredChallenge && (
          <div
            className="rounded-xl border p-4 relative overflow-hidden mb-4"
            style={{
              borderColor: `${featuredAcademy.color}40`,
              background: `linear-gradient(135deg, ${featuredAcademy.color}08, transparent)`,
            }}
          >
            <div className="flex items-start gap-4">
              {/* Icon Circle */}
              <div
                className="w-12 h-12 rounded-full flex flex-col items-center justify-center shrink-0 border"
                style={{
                  background: `${featuredAcademy.color}15`,
                  borderColor: `${featuredAcademy.color}40`,
                }}
              >
                <featuredAcademy.icon
                  className="w-5 h-5 mb-0.5"
                  style={{ color: featuredAcademy.color }}
                />
                <span
                  className="text-[10px] font-bold font-data-tabular"
                  style={{ color: featuredAcademy.color }}
                >
                  {featuredIdx + 1}/{featuredAcademy.challenges.length}
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                  style={{ color: featuredAcademy.color }}
                >
                  {featuredAcademy.name}
                </p>
                <h4 className="text-sm font-bold text-white tracking-wide uppercase mb-0.5 truncate">
                  {featuredChallenge.title}
                </h4>
                <p className="text-xs text-white/60 mb-3 line-clamp-1">
                  {featuredChallenge.description}
                </p>

                {/* Progress Bar */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${completionPct}%`,
                        backgroundColor: featuredAcademy.color,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-bold shrink-0 font-data-tabular"
                    style={{ color: featuredAcademy.color }}
                  >
                    +₵{formatCC(featuredChallenge.reward)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sub-Challenges List */}
        <div className="space-y-1 mb-4">
          {otherHighlights.map(({ academy, challenge, state }) => {
            if (!challenge || !state) return null;
            const isComplete = state.status === "COMPLETE";
            const isLocked = state.status === "LOCKED";
            const AcademyIcon = academy.icon;

            return (
              <div
                key={challenge.id}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-bull-green shrink-0" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 text-white/30 shrink-0" />
                  ) : (
                    <AcademyIcon
                      className="w-4 h-4 shrink-0"
                      style={{ color: academy.color }}
                    />
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-white/80 group-hover:text-white transition-colors truncate">
                      {challenge.title}
                    </span>
                    <span
                      className="text-[10px] truncate"
                      style={{ color: `${academy.color}80` }}
                    >
                      {academy.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3 font-data-tabular">
                  {isComplete ? (
                    <div className="flex items-center gap-1.5 text-bull-green">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        COMPLETE
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-bull-green" />
                    </div>
                  ) : isLocked ? (
                    <span className="text-xs font-bold uppercase tracking-wider text-white/30">
                      LOCKED
                    </span>
                  ) : (
                    <div
                      className="flex items-center gap-1.5"
                      style={{ color: academy.color }}
                    >
                      <span className="text-xs font-bold">
                        +₵{formatCC(challenge.reward)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Link */}
        <div className="pt-3 border-t border-white/10 text-center">
          <Link
            href="/challenges"
            className="text-xs font-bold text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            VIEW ALL CHALLENGES <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Bottom Section: Premium Cricket Banner Card */}
      <div className="relative rounded-t-none rounded-b-xl border-t border-cyan-500/20 bg-[#030918] overflow-hidden min-h-[200px] flex flex-col justify-between p-5 group shadow-xl shrink-0">
        {/* Background Graphic Image */}
        <img
          src="/cricket_victory_banner.png"
          alt="Cricket Victory"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-70 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030918] via-[#030918]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030918]/80 via-transparent to-[#030918]/60" />

        {/* Top Tag */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-cyan-300" />
            CHALLENGE SPECIAL
          </span>
        </div>

        {/* Center Title & Info */}
        <div className="relative z-10 my-4 space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 tracking-widest uppercase">
            <Swords className="w-4 h-4 text-cyan-400" />
            <span>TEAM A VS TEAM B</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide leading-tight drop-shadow-md">
            CRICKET VICTORY TIME!
          </h3>
          <p className="text-xs text-white/70 leading-relaxed max-w-xs drop-shadow">
            Trade live options during peak moments to complete challenges &
            earn CricCoins ₵.
          </p>
        </div>

        {/* Bottom CTA Button */}
        <div className="relative z-10 pt-2">
          <Link
            href="/trading"
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-[0.98]"
          >
            <span>JOIN MATCHDAY TRADING</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
