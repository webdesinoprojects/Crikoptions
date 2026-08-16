"use client";

import Link from "next/link";
import { Check, ChevronRight, Gift, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCC } from "../data/challenges-data";
import { useTodayChallenges } from "../hooks/useTodayChallenges";
import { TodayChallengeMark } from "./TodayChallengeMark";

interface TodayChallengesPanelProps {
  compact?: boolean;
  showFooter?: boolean;
}

export function TodayChallengesPanel({ compact = false, showFooter = true }: TodayChallengesPanelProps) {
  const { today, completedCount, total, rewardPool, isClaimable, claimReward, claimingId } =
    useTodayChallenges();
  const nextId = today.find((item) => item.status !== "COMPLETE")?.id;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a1428]">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Take today's challenge
          </div>
          <p className="mt-1 text-sm text-white/70">
            {completedCount === 0
              ? "Badges stay locked until you finish the matching task."
              : `${completedCount} of ${total} badges unlocked.`}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-data-tabular text-lg font-black text-white">
            {completedCount}
            <span className="text-sm font-semibold text-white/35">/{total}</span>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-on-surface-variant">
            ₵{formatCC(rewardPool)} pool
          </div>
        </div>
      </div>

      <div className={cn("flex-1 space-y-2 p-3 sm:p-4", compact && "space-y-2")}>
        {today.map((challenge) => {
          const complete = challenge.status === "COMPLETE";
          const canClaim = isClaimable(challenge.id);
          const claiming = claimingId === challenge.id;
          const pct = challenge.target
            ? Math.min((challenge.progress / challenge.target) * 100, 100)
            : 0;
          const isNext = challenge.id === nextId;

          return (
            <div
              key={challenge.id}
              className={cn(
                "rounded-lg border p-3 transition-colors",
                complete
                  ? "border-white/10 bg-white/[0.04]"
                  : isNext
                    ? "border-white/12 bg-white/[0.035]"
                    : "border-white/5 bg-white/[0.02]",
              )}
            >
              <div className="flex items-center gap-3">
                <TodayChallengeMark challenge={challenge} size="sm" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-sm font-semibold text-white">
                          {challenge.title}
                        </h4>
                        {!complete ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded bg-white/8 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/40">
                            <Lock className="h-2.5 w-2.5" />
                            Locked
                          </span>
                        ) : (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded bg-emerald-400/12 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                            <Check className="h-2.5 w-2.5" />
                            Unlocked
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-white/40">{challenge.window}</p>
                    </div>
                    <span
                      className="shrink-0 font-data-tabular text-xs font-semibold"
                      style={{ color: challenge.color }}
                    >
                      +₵{formatCC(challenge.reward)}
                    </span>
                  </div>

                  {!compact && (
                    <p className="mt-1.5 text-[12px] leading-snug text-white/45">{challenge.description}</p>
                  )}

                  <div className="mt-2.5 flex items-center gap-2.5">
                    <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-black/40">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: complete ? challenge.color : `${challenge.color}99`,
                        }}
                      />
                    </div>
                    <span className="shrink-0 font-data-tabular text-[11px] text-white/45">
                      {challenge.progress}/{challenge.target}
                    </span>
                    {canClaim ? (
                      <button
                        type="button"
                        onClick={() => claimReward(challenge.id)}
                        disabled={claiming}
                        className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#d4af37] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#120c02] hover:bg-[#f0d78c] disabled:opacity-50"
                      >
                        {claiming ? <Loader2 className="h-3 w-3 animate-spin" /> : <Gift className="h-3 w-3" />}
                        Claim
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showFooter ? (
        <div className="border-t border-white/10 px-4 py-3">
          <Link
            href="/challenges"
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-cyan-400 hover:text-cyan-300"
          >
            View all challenges <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
