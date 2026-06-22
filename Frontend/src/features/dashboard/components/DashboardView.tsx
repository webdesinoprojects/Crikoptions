"use client";

import React from "react";
import { useDashboardOverview } from "@/features/dashboard/hooks";
import { DashboardHeader } from "./DashboardHeader";
import { LiveMatchArena } from "./LiveMatchArena";
import { YourMatchday } from "./YourMatchday";
import { ComingUp } from "./ComingUp";
import { MatchdayDiscoveryHeader } from "./MatchdayDiscoveryHeader";
import { WhatMovedTheMarket } from "./WhatMovedTheMarket";
import { YourWatchlistWidget } from "./YourWatchlistWidget";
import { MatchdayChallenges } from "./MatchdayChallenges";
import { FriendsLeague } from "./FriendsLeague";
import { LastMatchRecap } from "./LastMatchRecap";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardView() {
  const { data: overview, isLoading } = useDashboardOverview();
  const marginBase = (overview?.marginUsed ?? 0) + (overview?.marginAvailable ?? 0);
  const marginUsagePct = marginBase > 0 ? ((overview?.marginUsed ?? 0) / marginBase) * 100 : 0;
  const riskRating = marginUsagePct > 70 ? "HIGH" : marginUsagePct > 0 ? "ACTIVE" : "0";

  return (
    <div className="flex-1 overflow-hidden h-full">
      <div className="h-full overflow-y-auto p-4 space-y-4">
        {isLoading || !overview ? (
          <div className="h-20 w-full rounded-xl bg-white/5 animate-pulse" />
        ) : (
          <DashboardHeader overview={overview} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          <div className="lg:col-span-7 h-full">
            <LiveMatchArena />
          </div>
          <div className="lg:col-span-3 flex flex-col gap-4 h-full">
            <div className="flex-1">
              <YourMatchday />
            </div>
            <ComingUp />
          </div>
        </div>

        <MatchdayDiscoveryHeader />

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          <div className="lg:col-span-7 h-full">
            <WhatMovedTheMarket />
          </div>
          <div className="lg:col-span-3 h-full">
            <YourWatchlistWidget />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MatchdayChallenges />
          <FriendsLeague />
          <LastMatchRecap />
        </div>
      </div>
    </div>
  );
}
