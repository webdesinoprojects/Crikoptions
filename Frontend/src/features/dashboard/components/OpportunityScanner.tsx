"use client";

import { useOpportunityScanner } from "@/features/dashboard/hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function OpportunityScanner() {
  const { data: opportunities, isLoading } = useOpportunityScanner();

  if (isLoading) {
    return (
      <TerminalPanel title="Opportunity Radar" className="h-[280px]" subtitle="Real-time breakout alerts">
        <div className="space-y-2 flex-1 flex flex-col justify-center">
          <Skeleton className="h-4 w-full bg-white/5" />
          <Skeleton className="h-4 w-[90%] bg-white/5" />
        </div>
      </TerminalPanel>
    );
  }

  return (
    <TerminalPanel
      title="Opportunity Radar"
      subtitle="Real-time player pricing & Win-DNA setups"
      className="h-[280px]"
    >
      <div className="flex-1 overflow-y-auto space-y-2.5 min-h-0 select-none">
        {opportunities?.map((opp) => (
          <div key={opp.id} className="p-2 border border-outline/10 rounded bg-surface-dim hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-start mb-1 gap-4">
              <span className="font-bold text-[11px] text-white truncate">{opp.title}</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-primary/20 text-primary rounded font-bold shrink-0">
                {opp.confidence}% CONF
              </span>
            </div>
            <p className="text-[10px] text-on-surface-variant leading-tight mb-2">{opp.description}</p>
            <div className="flex items-center justify-between text-[10px] font-data-tabular">
              <span className="text-on-surface-variant">LTP: <span className="text-white">₹{opp.currentPrice.toFixed(2)}</span></span>
              <span className="font-bold text-bull-green">Tgt: ₹{opp.targetPrice.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </TerminalPanel>
  );
}

