"use client";

import { useId } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcademyBadge as AcademyBadgeMeta } from "../data/academy-badges";

interface AcademyBadgeProps {
  badge: AcademyBadgeMeta;
  unlocked: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizes = {
  xs: { box: "h-7 w-7", icon: 11 },
  sm: { box: "h-10 w-10", icon: 14 },
  md: { box: "h-16 w-16", icon: 22 },
  lg: { box: "h-24 w-24", icon: 32 },
};

export function AcademyBadge({
  badge,
  unlocked,
  size = "md",
  showLabel = false,
  className,
}: AcademyBadgeProps) {
  const Icon = badge.icon;
  const dim = sizes[size];
  const uid = useId().replace(/:/g, "");

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn("relative shrink-0 overflow-visible", dim.box)}
        title={unlocked ? `${badge.title} · ${badge.rank}` : `${badge.title} · locked`}
      >
        <svg viewBox="0 0 96 96" className="h-full w-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id={`${uid}-ring`} x1="0.15" y1="0" x2="0.85" y2="1">
              <stop offset="0%" stopColor={unlocked ? "#f4ead0" : "#6b7280"} />
              <stop offset="48%" stopColor={unlocked ? badge.metal : "#4b5563"} />
              <stop offset="100%" stopColor={unlocked ? "#8a7340" : "#1f2937"} />
            </linearGradient>
            <radialGradient id={`${uid}-face`} cx="38%" cy="30%" r="70%">
              <stop offset="0%" stopColor={unlocked ? badge.color : "#374151"} stopOpacity={unlocked ? 0.95 : 0.35} />
              <stop offset="100%" stopColor="#070d16" />
            </radialGradient>
          </defs>
          <circle cx="48" cy="48" r="45" fill={`url(#${uid}-ring)`} />
          <circle cx="48" cy="48" r="38.5" fill="#070d16" />
          <circle cx="48" cy="48" r="36" fill={`url(#${uid}-face)`} />
          <circle
            cx="48"
            cy="48"
            r="36"
            fill="none"
            stroke={unlocked ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)"}
            strokeWidth="1"
          />
          {unlocked && (
            <path
              d="M26 34 A26 26 0 0 1 58 24"
              fill="none"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.18"
            />
          )}
        </svg>
        {unlocked ? (
          <Icon
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: dim.icon, height: dim.icon, color: "#f7f1e3" }}
          />
        ) : (
          <>
            <Icon
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25"
              style={{ width: dim.icon, height: dim.icon, color: badge.color }}
            />
            <span
              className="absolute flex items-center justify-center rounded-full bg-[#070d16] ring-1 ring-white/20"
              style={{
                width: Math.max(12, dim.icon * 0.85),
                height: Math.max(12, dim.icon * 0.85),
                right: size === "xs" ? -1 : 0,
                bottom: size === "xs" ? -1 : 0,
              }}
            >
              <Lock
                className="text-white/55"
                style={{ width: dim.icon * 0.45, height: dim.icon * 0.45 }}
              />
            </span>
          </>
        )}
      </div>
      {showLabel && (
        <div className="flex flex-col items-center text-center">
          <span className={cn("text-[11px] font-semibold", unlocked ? "text-white/90" : "text-white/35")}>
            {badge.title}
          </span>
          <span className="text-[10px] text-white/40">{badge.rank}</span>
        </div>
      )}
    </div>
  );
}
