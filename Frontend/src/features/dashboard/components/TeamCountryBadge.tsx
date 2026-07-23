"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface TeamCountryBadgeProps {
  teamName?: string;
  teamCode?: string;
  logoUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showName?: boolean;
}

// Map common cricket team names & country codes to FlagCDN ISO country codes
const COUNTRY_CODE_MAP: Record<string, string> = {
  // Asia
  pakistan: "pk",
  pak: "pk",
  "pak-w": "pk",
  india: "in",
  ind: "in",
  "ind-w": "in",
  srilanka: "lk",
  "sri lanka": "lk",
  sl: "lk",
  sri: "lk",
  "sl-w": "lk",
  bangladesh: "bd",
  ban: "bd",
  afghanistan: "af",
  afg: "af",
  nepal: "np",
  nep: "np",
  uae: "ae",
  oman: "om",

  // Oceania & Pacific
  australia: "au",
  aus: "au",
  "aus-w": "au",
  newzealand: "nz",
  "new zealand": "nz",
  nz: "nz",
  "nz-w": "nz",
  papuanewguinea: "pg",
  png: "pg",

  // Europe
  england: "gb-eng",
  eng: "gb-eng",
  "eng-w": "gb-eng",
  ireland: "ie",
  ire: "ie",
  netherlands: "nl",
  ned: "nl",
  scotland: "gb-sct",
  sco: "gb-sct",

  // Americas
  westindies: "jm", // Jamaica flag as representative
  "west indies": "jm",
  wi: "jm",
  "wi-w": "jm",
  usa: "us",
  "united states": "us",
  canada: "ca",
  can: "ca",

  // Africa
  southafrica: "za",
  "south africa": "za",
  sa: "za",
  rsa: "za",
  "sa-w": "za",
  zimbabwe: "zw",
  zim: "zw",
  namibia: "na",
  nam: "na",
  uganda: "ug",
};

/**
 * Returns a FlagCDN image URL for a given team name or short code.
 */
export function getCountryFlagUrl(teamName?: string, teamCode?: string): string | null {
  const normalize = (str?: string) =>
    (str || "")
      .toLowerCase()
      .replace(/women|women's|\b w\b|team/g, "")
      .replace(/[^a-z]/g, "")
      .trim();

  const nameKey = normalize(teamName);
  const codeKey = normalize(teamCode);

  const iso = COUNTRY_CODE_MAP[nameKey] || COUNTRY_CODE_MAP[codeKey];
  if (iso) {
    return `https://flagcdn.com/w80/${iso}.png`;
  }
  return null;
}

export function TeamCountryBadge({
  teamName,
  teamCode,
  logoUrl,
  size = "md",
  className,
  showName = false,
}: TeamCountryBadgeProps) {
  const [imageError, setImageError] = useState(false);
  const flagUrl = getCountryFlagUrl(teamName, teamCode);

  // Determine which image source to use: logoUrl first (if not failed), then flagUrl fallback
  const imgSrc = !imageError && logoUrl ? logoUrl : flagUrl;

  const displayCode = (teamCode || teamName || "TBA")
    .replace(/women|women's|\b w\b/gi, "")
    .slice(0, 3)
    .toUpperCase();

  const sizeClasses = {
    sm: "h-8 w-8 text-xs sm:h-9 sm:w-9",
    md: "h-11 w-11 text-sm sm:h-12 sm:w-12",
    lg: "h-14 w-14 text-base sm:h-16 sm:w-16",
  };

  const containerSizes = sizeClasses[size];

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={cn(
          "group relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-gradient-to-b from-white/10 to-black/40 p-1 shadow-[0_4px_16px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 hover:border-cyan-300/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]",
          containerSizes,
          className
        )}
      >
        {/* Subtle metallic shine overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-amber-300/10 opacity-70" />

        {imgSrc && !imageError ? (
          <img
            src={imgSrc}
            alt={teamName || displayCode}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="font-display font-black tracking-wider text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {displayCode}
          </span>
        )}
      </div>

      {showName && teamName && (
        <div className="min-w-0">
          <div className="truncate font-display text-sm font-black tracking-wide text-white sm:text-base">
            {teamName}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/80">
            {displayCode}
          </div>
        </div>
      )}
    </div>
  );
}
