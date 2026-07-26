"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Crown, LoaderCircle, Medal, RefreshCw, Trophy } from "lucide-react";
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import { getErrorMessage } from "@/lib/error-message";
import { cn } from "@/lib/utils";
import { formatRoi, formatWinRate, findCurrentUserEntry, leaderboardApi, leaderboardKeys, type LeaderboardEntry } from "@/features/leaderboard/leaderboard";

const podiumStyles = [
  {
    ring: "ring-amber-300/50",
    glow: "shadow-[0_0_28px_rgba(251,191,36,0.28)]",
    badge: "bg-gradient-to-br from-amber-200 to-amber-500 text-amber-950",
    bar: "h-16 bg-gradient-to-t from-amber-500/25 to-amber-300/10", // reduced heights for widget
    icon: Crown,
  },
  {
    ring: "ring-slate-300/40",
    glow: "shadow-[0_0_24px_rgba(148,163,184,0.22)]",
    badge: "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900",
    bar: "h-10 bg-gradient-to-t from-slate-400/20 to-slate-200/10",
    icon: Medal,
  },
  {
    ring: "ring-orange-400/40",
    glow: "shadow-[0_0_24px_rgba(251,146,60,0.22)]",
    badge: "bg-gradient-to-br from-orange-300 to-orange-600 text-orange-950",
    bar: "h-8 bg-gradient-to-t from-orange-500/20 to-orange-300/10",
    icon: Medal,
  },
] as const;

