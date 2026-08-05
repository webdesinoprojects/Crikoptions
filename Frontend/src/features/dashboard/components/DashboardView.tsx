"use client";

import React from "react";
import { useDashboardOverview } from "@/features/dashboard/hooks";
import { DashboardHeader } from "./DashboardHeader";
import { LiveMatchArena } from "./LiveMatchArena";
import { YourMatchday } from "./YourMatchday";
import { ComingUp } from "./ComingUp";
import { MatchdayDiscoveryHeader } from "./MatchdayDiscoveryHeader";
import { WhatMovedTheMarket } from "./WhatMovedTheMarket";
import { DashboardLeaderboardWidget } from "./DashboardLeaderboardWidget";
import { MatchdayChallenges } from "./MatchdayChallenges";

export default function DashboardView() {
  const { data: overview, isLoading } = useDashboardOverview();

  return (
    <div className="min-h-full flex-1 overflow-x-hidden lg:h-full lg:overflow-hidden">
      <div className="space-y-3 p-2.5 sm:p-4 lg:h-full lg:overflow-y-auto">
        {isLoading ? (
          <div className="h-10 w-full animate-pulse rounded-xl bg-white/5 sm:h-16" />
        ) : (
          <DashboardHeader overview={overview} />
        )}

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-10 lg:gap-4">
          <div className="h-full lg:col-span-7">
            <LiveMatchArena />
          </div>
          <div className="flex h-full flex-col gap-3 lg:col-span-3 lg:gap-4">
            <div className="flex-1">
              <YourMatchday />
            </div>
            <ComingUp />
          </div>
        </div>

        <MatchdayDiscoveryHeader />

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-10 lg:gap-4">
          <div className="h-full lg:col-span-6">
            <WhatMovedTheMarket />
          </div>
          <div className="h-full lg:col-span-4">
            <DashboardLeaderboardWidget />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-10 lg:gap-4">
          <div className="h-full lg:col-span-10">
            <MatchdayChallenges />
          </div>
        </div>
      </div>
    </div>
  );
}
