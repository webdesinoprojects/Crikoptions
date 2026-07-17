"use client";

import * as React from "react";
import { Crown, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRoi, type LeaderboardEntry } from "./leaderboard";

type LeaderboardDisplaySize = "full" | "compact";

interface LeaderboardDisplayProps {
  entries: LeaderboardEntry[];
  tableEntries?: LeaderboardEntry[];
  currentUserEntry?: LeaderboardEntry;
  size?: LeaderboardDisplaySize;
  onOpenFull?: () => void;
}

const podiumOrder = [1, 0, 2] as const;

const podiumStyles = [
  {
    label: "Champion",
    icon: Crown,
    card:
      "border-amber-200/35 bg-[linear-gradient(180deg,rgba(251,191,36,0.18),rgba(8,18,37,0.82))] shadow-[0_18px_44px_rgba(251,191,36,0.13)] ring-1 ring-amber-200/25",
    badge: "border-amber-200/40 bg-amber-300 text-amber-950",
    rank: "text-amber-100",
    platform:
      "h-12 border-amber-200/20 bg-[linear-gradient(180deg,rgba(251,191,36,0.18),rgba(251,191,36,0.04))]",
  },
  {
    label: "Runner up",
    icon: Medal,
    card:
      "border-slate-200/25 bg-[linear-gradient(180deg,rgba(203,213,225,0.13),rgba(8,18,37,0.78))] shadow-[0_14px_34px_rgba(148,163,184,0.09)] ring-1 ring-slate-200/18",
    badge: "border-slate-100/35 bg-slate-200 text-slate-950",
    rank: "text-slate-100",
    platform:
      "h-9 border-slate-200/15 bg-[linear-gradient(180deg,rgba(203,213,225,0.13),rgba(203,213,225,0.035))]",
  },
  {
    label: "Third place",
    icon: Medal,
    card:
      "border-orange-300/25 bg-[linear-gradient(180deg,rgba(251,146,60,0.13),rgba(8,18,37,0.78))] shadow-[0_14px_34px_rgba(251,146,60,0.08)] ring-1 ring-orange-300/18",
    badge: "border-orange-200/35 bg-orange-400 text-orange-950",
    rank: "text-orange-100",
    platform:
      "h-7 border-orange-300/15 bg-[linear-gradient(180deg,rgba(251,146,60,0.13),rgba(251,146,60,0.035))]",
  },
] as const;

