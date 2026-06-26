import React, { useMemo, useRef } from "react";
import { Zap, Target } from "lucide-react";
import NumberFlow from "@number-flow/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useMarketDetail, useOptionChain, useOpenPositions } from "../hooks";
import { useClosedTrades } from "@/features/portfolio/hooks";
import { buildOptionRows, buildPricePayload } from "../utils/terminal-context";
import { useMatchDetails } from "@/features/dashboard/hooks";

interface MarketPnLDisplayProps {
  marketId: string;
}

export function MarketPnLDisplay({ marketId }: MarketPnLDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevPnLRef = useRef<number>(0);

  const { data: market } = useMarketDetail(marketId);
  const { data: match } = useMatchDetails(market?.matchId ?? "");
  
  const payload = useMemo(() => buildPricePayload(match, market), [match, market]);
  const { data: calculated } = useOptionChain(marketId, payload);
  const rows = useMemo(() => buildOptionRows(calculated, market), [calculated, market]);

  const { data: positions = [] } = useOpenPositions();
  const { data: allClosedTrades = [] } = useClosedTrades();
  
  const marketPositions = useMemo(
    () => positions.filter((position) => position.marketId === marketId && position.strike > 0 && position.lots !== 0),
    [marketId, positions]
  );
  
  const marketClosedTrades = useMemo(
    () => allClosedTrades.filter(t => t.marketId === marketId),
    [allClosedTrades, marketId]
  );

  let openPnL = 0;
  marketPositions.forEach(position => {
    const chainRow = rows.find((row) => row.strike === position.strike);
    const liveLtp = chainRow ? (position.lots > 0 ? chainRow.bid : chainRow.ask) : position.ltp;
    const livePnl = chainRow ? Math.round((liveLtp - position.buyPrice) * position.lots * 100) / 100 : position.pnl;
    openPnL += livePnl;
  });

  const closedPnL = marketClosedTrades.reduce((acc, t) => acc + t.realizedPnL, 0);
  const totalPnL = openPnL + closedPnL;
  const isPositive = totalPnL >= 0;

  // Milestone logic
  const getNextMilestone = (pnl: number) => {
    if (pnl < 0) return 0;
    const milestoneStep = 1000;
    return Math.floor(pnl / milestoneStep) * milestoneStep + milestoneStep;
  };
  const getPrevMilestone = (pnl: number) => {
    if (pnl < 0) return Math.floor(pnl / 1000) * 1000;
    return Math.floor(pnl / 1000) * 1000;
  };

  const nextMilestone = getNextMilestone(totalPnL);
  const prevMilestone = getPrevMilestone(totalPnL);
  const progressPercent = totalPnL < 0 ? 0 : Math.max(0, Math.min(100, ((totalPnL - prevMilestone) / (nextMilestone - prevMilestone)) * 100));

  useGSAP(() => {
    if (totalPnL > prevPnLRef.current) {
      // Flash green when profit increases
      gsap.fromTo(
        containerRef.current,
        { boxShadow: "0 0 25px rgba(16, 185, 129, 0.8)", borderColor: "rgba(16, 185, 129, 0.6)" },
        { boxShadow: isPositive ? "0 0 10px rgba(16, 185, 129, 0.2)" : "none", borderColor: "rgba(255, 255, 255, 0.1)", duration: 1, ease: "power2.out" }
      );
    }
    prevPnLRef.current = totalPnL;
  }, { scope: containerRef, dependencies: [totalPnL, isPositive] });

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col justify-center min-w-[220px] h-14 shrink-0 rounded-lg bg-gradient-to-r from-[#071327] to-[#040a17] border border-white/10 px-4 py-1.5 transition-all duration-500 relative overflow-hidden ${isPositive ? 'shadow-[0_0_10px_rgba(16,185,129,0.2)]' : ''}`}
    >
      <div className="flex items-center justify-between gap-4 w-full">
        <span className="text-[11px] font-black uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5 whitespace-nowrap">
          <Zap className={`w-3.5 h-3.5 ${isPositive ? 'text-cyan-400' : 'text-on-surface-variant'}`} />
          Market P&L
        </span>
        <span className={`text-[17px] font-black tracking-tight flex items-center whitespace-nowrap ${isPositive ? 'text-bull-green drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'text-bear-red drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]'}`}>
          {totalPnL >= 0 ? '+' : ''}₹
          <NumberFlow
            value={totalPnL}
            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            className="inline-block"
          />
        </span>
      </div>
      
      {/* Milestone Tracker */}
      <div className="mt-1 flex flex-col gap-0.5">
        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-on-surface-variant opacity-80">
          <span>{totalPnL < 0 ? "Recovery" : "Progress"}</span>
          <span className="flex items-center gap-0.5"><Target className="w-2.5 h-2.5 text-cyan-500" /> ₹{nextMilestone}</span>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${isPositive ? 'bg-gradient-to-r from-cyan-500 to-bull-green shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-bear-red/50'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
