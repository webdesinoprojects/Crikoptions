import React, { useRef } from "react";
import { Activity } from "lucide-react";
import NumberFlow from "@number-flow/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useDailyPnL } from "../hooks";

export function TodayPnLDisplay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevPnLRef = useRef<number>(0);

  const { data: dailyPnL } = useDailyPnL();
  const value = dailyPnL?.dailyPnL ?? 0;
  const isPositive = value >= 0;

  useGSAP(() => {
    if (value > prevPnLRef.current) {
      gsap.fromTo(
        containerRef.current,
        { boxShadow: "0 0 35px rgba(20, 184, 166, 1)", borderColor: "rgba(20, 184, 166, 0.8)" },
        {
          boxShadow: isPositive ? "0 0 15px rgba(20, 184, 166, 0.3)" : "none",
          borderColor: "rgba(255, 255, 255, 0.1)",
          duration: 1,
          ease: "power2.out",
        }
      );
    }
    prevPnLRef.current = value;
  }, { scope: containerRef, dependencies: [value, isPositive] });

  return (
    <div
      ref={containerRef}
      className={`flex h-14 min-w-[220px] shrink-0 flex-col justify-center overflow-hidden rounded-lg border border-white/10 bg-gradient-to-r from-[#071327] to-[#040a17] px-4 py-1.5 transition-all duration-500 ${isPositive ? "shadow-[0_0_10px_rgba(16,185,129,0.2)]" : ""}`}
    >
      <div className="flex w-full items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-black uppercase tracking-wider text-on-surface-variant">
          <Activity className={`h-3.5 w-3.5 ${isPositive ? "text-cyan-400" : "text-on-surface-variant"}`} />
          Today&apos;s P&L
        </span>
        <span className={`flex items-center whitespace-nowrap text-[17px] font-black tracking-tight ${isPositive ? "text-bull-green drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]" : "text-bear-red drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]"}`}>
          {value >= 0 ? "+" : ""}₵&nbsp;
          <NumberFlow
            value={value}
            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            className="inline-block"
          />
        </span>
      </div>
    </div>
  );
}
