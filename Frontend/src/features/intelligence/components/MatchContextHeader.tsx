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
    <div className="bg-surface border border-outline/10 px-4 py-2.5 rounded flex items-center justify-between gap-4 select-none">
      {/* Match title */}
      <div className="flex items-center gap-3 min-w-0">
        {isLoading ? (
          <div className="h-6 w-36 rounded bg-white/5 animate-pulse" />
        ) : (
          <div>
            <h1 className="text-xs font-bold text-white leading-tight">
              {intel?.teamA} <span className="text-on-surface-variant font-normal">vs</span> {intel?.teamB}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-bear-red animate-pulse" />
              <span className="text-[9px] text-on-surface-variant font-data-tabular uppercase tracking-wider">
                LIVE · Over {intel?.currentOvers.toFixed(1)} · {intel?.currentScore}
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
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href={`/trading/${marketId}`}
          className="flex items-center gap-1 px-2.5 py-1 rounded border border-outline/10 text-[10px] font-bold text-on-surface-variant hover:text-white hover:bg-surface-bright transition-all"
        >
          <span>⚡</span> TRADING
        </Link>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded border border-primary/20 bg-primary/10 text-primary text-[10px] font-bold">
          <span>🧬</span> INTELLIGENCE
        </div>
        <Link
          href="/portfolio"
          className="flex items-center gap-1 px-2.5 py-1 rounded border border-outline/10 text-[10px] font-bold text-on-surface-variant hover:text-white hover:bg-surface-bright transition-all"
        >
          <span>📊</span> PORTFOLIO
        </Link>
      </div>
    </div>
  );
}