export function LeaderboardDisplay({
  entries,
  tableEntries = entries,
  currentUserEntry,
  size = "full",
  onOpenFull,
}: LeaderboardDisplayProps) {
  const isCompact = size === "compact";
  const podium = entries.slice(0, 3);
  const showPodium = podium.length >= 3;

  return (
    <div className={cn("relative overflow-hidden", isCompact ? "space-y-3" : "space-y-4")}>
      <DecorativeMarketField />

      <div className="relative z-10">
        {showPodium && (
          <section
            aria-label="Top performers"
            className={cn(
              "overflow-hidden rounded-lg border border-white/10 bg-[#050d1a]/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-xl",
              isCompact ? "p-3" : "p-4"
            )}
          >
            <div className={cn("flex items-center justify-between", isCompact ? "mb-3" : "mb-4")}>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-100/85">
                Top Performers
              </p>
              <p className="font-data-tabular text-[10px] font-semibold text-slate-400">
                {entries.length} traders
              </p>
            </div>

            <div
              className={cn(
                "grid items-end",
                isCompact
                  ? "grid-cols-3 gap-1.5"
                  : "grid-cols-1 gap-3 min-[520px]:grid-cols-3 min-[520px]:gap-2.5"
              )}
            >
              {podiumOrder.map((index) => {
                const entry = podium[index];
                const style = podiumStyles[index];
                const Icon = style.icon;
                const isChampion = index === 0;
                const isMe = currentUserEntry?.rank === entry.rank;

                return (
                  <article
                    key={`${entry.rank}-${entry.userId ?? entry.name}`}
                    className={cn(
                      "flex min-w-0 flex-col items-center",
                      !isCompact && isChampion && "min-[520px]:-translate-y-2"
                    )}
                  >
                    <div
                      className={cn(
                        "relative w-full overflow-hidden rounded-lg border text-center",
                        style.card,
                        isCompact ? "px-1.5 py-2" : "px-3 py-3",
                        !isCompact && isChampion && "min-[520px]:px-3.5 min-[520px]:py-4",
                        isMe && "border-amber-200/55"
                      )}
                    >
                      <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                      <div className="flex items-center justify-center">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center rounded-full border font-black shadow-[0_8px_18px_rgba(0,0,0,0.22)]",
                            style.badge,
                            isCompact ? "h-7 w-7" : isChampion ? "h-10 w-10" : "h-9 w-9"
                          )}
                          aria-label={style.label}
                        >
                          <Icon className={cn(isCompact ? "h-3.5 w-3.5" : "h-4 w-4")} />
                        </span>
                      </div>

                      <p
                        className={cn(
                          "mt-2 font-data-tabular font-black",
                          style.rank,
                          isCompact ? "text-[10px]" : "text-xs"
                        )}
                      >
                        #{entry.rank}
                      </p>
                      <h4
                        className={cn(
                          "mt-1 truncate font-bold leading-tight text-white",
                          isCompact ? "text-[10px]" : "text-sm"
                        )}
                        title={entry.name}
                      >
                        {entry.name}
                      </h4>
                      <p
                        className={cn(
                          "mt-1 truncate uppercase tracking-[0.12em] text-slate-400",
                          isCompact ? "text-[8px]" : "text-[10px]"
                        )}
                        title={entry.country}
                      >
                        {entry.country}
                      </p>
                      <p
                        className={cn(
                          "mt-2 truncate font-data-tabular font-black leading-none",
                          roiTone(entry.roi),
                          isCompact ? "text-[11px]" : isChampion ? "text-base" : "text-sm"
                        )}
                      >
                        {formatRoi(entry.roi)}
                      </p>
                      {isMe && (
                        <span className="mt-2 inline-flex rounded-full border border-amber-200/30 bg-amber-300/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-amber-100">
                          You
                        </span>
                      )}
                    </div>
                    <div
                      className={cn(
                        "w-[86%] rounded-b-md border-x border-b shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
                        style.platform,
                        isCompact && "hidden sm:block"
                      )}
                    />
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section
          aria-label="Leaderboard rankings"
          className={cn(
            "overflow-hidden rounded-lg border border-white/10 bg-[#050d1a]/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl",
            showPodium && (isCompact ? "mt-3" : "mt-4")
          )}
        >
          <div
            className={cn(
              "grid items-center gap-2 border-b border-white/10 bg-white/[0.035] font-black uppercase tracking-[0.14em] text-slate-500",
              isCompact
                ? "grid-cols-[38px_minmax(0,1fr)_52px_58px] px-2 py-2 text-[8px] sm:grid-cols-[44px_minmax(0,1fr)_62px_64px] sm:px-3"
                : "grid-cols-[54px_minmax(0,1fr)_76px_76px] px-3 py-2.5 text-[9px]"
            )}
          >
            <span>Rank</span>
            <span>Name</span>
            <span className="text-right">Country</span>
            <span className="text-right">ROI</span>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {tableEntries.map((entry) => (
              <LeaderboardRow
                key={`${entry.rank}-${entry.userId ?? entry.name}`}
                entry={entry}
                isMe={currentUserEntry?.rank === entry.rank}
                compact={isCompact}
              />
            ))}
          </div>

          {onOpenFull && (
            <button
              type="button"
              onClick={onOpenFull}
              className="w-full border-t border-white/10 bg-white/[0.025] py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-100/80 transition-colors hover:bg-amber-300/[0.055] hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/45"
            >
              Open Full Leaderboard
            </button>
          )}
        </section>
      </div>
    </div>
  );
}

function LeaderboardRow({
  entry,
  isMe,
  compact,
}: {
  entry: LeaderboardEntry;
  isMe: boolean;
  compact: boolean;
}) {
  const medalTone =
    entry.rank === 1
      ? "border-amber-200/35 bg-amber-300/12 text-amber-100"
      : entry.rank === 2
        ? "border-slate-200/25 bg-slate-300/10 text-slate-100"
        : entry.rank === 3
          ? "border-orange-300/25 bg-orange-300/10 text-orange-100"
          : "border-white/10 bg-white/[0.03] text-slate-300";

  return (
    <div
      className={cn(
        "grid items-center gap-2 transition-colors",
        compact
          ? "grid-cols-[38px_minmax(0,1fr)_52px_58px] px-2 py-2.5 sm:grid-cols-[44px_minmax(0,1fr)_62px_64px] sm:px-3"
          : "grid-cols-[54px_minmax(0,1fr)_76px_76px] px-3 py-3",
        isMe
          ? "bg-amber-300/[0.075] shadow-[inset_2px_0_0_rgba(251,191,36,0.55)]"
          : "hover:bg-white/[0.035]"
      )}
    >
      <span
        className={cn(
          "inline-flex w-fit min-w-7 justify-center rounded-md border px-1.5 py-1 font-data-tabular font-black",
          compact ? "text-[10px]" : "text-[11px]",
          medalTone
        )}
      >
        {entry.rank}
      </span>

      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p
            className={cn(
              "truncate font-bold leading-tight",
              compact ? "text-[11px]" : "text-[13px]",
              isMe ? "text-amber-100" : "text-white"
            )}
            title={entry.name}
          >
            {entry.name}
          </p>
          {isMe && (
            <span className="shrink-0 rounded-full border border-amber-200/25 bg-amber-300/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] text-amber-100">
              You
            </span>
          )}
        </div>
      </div>

      <p
        className={cn(
          "truncate text-right font-semibold text-slate-400",
          compact ? "text-[10px]" : "text-[11px]"
        )}
        title={entry.country}
      >
        {entry.country}
      </p>
      <p
        className={cn(
          "truncate text-right font-data-tabular font-black",
          compact ? "text-[11px]" : "text-[12px]",
          roiTone(entry.roi)
        )}
      >
        {formatRoi(entry.roi)}
      </p>
    </div>
  );
}

function DecorativeMarketField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg opacity-70">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="absolute -right-10 top-8 h-40 w-40 rounded-full border border-amber-200/[0.06]" />
      <div className="absolute bottom-12 right-4 flex items-end gap-1 opacity-[0.08]">
        <span className="h-8 w-1 rounded-full bg-cyan-300" />
        <span className="h-14 w-1 rounded-full bg-amber-200" />
        <span className="h-10 w-1 rounded-full bg-cyan-300" />
        <span className="h-16 w-1 rounded-full bg-amber-200" />
        <span className="h-11 w-1 rounded-full bg-cyan-300" />
      </div>
      <div className="absolute -left-8 bottom-4 h-24 w-28 rotate-[-18deg] rounded-t-full border-l border-t border-white/[0.055]" />
      <div className="absolute left-7 bottom-7 h-14 w-px rotate-[22deg] bg-white/[0.06]" />
    </div>
  );
}

function roiTone(roi: number) {
  if (roi > 0) return "text-bull-green";
  if (roi < 0) return "text-bear-red";
  return "text-white/70";
}
