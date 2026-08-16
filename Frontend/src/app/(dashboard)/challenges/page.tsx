"use client";

import {
  ChevronLeft,
  Lock,
  CheckCircle2,
  Gift,
  Loader2,
  Trophy,
  X
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useChallenges } from "@/features/challenges/hooks/useChallenges";
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import {
  ACADEMIES,
  TOTAL_REWARDS,
  formatCC,
  Academy
} from "@/features/challenges/data/challenges-data";
import { getAcademyBadge, markBadgesSeen, readSeenBadgeIds } from "@/features/challenges/data/academy-badges";
import { findCollectibleBadge } from "@/features/challenges/data/collectible-badges";
import { AcademyBadge } from "@/features/challenges/components/AcademyBadge";
import { BadgeTrophySlot } from "@/features/challenges/components/BadgeTrophySlot";
import { BadgeUnlockModal } from "@/features/challenges/components/BadgeUnlockModal";
import { TodayChallengesPanel } from "@/features/challenges/components/TodayChallengesPanel";
import CourseDesignCard, { CardData } from "@/components/ui/course-design-cards";

export default function ChallengesPage() {
  const {
    challenges,
    completedCount,
    totalChallenges,
    totalEarned,
    claimingId,
    claimReward,
    getChallenge,
    isClaimable,
    badges,
    dailyBadges,
    collectibles,
    unlockedBadgeCount,
    totalBadges,
    isAcademyDone,
  } = useChallenges();
  const { user } = useAuthStore();

  const [selectedAcademy, setSelectedAcademy] = useState<string | null>(null);
  const [newBadgeId, setNewBadgeId] = useState<string | null>(null);

  const completionPct = totalChallenges
    ? Math.round((completedCount / totalChallenges) * 100)
    : 0;

  // Helper to map academy to CardData
  const getCardData = (academy: Academy): CardData => {
    const completed = challenges.filter(
      (c) => c.academyId === academy.id && c.status === "COMPLETE",
    ).length;
    const total = academy.challenges.length;
    const pct = Math.round((completed / total) * 100);
    const totalReward = academy.challenges.reduce((sum, c) => sum + c.reward, 0);
    
    // Select stock images based on academy type to look premium
    const images = {
      'long-call': ['https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150', 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=150&h=150'],
      'short-call': ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150&h=150'],
      'bull-spread': ['https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=150&h=150', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150'],
      'iron-fly': ['https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&q=80&w=150&h=150', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150&h=150'],
      'iron-condor': ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150'],
    };

    let colorClass = 'blue';
    if (academy.id === 'long-call') colorClass = 'green';
    if (academy.id === 'short-call') colorClass = 'red';
    if (academy.id === 'bull-spread') colorClass = 'cyan';
    if (academy.id === 'iron-fly') colorClass = 'gold';
    if (academy.id === 'iron-condor') colorClass = 'violet';

    const baseData = {
      id: academy.id,
      colorClass,
      date: `${total} Challenges`,
      title: academy.name,
      description: `Master the art of ${academy.name.toLowerCase()} strategies and earn massive CricCoins.`,
      progressPercent: `${pct}%`,
      progressValue: `${completed}/${total}`,
    };

    const earnedAmount = challenges
      .filter((c) => c.academyId === academy.id && c.claimed)
      .reduce((sum, c) => sum + c.reward, 0);

    const remainingReward = totalReward - earnedAmount;

    let countdownText = `Earn ₵${formatCC(totalReward)}`;
    if (completed === total && remainingReward === 0) {
      countdownText = `Earned ₵${formatCC(totalReward)}`;
    } else if (earnedAmount > 0) {
      countdownText = `Earn ₵${formatCC(remainingReward)} More`;
    }

    return {
      ...baseData,
      countdownText,
      isLocked: academy.locked,
      imgSrc1: images[academy.id as keyof typeof images]?.[0],
      imgSrc2: images[academy.id as keyof typeof images]?.[1],
      imgAlt1: 'Top Trader 1',
      imgAlt2: 'Top Trader 2',
      badgeUnlocked: isAcademyDone(academy.id),
      badgeAcademyId: academy.id,
    };
  };

  useEffect(() => {
    if (!user?.id) return;
    const unlocked = collectibles.filter((b) => b.unlocked).map((b) => b.academyId);
    if (unlocked.length === 0) return;
    const seen = new Set(readSeenBadgeIds(user.id));
    const fresh = unlocked.find((id) => !seen.has(id));
    if (fresh) setNewBadgeId(fresh);
  }, [collectibles, user?.id]);

  const dismissNewBadge = () => {
    if (user?.id && newBadgeId) markBadgesSeen(user.id, [newBadgeId]);
    setNewBadgeId(null);
  };

  const newBadge = newBadgeId
    ? findCollectibleBadge(newBadgeId, collectibles) ?? getAcademyBadge(newBadgeId)
    : undefined;

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedAcademy) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedAcademy]);

  const activeAcademyData = ACADEMIES.find(a => a.id === selectedAcademy);

  return (
    <div className="min-h-full bg-[#030914] text-white p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
      <div className="max-w-6xl mx-auto space-y-8 pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0 shadow-lg"
            >
              <ChevronLeft className="w-6 h-6 text-white/70" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <Trophy className="w-7 h-7 text-[#d4af37] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                <h1 className="text-2xl sm:text-3xl font-black tracking-widest uppercase text-white font-sans drop-shadow-md">
                  CHALLENGES
                </h1>
              </div>
              <p className="text-sm text-white/50 mt-1 font-medium tracking-wide">
                Unlock {totalBadges} badges: {badges.length} academy credentials and {dailyBadges.length} daily medals. Earn CricCoins ₵ on claim.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="₵ Earned"
            value={`₵${formatCC(totalEarned)}`}
            accent="#d4af37"
          />
          <StatCard
            label="Completed"
            value={`${completedCount}`}
            sub={`of ${totalChallenges}`}
            accent="#22c55e"
          />
          <StatCard
            label="Badges"
            value={`${unlockedBadgeCount}`}
            sub={`of ${totalBadges} earned`}
            accent="#d4af37"
          />
          <div className="bg-[#081225] rounded-2xl border border-white/10 p-5 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-cyan-500/5" />
            <div className="relative z-10">
              <span className="text-xs font-black text-white/50 uppercase tracking-widest block mb-3">
                Global Progress
              </span>
              <span className="text-3xl font-black font-data-tabular text-white drop-shadow-lg">
                {completionPct}%
              </span>
              <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden mt-3 shadow-inner">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(34,211,238,0.6)]"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Today's challenges */}
        <TodayChallengesPanel showFooter={false} />

        {/* Today's badges */}
        {dailyBadges.length > 0 ? (
          <div className="rounded-2xl border border-white/8 bg-[#081225] p-5 sm:p-6">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white">Today's badges</h2>
                <p className="mt-1 text-[12px] text-white/40">
                  Each medal stays locked until that daily task is complete.
                </p>
              </div>
              <span className="text-[12px] text-white/40 font-data-tabular">
                {dailyBadges.filter((badge) => badge.unlocked).length}/{dailyBadges.length}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {dailyBadges.map((badge) => (
                <BadgeTrophySlot
                  key={badge.id}
                  badge={badge}
                  unlocked={badge.unlocked}
                  done={badge.done}
                  total={badge.total}
                  unit=""
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* Credentials */}
        <div className="rounded-2xl border border-white/8 bg-[#081225] p-5 sm:p-6">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Academy credentials
              </h2>
              <p className="mt-1 text-[12px] text-white/40">
                Awarded when every task in an academy is complete.
              </p>
            </div>
            <span className="text-[12px] text-white/40 font-data-tabular">
              {badges.filter((badge) => badge.unlocked).length}/{badges.length}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {badges.map((badge) => (
                <BadgeTrophySlot
                  key={badge.id}
                  badge={badge}
                  unlocked={badge.unlocked}
                  done={badge.done}
                  total={badge.total}
                />
              ))}
          </div>
        </div>

        {/* Premium Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACADEMIES.map((academy) => (
            <CourseDesignCard 
              key={academy.id}
              data={getCardData(academy)}
              onClick={() => {
                setSelectedAcademy(academy.id);
              }}
            />
          ))}
        </div>

        {/* Total Rewards Banner */}
        <div className="rounded-3xl border border-[#d4af37]/20 bg-gradient-to-r from-[#d4af37]/10 via-[#d4af37]/5 to-[#d4af37]/10 p-8 flex items-center justify-between shadow-[0_0_40px_rgba(212,175,55,0.05)]">
          <div>
            <span className="text-xs font-black text-[#d4af37]/70 uppercase tracking-widest">
              Total Rewards Pool
            </span>
            <p className="text-4xl font-black text-[#d4af37] font-data-tabular mt-2 drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]">
              ₵{formatCC(TOTAL_REWARDS)}
            </p>
          </div>
          <Trophy className="w-16 h-16 text-[#d4af37]/40" />
        </div>
      </div>

      {/* Challenges Modal Overlay */}
      {selectedAcademy && activeAcademyData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
            onClick={() => setSelectedAcademy(null)}
          />
          
          {/* Modal Content */}
          <div 
            className="relative w-full max-w-xl max-h-[85vh] bg-[#050b18] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{ 
              boxShadow: `0 25px 50px -12px rgba(0,0,0,0.5), 0 0 80px -20px ${activeAcademyData.color}20` 
            }}
          >
            {/* Modal Header */}
            <div 
              className="px-5 py-4 border-b flex items-center justify-between sticky top-0 z-10"
              style={{ 
                backgroundColor: `${activeAcademyData.color}0a`,
                borderColor: `${activeAcademyData.color}15`,
                backdropFilter: 'blur(8px)'
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm"
                  style={{ 
                    backgroundColor: `${activeAcademyData.color}15`,
                    borderColor: `${activeAcademyData.color}30`,
                  }}
                >
                  <activeAcademyData.icon className="w-5 h-5" style={{ color: activeAcademyData.color }} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white uppercase tracking-wide">
                    {activeAcademyData.name}
                  </h2>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    {isAcademyDone(activeAcademyData.id)
                      ? `${getAcademyBadge(activeAcademyData.id)?.rank ?? "Badge"} credential earned`
                      : "Complete all tasks to earn this credential"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAcademyDone(activeAcademyData.id) && getAcademyBadge(activeAcademyData.id) ? (
                  <AcademyBadge
                    badge={getAcademyBadge(activeAcademyData.id)!}
                    unlocked
                    size="sm"
                  />
                ) : null}
                <button 
                  onClick={() => setSelectedAcademy(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>
            </div>

            {/* Modal Body - Challenges List */}
            <div className="overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar">
              {activeAcademyData.challenges.map((challenge, idx) => {
                // Server state is authoritative. An academy with no tradable
                // instrument yet returns nothing, and stays locked.
                const verified = getChallenge(challenge.id);
                const isComplete = verified?.status === "COMPLETE";
                const isLocked = !verified || verified.status === "LOCKED";
                const isClaimed = verified?.claimed === true;
                const isClaiming = claimingId === challenge.id;
                const isFirstInProgress = verified?.status === "IN_PROGRESS";
                const canClaim = isClaimable(challenge.id);
                const reward = verified?.reward ?? challenge.reward;
                const progress = verified?.progress ?? 0;
                const target = verified?.target ?? 0;

                return (
                  <div
                    key={challenge.id}
                    className={cn(
                      // Every challenge stays legible whatever its state; the
                      // status marker and action area carry the difference.
                      "flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3.5 p-3.5 rounded-xl border transition-all duration-300",
                      isLocked ? "border-white/5 bg-white/[0.01]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]",
                      isFirstInProgress && "border-white/20 bg-white/[0.05] shadow-md scale-[1.01]"
                    )}
                    style={{
                      borderColor: isFirstInProgress ? `${activeAcademyData.color}30` : undefined,
                    }}
                  >
                    {/* Top Row: Icon and Text */}
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      {/* Step number / status */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 text-xs font-bold"
                        style={{
                          background: isComplete ? `${activeAcademyData.color}15` : "rgba(0,0,0,0.2)",
                          borderColor: isComplete ? `${activeAcademyData.color}40` : isFirstInProgress ? `${activeAcademyData.color}40` : "rgba(255,255,255,0.05)",
                          color: isComplete || isFirstInProgress ? activeAcademyData.color : "rgba(255,255,255,0.55)",
                        }}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-4.5 h-4.5" />
                        ) : isLocked ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          idx + 1
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold tracking-wide truncate text-white">
                          {challenge.title}
                        </h4>
                        <p className="text-[11px] mt-0.5 line-clamp-1 text-white/60">
                          {challenge.description}
                        </p>
                      </div>
                    </div>

                    {/* Reward / Action */}
                    <div className="shrink-0 flex items-center justify-between sm:justify-end pt-3 sm:pt-0 mt-1 sm:mt-0 border-t sm:border-t-0 sm:border-l border-white/5 sm:pl-3">
                      {/* On mobile, show a 'Reward' label on the left to balance the layout if there's no action button, or we can just push it to the right */}
                      <div className="sm:hidden text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        {isComplete ? (isClaimed ? 'Status' : 'Action') : 'Reward'}
                      </div>
                      
                      <div className="flex items-center justify-end">
                        {canClaim ? (
                          <button
                            onClick={() => claimReward(challenge.id)}
                            disabled={isClaiming}
                            className="flex items-center gap-1.5 px-4 py-2 sm:px-3 sm:py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-[0.97] disabled:opacity-50 hover:brightness-110"
                            style={{
                              background: activeAcademyData.color,
                              color: '#000',
                            }}
                          >
                            {isClaiming ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Gift className="w-3 h-3" />
                            )}
                            Claim ₵{formatCC(reward)}
                          </button>
                        ) : isClaimed ? (
                          <span className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-bull-green sm:mb-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Claimed
                            </span>
                            <span className="text-[11px] font-bold text-white/40 font-data-tabular">₵{formatCC(reward)}</span>
                          </span>
                        ) : (
                          <div className="flex flex-col items-end text-right">
                            {/* Real progress toward the server's target — the only
                                way this row ever reaches a claimable state. */}
                            {isFirstInProgress && target > 1 ? (
                              <span className="text-[9px] font-bold uppercase tracking-widest text-white/35 mb-0.5 font-data-tabular">
                                {progress}/{target} done
                              </span>
                            ) : (
                              <span className="hidden sm:block text-[9px] font-bold uppercase tracking-widest text-white/45 mb-0.5">Reward</span>
                            )}
                            <span
                              className="text-xs sm:text-[11px] font-bold font-data-tabular"
                              style={{ color: `${activeAcademyData.color}${isLocked ? "99" : "cc"}` }}
                            >
                              +₵{formatCC(reward)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {newBadge && (
        <BadgeUnlockModal badge={newBadge} onDismiss={dismissNewBadge} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="bg-[#081225] rounded-2xl border border-white/10 p-5 shadow-xl relative overflow-hidden group hover:border-white/20 transition-colors">
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${accent}, transparent)` }}
      />
      <span className="text-xs font-black text-white/50 uppercase tracking-widest block mb-3 relative z-10">
        {label}
      </span>
      <div className="flex items-baseline gap-2 relative z-10">
        <span
          className="text-3xl font-black font-data-tabular drop-shadow-md"
          style={{ color: accent }}
        >
          {value}
        </span>
        {sub && (
          <span className="text-xs font-bold text-white/40 font-data-tabular tracking-wide">{sub}</span>
        )}
      </div>
    </div>
  );
}