export function DashboardLeaderboardWidget() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const leaderboardQuery = useQuery({
    queryKey: leaderboardKeys.all,
    queryFn: leaderboardApi.getLeaderboard,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const entries = leaderboardQuery.data ?? [];
  const currentUserEntry = React.useMemo(() => findCurrentUserEntry(entries, user ?? undefined), [entries, user]);
  const showPodium = entries.length >= 3;
  const podium = showPodium ? entries.slice(0, 3) : [];
  
  const tableEntries = React.useMemo(() => {
    const top5 = entries.slice(0, 5);
    if (currentUserEntry && !top5.some(e => e.rank === currentUserEntry.rank)) {
      return [...top5, currentUserEntry];
    }
    return top5;
  }, [entries, currentUserEntry]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#071327]/70 shadow-lg">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.1),transparent_80%),#04101e]/95 p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-300/15 text-amber-200 ring-1 ring-amber-300/25">
            <Trophy className="h-4 w-4" />
          </span>
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-[0.12em] text-white">Leaderboard</h3>
        </div>
        <button
          type="button"
          onClick={() => void leaderboardQuery.refetch()}
          disabled={leaderboardQuery.isFetching}
          className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md border border-white/10 text-muted-foreground transition hover:border-amber-300/30 hover:text-amber-200 disabled:opacity-50"
          aria-label="Refresh leaderboard"
        >
          <RefreshCw className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", leaderboardQuery.isFetching && "animate-spin")} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 [scrollbar-color:rgba(251,191,36,0.22)_transparent] [scrollbar-width:thin]">
        {leaderboardQuery.isLoading ? (
          <PanelState icon={<LoaderCircle className="h-5 w-5 animate-spin text-amber-300" />} label="Loading leaderboard..." />
        ) : leaderboardQuery.isError ? (
          <PanelState
            icon={<Trophy className="h-5 w-5 text-red-300" />}
            label={getErrorMessage(leaderboardQuery.error, "Could not load leaderboard")}
            action={
              <button
                type="button"
                onClick={() => void leaderboardQuery.refetch()}
                className="mt-3 rounded-md border border-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-200 transition hover:bg-white/5"
              >
                Retry
              </button>
            }
          />
        ) : entries.length === 0 ? (
          <PanelState icon={<Trophy className="h-5 w-5 text-amber-300/70" />} label="No leaderboard data yet" />
        ) : (
          <div className="space-y-4">
            {showPodium && (
              <section className="rounded-xl border border-white/10 bg-[#071327]/80 p-3 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.16em] text-amber-200/80">Top Performers</p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground">{entries.length} traders</p>
                </div>
                <div className="grid grid-cols-3 items-end gap-1.5 sm:gap-2">
                  {[1, 0, 2].map((index) => {
                    const entry = podium[index];
                    if (!entry) return <div key={`empty-${index}`} />;
                    const style = podiumStyles[index];
                    const Icon = style.icon;
                    const isMe = currentUserEntry?.rank === entry.rank;

                    return (
                      <div key={entry.rank} className="flex flex-col items-center">
                        <div
                          className={cn(
                            "mb-1.5 sm:mb-2 w-full rounded-lg sm:rounded-xl border border-white/10 bg-[#040a17] p-1.5 sm:p-2 text-center ring-1",
                            style.ring,
                            style.glow,
                            isMe && "border-amber-300/40"
                          )}
                        >
                          <div className={cn("mx-auto mb-1.5 sm:mb-2 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full text-[9px] sm:text-[11px] font-black", style.badge)}>
                            <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                          </div>
                          <p className="truncate text-[9px] sm:text-[10px] font-bold text-white">{entry.name}</p>
                          <p className="truncate text-[8px] sm:text-[9px] uppercase tracking-wide text-muted-foreground hidden sm:block">{entry.country}</p>
                          <p className={cn("mt-0.5 sm:mt-1 font-data-tabular text-[9px] sm:text-[11px] font-black", roiTone(entry.roi))}>
                            {formatRoi(entry.roi)}
                          </p>
                        </div>
                        <div className={cn("w-full rounded-t-lg border border-white/10", style.bar)} />
                        <p className="mt-1 font-data-tabular text-[9px] sm:text-[10px] font-black text-white/70">#{entry.rank}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="overflow-hidden rounded-xl border border-white/10 bg-[#071327]/70">
              <div className="grid grid-cols-[32px_minmax(0,1fr)_44px_40px_48px] sm:grid-cols-[40px_minmax(0,1fr)_54px_46px_56px] gap-2 border-b border-white/10 bg-white/[0.03] px-2 py-2 sm:px-3 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                <span>Rank</span>
                <span>Name</span>
                <span className="text-right">Country</span>
                <span className="text-right">Win</span>
                <span className="text-right">ROI</span>
              </div>

              <div className="divide-y divide-white/6">
                {tableEntries.map((entry) => (
                  <LeaderboardRow
                    key={`${entry.rank}-${entry.name}`}
                    entry={entry}
                    isMe={currentUserEntry?.rank === entry.rank}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("open-leaderboard"))}
                className="w-full border-t border-white/10 bg-white/[0.02] py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-200/80 transition-colors hover:bg-white/[0.04] hover:text-amber-200"
              >
                Open Full Leaderboard
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function LeaderboardRow({ entry, isMe }: { entry: LeaderboardEntry; isMe: boolean }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[32px_minmax(0,1fr)_44px_40px_48px] sm:grid-cols-[40px_minmax(0,1fr)_54px_46px_56px] items-center gap-2 px-2 py-2 sm:px-3 sm:py-2.5 transition-colors",
        isMe ? "bg-amber-300/8" : "hover:bg-white/[0.03]"
      )}
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={cn(
            "inline-flex min-w-5 sm:min-w-6 justify-center rounded-md border px-1 sm:px-1.5 py-0.5 sm:py-1 font-data-tabular text-[9px] sm:text-[11px] font-black",
            entry.rank <= 3
              ? "border-amber-300/30 bg-amber-300/10 text-amber-200"
              : "border-white/10 bg-white/[0.03] text-white/80"
          )}
        >
          {entry.rank}
        </span>
      </div>
      <div className="min-w-0">
        <p className={cn("truncate text-[10px] sm:text-[11px] font-bold", isMe ? "text-amber-200" : "text-white")}>{entry.name}</p>
        {isMe && <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.12em] text-amber-300/80">You</p>}
      </div>
      <p className="truncate text-right text-[9px] sm:text-[10px] font-semibold text-white/70">{entry.country}</p>
      <p className="truncate text-right font-data-tabular text-[9px] sm:text-[10px] font-bold text-slate-200" title="Win rate — share of closed trades in profit">{formatWinRate(entry.winRate)}</p>
      <p className={cn("text-right font-data-tabular text-[10px] sm:text-[11px] font-black", roiTone(entry.roi))}>{formatRoi(entry.roi)}</p>
    </div>
  );
}

function PanelState({
  icon,
  label,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[160px] sm:min-h-[200px] flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-10 text-center">
      <div className="mb-2 sm:mb-3 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
        {icon}
      </div>
      <p className="max-w-xs text-xs sm:text-sm text-muted-foreground">{label}</p>
      {action}
    </div>
  );
}

function roiTone(roi: number) {
  if (roi > 0) return "text-bull-green";
  if (roi < 0) return "text-bear-red";
  return "text-white/70";
}
