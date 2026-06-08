"use client";

import { FinancialOverviewBar } from "./FinancialOverviewBar";
import { LiveMatchCards } from "./LiveMatchCards";
import { MarketMoversScanner } from "./MarketMoversScanner";
import { OpportunityScanner } from "./OpportunityScanner";
import { PortfolioSnapshot } from "./PortfolioSnapshot";
import { IntelligenceFeed } from "./IntelligenceFeed";

export default function DashboardView() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1440px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="font-headline-lg text-headline-lg font-bold">Dashboard</h2>
          <p className="text-on-surface-variant">Real-time market overview and intelligence.</p>
        </div>

        <FinancialOverviewBar />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          <div className="lg:col-span-8 space-y-6">
            <LiveMatchCards />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MarketMoversScanner />
              <OpportunityScanner />
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            <PortfolioSnapshot />
            <IntelligenceFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
