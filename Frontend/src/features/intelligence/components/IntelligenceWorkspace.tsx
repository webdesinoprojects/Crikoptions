"use client";

import React from "react";
import { MatchContextHeader } from "./MatchContextHeader";
import { MatchDNAEngine } from "./MatchDNAEngine";
import { OutcomeDistribution } from "./OutcomeDistribution";
import { PredictiveSignals } from "./PredictiveSignals";
import { AIScenarioLab } from "./AIScenarioLab";
import { PatternArchive } from "./PatternArchive";
import { EventImpactEngine } from "./EventImpactEngine";
import { MomentumHub } from "./MomentumHub";
import { IntelligenceFeed } from "./IntelligenceFeed";

interface IntelligenceWorkspaceProps {
  matchId: string;
}

export function IntelligenceWorkspace({ matchId }: IntelligenceWorkspaceProps) {
  return (
    <div className="flex-grow flex overflow-hidden h-full">
      {/* Center workspace (Fluid width) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ① Match Context Header */}
        <MatchContextHeader matchId={matchId} />

        {/* ② DNA Engine + Outcome Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <MatchDNAEngine matchId={matchId} />
          </div>
          <div className="lg:col-span-4">
            <OutcomeDistribution matchId={matchId} />
          </div>
        </div>

        {/* ③ Momentum Hub + Event Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4">
            <MomentumHub matchId={matchId} />
          </div>
          <div className="lg:col-span-8">
            <EventImpactEngine matchId={matchId} />
          </div>
        </div>

        {/* ④ Predictive Signals + Scenario Lab */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <PredictiveSignals matchId={matchId} />
          </div>
          <div className="lg:col-span-5">
            <AIScenarioLab matchId={matchId} />
          </div>
        </div>

        {/* ⑤ Pattern Archive — full width */}
        <PatternArchive matchId={matchId} />
      </div>

      {/* Right Intelligence Feed rail (fixed 300px) */}
      <aside className="w-[300px] shrink-0 flex flex-col border-l border-white/10 pl-4 h-full select-none">
        <IntelligenceFeed matchId={matchId} />
      </aside>
    </div>
  );
}
