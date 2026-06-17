"use client";

import Link from "next/link";
import { useIntelligence } from "../hooks";
import { DNAConfidenceBar } from "./DNAConfidenceBar";
import { useMarkets } from "@/features/trading/hooks";

interface MatchContextHeaderProps {
  matchId: string;
}

export function MatchContextHeader({ matchId }: MatchContextHeaderProps) {
  const { data: intel, isLoading } = useIntelligence(matchId);
  const { data: markets } = useMarkets(matchId);
  const marketHref = markets?.[0]?.id ? `/trading/${markets[0].id}` : "/dashboard";

  return (
    <div className="bg-background border border-white/10 px-4 py-2 flex items-center justify-between gap-4 select-none rounded-none font-mono">
      <div className="flex items-center gap-3 min-w-0">
        {isLoading ? (
          <div className="h-6 w-36 bg-white/5 animate-pulse rounded-none" />
        ) : (
          <div>
            <h1 className="text-xs font-bold text-white uppercase tracking-tight">
              {intel?.teamA ?? "0"} <span className="text-on-surface-variant font-normal">v</span> {intel?.teamB ?? "0"}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-[#FF2A2A] animate-pulse rounded-none" />
              <span className="text-[9px] text-on-surface-variant uppercase tracking-wider font-mono">
                SYS: {intel?.dnaStatus ?? "STALE"} - OVERS {intel?.currentOvers.toFixed(1) ?? "0.0"} - SCORE {intel?.currentScore ?? "0/0"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex justify-center">
        {intel && (
          <DNAConfidenceBar
            confidence={intel.dnaConfidence}
            status={intel.dnaStatus}
            latencyMs={intel.processingLatencyMs}
          />
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 font-mono text-[9px]">
        <Link
          href={marketHref}
          className="flex items-center gap-1 px-2 py-1 border border-white/10 text-on-surface-variant hover:text-white hover:bg-white/5 transition-all rounded-none font-bold"
        >
          [ TRADING ]
        </Link>
        <div className="flex items-center gap-1 px-2 py-1 border border-primary/45 bg-primary/10 text-primary rounded-none font-bold">
          [ INTEL ]
        </div>
        <Link
          href="/portfolio"
          className="flex items-center gap-1 px-2 py-1 border border-white/10 text-on-surface-variant hover:text-white hover:bg-white/5 transition-all rounded-none font-bold"
        >
          [ PORTFOLIO ]
        </Link>
      </div>
    </div>
  );
}
