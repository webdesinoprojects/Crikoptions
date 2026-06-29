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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataSourceBadge } from "@/components/shared/DataSourceBadge";

interface IntelligenceWorkspaceProps {
  matchId: string;
}

export function IntelligenceWorkspace({ matchId }: IntelligenceWorkspaceProps) {
  return (
    <div className="flex-grow flex flex-col lg:flex-row overflow-hidden h-full bg-[#000d1a]">
      {/* Center workspace (Fluid width) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Persistent Match Context Header */}
        <div className="shrink-0 p-4 pb-0">
          <MatchContextHeader matchId={matchId} />
          <div className="mt-2 flex justify-end">
            <DataSourceBadge source="derived" />
          </div>
        </div>

        {/* Tabbed Navigation Shell */}
        <Tabs defaultValue="live" className="flex-1 flex flex-col mt-4 overflow-hidden">
          <div className="px-4 shrink-0 overflow-hidden">
            <TabsList className="bg-surface border border-outline/20 rounded-none h-auto lg:h-10 p-1 mb-4 flex overflow-x-auto w-full lg:w-fit gap-1 snap-x scrollbar-hide">
              <TabsTrigger 
                value="live" 
                className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-on-primary text-[10px] lg:text-xs uppercase tracking-widest font-bold px-4 lg:px-6 whitespace-nowrap snap-start h-8 lg:h-auto"
              >
                [01] Live Core & Momentum
              </TabsTrigger>
              <TabsTrigger 
                value="predictive" 
                className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-on-primary text-[10px] lg:text-xs uppercase tracking-widest font-bold px-4 lg:px-6 whitespace-nowrap snap-start h-8 lg:h-auto"
              >
                [02] Predictive Labs
              </TabsTrigger>
              <TabsTrigger 
                value="archives" 
                className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-on-primary text-[10px] lg:text-xs uppercase tracking-widest font-bold px-4 lg:px-6 whitespace-nowrap snap-start h-8 lg:h-auto"
              >
                [03] Historical Archives
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
            
            {/* WORKSPACE 1: LIVE CORE & MOMENTUM */}
            <TabsContent value="live" className="m-0 space-y-4 focus-visible:outline-none focus-visible:ring-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 relative">
                  <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-none pointer-events-none"></div>
                  <MatchDNAEngine matchId={matchId} />
                </div>
                <div className="lg:col-span-4 relative">
                  <div className="absolute inset-0 bg-bull-green/5 blur-3xl rounded-none pointer-events-none"></div>
                  <OutcomeDistribution matchId={matchId} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-12 relative">
                  <div className="absolute inset-0 bg-secondary/5 blur-3xl rounded-none pointer-events-none"></div>
                  <MomentumHub matchId={matchId} />
                </div>
              </div>
            </TabsContent>

            {/* WORKSPACE 2: PREDICTIVE LABS & IMPACT */}
            <TabsContent value="predictive" className="m-0 space-y-4 focus-visible:outline-none focus-visible:ring-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 relative">
                  <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-none pointer-events-none"></div>
                  <PredictiveSignals matchId={matchId} />
                </div>
                <div className="lg:col-span-5 relative">
                  <div className="absolute inset-0 bg-bear-red/5 blur-3xl rounded-none pointer-events-none"></div>
                  <AIScenarioLab matchId={matchId} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-12 relative">
                  <div className="absolute inset-0 bg-secondary/5 blur-3xl rounded-none pointer-events-none"></div>
                  <EventImpactEngine matchId={matchId} />
                </div>
              </div>
            </TabsContent>

            {/* WORKSPACE 3: HISTORICAL ARCHIVES */}
            <TabsContent value="archives" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="relative h-full min-h-[600px]">
                <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-none pointer-events-none"></div>
                <PatternArchive matchId={matchId} />
              </div>
            </TabsContent>

          </div>
        </Tabs>
      </div>

      {/* Right Intelligence Feed rail (stacked on mobile, fixed on desktop) */}
      <aside className="w-full lg:w-[300px] shrink-0 flex flex-col border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-4 h-auto lg:h-full select-none bg-surface/30 backdrop-blur-md pb-8 lg:pb-0">
        <IntelligenceFeed matchId={matchId} />
      </aside>
    </div>
  );
}
