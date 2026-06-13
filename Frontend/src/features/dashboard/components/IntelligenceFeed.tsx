"use client";

import { useIntelligenceFeed } from "@/features/dashboard/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, AlertTriangle, Activity } from "lucide-react";
import { DataSourceBadge } from "@/components/shared/DataSourceBadge";

export function IntelligenceFeed() {
  const { data: signals, isLoading } = useIntelligenceFeed();

  if (isLoading || !signals) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "AI_SIGNAL": return <BrainCircuit className="w-4 h-4 text-primary" />;
      case "ALERT": return <AlertTriangle className="w-4 h-4 text-bear-red" />;
      case "CATALYST": return <Activity className="w-4 h-4 text-bull-green" />;
      default: return null;
    }
  };

  return (
    <Card className="bg-surface-container-lowest border-outline-variant flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center justify-between gap-2">
          Intelligence Feed
          <DataSourceBadge source="derived" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {signals.map((signal) => (
          <div key={signal.id} className="p-3 border border-outline-variant rounded-lg bg-surface-container/50">
            <div className="flex gap-2 mb-2">
              <div className="mt-0.5">{getIcon(signal.type)}</div>
              <div>
                <div className="font-bold text-xs">{signal.title}</div>
                <div className="text-[9px] text-on-surface-variant">
                  {new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-on-surface-variant mb-2">{signal.message}</p>
            {signal.recommendation && (
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                signal.recommendation === 'BUY' ? 'bg-bull-green text-white' : 
                signal.recommendation === 'SELL' ? 'bg-bear-red text-white' : 'bg-surface-variant'
              }`}>
                {signal.recommendation}
              </span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
