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
    <div className="min-h-full flex-1 overflow-x-hidden lg:h-full lg:overflow-hidden">
      <div className="space-y-3 p-2.5 sm:p-4 lg:h-full lg:overflow-y-auto">
        {isLoading || !overview ? (
          <div className="h-12 w-full animate-pulse rounded-xl bg-white/5 sm:h-20" />
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
          <div className="h-full lg:col-span-7">
            <WhatMovedTheMarket />
          </div>
          <div className="h-full lg:col-span-3">
            <YourWatchlistWidget />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
          <MatchdayChallenges />
          <FriendsLeague />
          <LastMatchRecap />
        </div>
      </div>
    </div>
  );
}
