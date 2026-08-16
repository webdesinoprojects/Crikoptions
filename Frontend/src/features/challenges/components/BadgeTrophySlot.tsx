"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcademyBadge as AcademyBadgeMeta } from "../data/academy-badges";
import { AcademyBadge } from "./AcademyBadge";

interface BadgeTrophySlotProps {
  badge: AcademyBadgeMeta;
  unlocked: boolean;
  done: number;
  total: number;
  unit?: string;
}

export function BadgeTrophySlot({ badge, unlocked, done, total, unit = "tasks" }: BadgeTrophySlotProps) {
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border px-3 py-5 text-center",
        unlocked ? "border-white/10 bg-white/[0.03]" : "border-white/[0.06] bg-transparent",
      )}
    >
      <AcademyBadge badge={badge} unlocked={unlocked} size="md" />
      <h3 className={cn("mt-3 text-[13px] font-semibold leading-tight", unlocked ? "text-white" : "text-white/40")}>
        {badge.title}
      </h3>
      <p className="mt-1 text-[11px] text-white/40">{badge.rank}</p>
      <div className="mt-3 w-full">
        {unlocked ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400/90">
            <Check className="h-3.5 w-3.5" />
            Earned
          </span>
        ) : (
          <>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-white/25"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-white/35 font-data-tabular">
              {done}/{total}{unit ? ` ${unit}` : ""}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
