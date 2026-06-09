"use client";

import Link from "next/link";
import { useIntelligence } from "../hooks";
import { DNAConfidenceBar } from "./DNAConfidenceBar";

interface MatchContextHeaderProps {
  matchId: string;
}

export function MatchContextHeader({ matchId }: MatchContextHeaderProps) {
  const { data: intel, isLoading } = useIntelligence(matchId);

  // Map matchId to marketId if needed (e.g., RCB vs KKR maps to market-4, CSK vs MI to market-1)
  const marketId = matchId === "2" || matchId === "rcb-vs-kkr" ? "market-4" : "market-1";

  return (
    <div className="bg-background border border-white/10 px-4 py-2 flex items-center justify-between gap-4 select-none rounded-none font-mono">
      {/* Match title */}
      <div className="flex items-center gap-3 min-w-0">
        {isLoading ? (
          <div className="h-6 w-36 bg-white/5 animate-pulse rounded-none" />
        ) : (
          <div>
            <h1 className="text-xs font-bold text-white uppercase tracking-tight">
              {intel?.teamA} <span className="text-on-surface-variant font-normal">v</span> {intel?.teamB}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-[#FF2A2A] animate-pulse rounded-none" />
              <span className="text-[9px] text-on-surface-variant uppercase tracking-wider font-mono">
                SYS: LIVE · OVERS {intel?.currentOvers.toFixed(1)} · SCORE {intel?.currentScore}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* DNA Confidence Bar */}
      <div className="flex-1 flex justify-center">
        {intel && (
          <DNAConfidenceBar
            confidence={intel.dnaConfidence}
            status={intel.dnaStatus}
            latencyMs={intel.processingLatencyMs}
          />
        )}
      </div>

      {/* Context Navigation */}
      <div className="flex items-center gap-2 shrink-0 font-mono text-[9px]">
        <Link
          href={`/trading/${marketId}`}
          className="flex items-center gap-1 px-2 py-1 border border-white/10 text-on-surface-variant hover:text-white hover:bg-white/5 transition-all rounded-none font-bold"
        >
          [ TRADING ]
        </Link>
        <div className="flex items-center gap-1 px-2 py-1 border border-primary/45 bg-primary/10 text-primary rounded-none font-bold">
          [🧬 INTEL ]
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
