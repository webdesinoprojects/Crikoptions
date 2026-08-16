"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { AcademyBadge as AcademyBadgeMeta } from "../data/academy-badges";
import { AcademyBadge } from "./AcademyBadge";

interface BadgeUnlockModalProps {
  badge: AcademyBadgeMeta;
  onDismiss: () => void;
}

export function BadgeUnlockModal({ badge, onDismiss }: BadgeUnlockModalProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm" onClick={onDismiss} />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#07111f] px-6 py-7 text-center shadow-2xl">
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:bg-white/8 hover:text-white/70"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
          Badge earned
        </p>
        <div className="flex justify-center py-5">
          <AcademyBadge badge={badge} unlocked size="lg" />
        </div>
        <h3 className="text-lg font-semibold text-white">{badge.title}</h3>
        <p className="mt-1 text-sm text-white/45">
          {badge.rank} · {badge.subtitle}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 w-full rounded-lg border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
