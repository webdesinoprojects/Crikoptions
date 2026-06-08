"use client";

import { useOpportunityScanner } from "@/features/dashboard/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

export function OpportunityScanner() {
  const { data: opportunities, isLoading } = useOpportunityScanner();

  if (isLoading || !opportunities) return null;

  return (
    <Card className="bg-surface-container-lowest border-outline-variant flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
          <Zap className="w-4 h-4" /> Opportunity Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {opportunities.map((opp) => (
          <div key={opp.id} className="p-3 border border-outline-variant rounded-lg bg-surface-container/50">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-xs">{opp.title}</span>
              <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded font-bold">
                {opp.confidence}% CONF
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant mb-3">{opp.description}</p>
            <div className="flex items-center justify-between text-[11px] font-data-tabular">
              <span className="text-on-surface-variant">LTP: ₹{opp.currentPrice.toFixed(2)}</span>
              <span className="font-bold text-bull-green">Target: ₹{opp.targetPrice.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
