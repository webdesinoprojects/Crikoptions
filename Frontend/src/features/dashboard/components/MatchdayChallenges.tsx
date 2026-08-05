"use client";

import { Trophy, Target, CheckCircle2, ChevronRight, Lock, Flame, Zap, Shield, TrendingUp, Timer, Award, Star, Sparkles, Swords } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MockChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  xp: number;
  status: "COMPLETE" | "IN_PROGRESS" | "LOCKED";
  icon: React.ElementType;
  tier: "gold" | "silver" | "bronze";
}

export const MOCK_CHALLENGES: MockChallenge[] = [
  {
    id: "ch-001",
    title: "Read the Chase",
    description: "Complete 3 paper trades during a successful run chase",
    target: 3,
    progress: 2,
    xp: 250,
    status: "IN_PROGRESS",
    icon: Trophy,
    tier: "gold",
  },
  {
    id: "ch-002",
    title: "Powerplay Punter",
    description: "Place a trade in the first 6 overs of any live match",
    target: 1,
    progress: 1,
    xp: 100,
    status: "COMPLETE",
    icon: Zap,
    tier: "bronze",
  },
  {
    id: "ch-003",
    title: "Three-Match Streak",
    description: "Finish 3 consecutive matches with positive P&L",
    target: 3,
    progress: 2,
    xp: 300,
    status: "IN_PROGRESS",
    icon: Flame,
    tier: "gold",
  },
  {
    id: "ch-004",
    title: "Risk Manager",
    description: "Complete a trade with exposure below 25% of portfolio",
    target: 1,
    progress: 1,
    xp: 150,
    status: "COMPLETE",
    icon: Shield,
    tier: "silver",
  },
  {
    id: "ch-005",
    title: "Death Overs Specialist",
    description: "Execute 5 trades during overs 16-20 across any matches",
    target: 5,
    progress: 3,
    xp: 350,
    status: "IN_PROGRESS",
    icon: Target,
    tier: "gold",
  },
  {
    id: "ch-006",
    title: "Early Bird",
    description: "Place a trade within the first 60 seconds of match start",
    target: 1,
    progress: 0,
    xp: 200,
    status: "LOCKED",
    icon: Timer,
    tier: "silver",
  },
  {
    id: "ch-007",
    title: "Diversifier",
    description: "Hold positions in 3 different markets simultaneously",
    target: 3,
    progress: 0,
    xp: 275,
    status: "LOCKED",
    icon: TrendingUp,
    tier: "silver",
  },
  {
    id: "ch-008",
    title: "Century Maker",
    description: "Accumulate Rs 100 in total realized profits in a single matchday",
    target: 100,
    progress: 100,
    xp: 500,
    status: "COMPLETE",
    icon: Award,
    tier: "gold",
  },
  {
    id: "ch-009",
    title: "Iron Hands",
    description: "Hold a position for the entire duration of an innings",
    target: 1,
    progress: 0,
    xp: 400,
    status: "LOCKED",
    icon: Star,
    tier: "gold",
  },
  {
    id: "ch-010",
    title: "Volume King",
    description: "Place 10 trades in a single matchday session",
    target: 10,
    progress: 7,
    xp: 200,
    status: "IN_PROGRESS",
    icon: Flame,
    tier: "bronze",
  },
];

export function MatchdayChallenges() {
  const featured = MOCK_CHALLENGES.find((c) => c.status === "IN_PROGRESS") ?? MOCK_CHALLENGES[0];
  const otherChallenges = MOCK_CHALLENGES.filter((c) => c.id !== featured.id).slice(0, 3);

  const totalXP = MOCK_CHALLENGES.filter((c) => c.status === "COMPLETE").reduce((s, c) => s + c.xp, 0);
  const completedCount = MOCK_CHALLENGES.filter((c) => c.status === "COMPLETE").length;
  const progressPct = Math.round((featured.progress / featured.target) * 100);

  return (
    <div className="bg-[#050b18] rounded-xl border border-white/10 p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch overflow-hidden">
      {/* Left Column: Matchday Challenges UI (~65% width) */}
      <div className="lg:col-span-7 flex flex-col justify-between min-w-0">
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold tracking-widest text-white uppercase">
            MATCHDAY CHALLENGES
          </h3>
          <div className="flex items-center gap-1.5 text-xs font-bold font-data-tabular">
            <Trophy className="w-4 h-4 text-[#d4af37]" />
            <span className="text-[#d4af37]">{totalXP} XP</span>
            <span className="text-white/40 ml-1 font-normal">
              {completedCount}/{MOCK_CHALLENGES.length}
            </span>
          </div>
        </div>

        {/* Featured Highlighted Challenge Card */}
        <div className="bg-[#020612] rounded-xl border border-[#d4af37]/40 p-4 relative overflow-hidden mb-4">
          <div className="flex items-start gap-4">
            {/* Trophy & Fraction Circle Icon */}
            <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex flex-col items-center justify-center shrink-0 border border-[#d4af37]/30">
              <Trophy className="w-5 h-5 text-[#d4af37] mb-0.5" />
              <span className="text-[10px] font-bold text-[#d4af37] font-data-tabular">
                {featured.progress}/{featured.target}
              </span>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white tracking-wide uppercase mb-0.5 truncate">
                {featured.title}
              </h4>
              <p className="text-xs text-white/60 mb-3 line-clamp-1">{featured.description}</p>

              {/* Long Horizontal Progress Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#d4af37] rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-[#d4af37] shrink-0 font-data-tabular">
                  +{featured.xp} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Challenges List */}
        <div className="space-y-1 mb-4">
          {otherChallenges.map((item) => {
            const isComplete = item.status === "COMPLETE";
            const isLocked = item.status === "LOCKED";
            const ItemIcon = item.icon;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-bull-green shrink-0" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 text-white/30 shrink-0" />
                  ) : (
                    <ItemIcon className="w-4 h-4 text-[#d4af37] shrink-0" />
                  )}
                  <span className="text-xs font-medium text-white/80 group-hover:text-white transition-colors truncate">
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3 font-data-tabular">
                  {isComplete ? (
                    <div className="flex items-center gap-1.5 text-bull-green">
                      <span className="text-xs font-bold uppercase tracking-wider">COMPLETE</span>
                      <CheckCircle2 className="w-4 h-4 text-bull-green" />
                    </div>
                  ) : isLocked ? (
                    <span className="text-xs font-bold uppercase tracking-wider text-white/30">
                      LOCKED
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[#d4af37]">
                      <span className="text-xs font-bold">
                        {item.progress}/{item.target}
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

      {/* Right Column: Premium Cricket Banner Card (~35% width) */}
      <div className="lg:col-span-5 relative rounded-xl border border-cyan-500/20 bg-[#030918] overflow-hidden min-h-[280px] lg:min-h-0 flex flex-col justify-between p-5 group shadow-xl">
        {/* Background Graphic Image */}
        <img
          src="/cricket_victory_banner.png"
          alt="Cricket Victory Matchday"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-70 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030918] via-[#030918]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030918]/80 via-transparent to-[#030918]/60" />

        {/* Top Tag */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-cyan-300" />
            MATCHDAY SPECIAL
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            LIVE AT 8:00 PM
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
            Trade live options during peak moments to complete matchday challenges & double your XP.
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
  );
}
