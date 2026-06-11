"use client";

import React, { useMemo } from "react";
import { useIntelligenceFeed } from "@/features/dashboard/hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";
import { BrainCircuit, AlertTriangle, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardRightRail() {
  const { data: signals, isLoading } = useIntelligenceFeed();

  const riskGaugeOption = useMemo(() => {
    return {
      series: [
        {
          type: "gauge" as const,
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          radius: "100%",
          center: ["50%", "85%"],
          axisLine: {
            lineStyle: {
              width: 6,
              color: [
                [0.3, "#22c55e"], // Low risk
                [0.7, "#ffd700"], // Moderate
                [1.0, "#ef4444"], // High
              ] as [number, string][],
            },
          },
          pointer: {
            icon: "path://M12.8,0.7l12,20.1c0.6,1,0.3,2.4-0.7,3c-0.3,0.2-0.7,0.3-1,0.3h-24c-1.2,0-2.2-1-2.2-2.2c0-0.4,0.1-0.7,0.3-1l12-20.1C10.6-0.2,12-0.2,12.8,0.7z",
            length: "60%",
            width: 4,
            offsetCenter: [0, 5],
            itemStyle: {
              color: "#f8fafc",
            },
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            offsetCenter: [0, -10],
            formatter: "{value}%",
            valueAnimation: true,
            textStyle: {
              fontSize: 12,
              fontFamily: "JetBrains Mono, monospace",
              color: "#f8fafc",
              fontWeight: "bold",
            },
          },
          data: [{ value: 42, name: "Leverage" }],
        },
      ],
    };
  }, []);

  return (
    <aside className="w-[300px] shrink-0 flex flex-col gap-4 border-l border-outline/10 pl-4 h-full select-none">
      {/* Section 1: Risk Monitor */}
      <TerminalPanel title="Risk Monitor" subtitle="Real-time margin & stress level index" className="h-[150px]">
        <div className="flex-1 flex gap-2 items-center">
          <div className="w-24 h-24 relative mt-2 shrink-0">
            <EChartsWrapper option={riskGaugeOption} />
          </div>
          <div className="flex-1 space-y-1.5 text-[10px]">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Stress Level:</span>
              <span className="font-bold text-bull-green font-data-tabular">STABLE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Margin Util:</span>
              <span className="font-bold text-white font-data-tabular">42.8%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Active Vaults:</span>
              <span className="font-bold text-white font-data-tabular">3 / 3</span>
            </div>
          </div>
        </div>
      </TerminalPanel>

      {/* Section 2: Alert Center */}
      <TerminalPanel title="System Alerts" subtitle="Exchange and market anomalies">
        <div className="space-y-2 max-h-[140px] overflow-y-auto text-[10px]">
          <div className="p-2 border border-outline/5 rounded bg-surface-dim flex gap-2">
            <ShieldCheck className="w-4 h-4 text-bull-green shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white leading-tight">API Connection Secured</p>
              <p className="text-on-surface-variant text-[9px]">Server status normal. Latency 14ms.</p>
            </div>
          </div>
          <div className="p-2 border border-outline/5 rounded bg-surface-dim flex gap-2">
            <AlertTriangle className="w-4 h-4 text-premium-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white leading-tight">Extreme Volatility</p>
              <p className="text-on-surface-variant text-[9px]">MSDHONI spreads widening. Margin updated.</p>
            </div>
          </div>
        </div>
      </TerminalPanel>

      {/* Section 3: Intelligence Feed */}
      <TerminalPanel title="Alpha Intelligence" subtitle="Live quantitative signal stream" className="flex-1">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full bg-white/5" />
            <Skeleton className="h-12 w-full bg-white/5" />
          </div>
        ) : (
          <div className="space-y-2.5 overflow-y-auto flex-1 min-h-0 text-[10px]">
            {signals?.map((signal) => (
              <div key={signal.id} className="p-2 border border-outline/5 rounded bg-surface-dim flex flex-col gap-1">
                <div className="flex gap-1.5 items-start">
                  <BrainCircuit className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white leading-tight truncate">{signal.title}</p>
                    <p className="text-[8px] text-on-surface-variant font-data-tabular">
                      {new Date(signal.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <p className="text-on-surface-variant text-[9.5px] leading-tight">{signal.message}</p>
                {signal.recommendation && (
                  <div className="mt-1 flex justify-between items-center">
                    <span
                      className={`px-1 rounded text-[8px] font-bold ${
                        signal.recommendation === "BUY" ? "bg-bull-green/20 text-bull-green" : "bg-bear-red/20 text-bear-red"
                      }`}
                    >
                      {signal.recommendation}
                    </span>
                    <span className="text-[8px] text-on-surface-variant">EST CONF: 74%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </TerminalPanel>
    </aside>
  );
}
