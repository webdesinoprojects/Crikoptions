"use client";

import React, { useMemo } from "react";
import { useDashboardOverview, useIntelligenceFeed } from "@/features/dashboard/hooks";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { EChartsWrapper } from "@/components/shared/EChartsWrapper";
import { BrainCircuit, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardRightRail() {
  const { data: signals, isLoading } = useIntelligenceFeed();
  const { data: overview } = useDashboardOverview();
  const marginBase = (overview?.marginUsed ?? 0) + (overview?.marginAvailable ?? 0);
  const marginUtil = marginBase > 0 ? ((overview?.marginUsed ?? 0) / marginBase) * 100 : 0;
  const stressLevel = marginUtil > 70 ? "HIGH" : marginUtil > 0 ? "ACTIVE" : "0";

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
                [0.3, "#22c55e"],
                [0.7, "#ffd700"],
                [1.0, "#ef4444"],
              ] as [number, string][],
            },
          },
          pointer: {
            length: "60%",
            width: 4,
            offsetCenter: [0, 5],
            itemStyle: { color: "#f8fafc" },
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
          data: [{ value: Math.round(marginUtil), name: "Margin" }],
        },
      ],
    };
  }, [marginUtil]);

  return (
    <aside className="w-[300px] shrink-0 flex flex-col gap-4 border-l border-outline/10 pl-4 h-full select-none">
      <TerminalPanel title="Risk Monitor" subtitle="Backend margin and stress index" className="h-[150px]">
        <div className="flex-1 flex gap-2 items-center">
          <div className="w-24 h-24 relative mt-2 shrink-0">
            <EChartsWrapper option={riskGaugeOption} />
          </div>
          <div className="flex-1 space-y-1.5 text-[10px]">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Stress Level:</span>
              <span className="font-bold text-bull-green font-data-tabular">{stressLevel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Margin Util:</span>
              <span className="font-bold text-white font-data-tabular">{marginUtil.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">Active Signals:</span>
              <span className="font-bold text-white font-data-tabular">{signals?.length ?? 0}</span>
            </div>
          </div>
        </div>
      </TerminalPanel>

      <TerminalPanel title="System Alerts" subtitle="Backend connection state">
        <div className="space-y-2 max-h-[140px] overflow-y-auto text-[10px]">
          <div className="p-2 border border-outline/5 rounded bg-surface-dim flex gap-2">
            <ShieldCheck className="w-4 h-4 text-bull-green shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white leading-tight">API Connection</p>
              <p className="text-on-surface-variant text-[9px]">Backend API data available: {overview ? "1" : "0"}</p>
            </div>
          </div>
        </div>
      </TerminalPanel>

      <TerminalPanel title="Alpha Intelligence" subtitle="Backend signal stream" className="flex-1">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full bg-white/5" />
            <Skeleton className="h-12 w-full bg-white/5" />
          </div>
        ) : (
          <div className="space-y-2.5 overflow-y-auto flex-1 min-h-0 text-[10px]">
            {signals && signals.length > 0 ? (
              signals.map((signal) => (
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
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-on-surface-variant">
                No backend signals
              </div>
            )}
          </div>
        )}
      </TerminalPanel>
    </aside>
  );
}
