import React, { useMemo, useRef } from "react";
import { Zap } from "lucide-react";
import NumberFlow from "@number-flow/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useClosedPositions, useMarketDetail, useOpenPositions, useOptionChain } from "../hooks";
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
  const rowByStrike = useMemo(() => new Map(rows.map((row) => [row.strike, row])), [rows]);
  const positionFilters = useMemo(() => ({ marketId }), [marketId]);

  const { data: positions = [] } = useOpenPositions(positionFilters);
  const { data: closedPositions = [] } = useClosedPositions(positionFilters);
  
  const marketPositions = useMemo(
    () => {
      const today = new Date().setHours(0, 0, 0, 0);
      return positions.filter((position) => {
        if (position.marketId !== marketId || position.strike <= 0 || position.lots === 0) return false;
        const positionDate = new Date(position.createdAt || position.updatedAt || Date.now()).getTime();
        return positionDate >= today;
      });
    },
    [marketId, positions]
  );

  const openPnL = useMemo(
    () =>
      marketPositions.reduce((total, position) => {
        const chainRow = rowByStrike.get(position.strike);
        if (!chainRow) return total + position.pnl;

        const liveLtp = position.lots > 0 ? chainRow.bid : chainRow.ask;
        return total + roundCurrency((liveLtp - position.buyPrice) * position.lots);
      }, 0),
    [marketPositions, rowByStrike]
  );

  const closedPnL = useMemo(
    () =>
      closedPositions.reduce((total, position) => {
        if (position.marketId !== marketId) return total;
        
        // Check if closed today
        const today = new Date().setHours(0, 0, 0, 0);
        // @ts-ignore - position might be a Trade object with closedAt
        const closedAt = position.closedAt || position.updatedAt || Date.now();
        const closeDate = new Date(closedAt).getTime();
        
        if (closeDate < today) return total;
        
        return total + (position.realizedPnl ?? position.pnl);
      }, 0),
    [closedPositions, marketId]
  );
  const totalPnL = openPnL + closedPnL;
  const isPositive = totalPnL >= 0;



  useGSAP(() => {
    if (totalPnL > prevPnLRef.current) {
      // Flash green when profit increases
      gsap.fromTo(
        containerRef.current,
        { boxShadow: "0 0 35px rgba(20, 184, 166, 1)", borderColor: "rgba(20, 184, 166, 0.8)" },
        { boxShadow: isPositive ? "0 0 15px rgba(20, 184, 166, 0.3)" : "none", borderColor: "rgba(255, 255, 255, 0.1)", duration: 1, ease: "power2.out" }
      );
    }
    prevPnLRef.current = totalPnL;
  }, { scope: containerRef, dependencies: [totalPnL, isPositive] });

  return (
    <div 
      ref={containerRef}
      className={`relative flex h-12 w-full min-w-0 shrink-0 flex-col justify-center overflow-hidden rounded-lg border border-white/10 bg-gradient-to-r from-[#071327] to-[#040a17] px-3 py-1.5 transition-all duration-500 sm:h-14 sm:min-w-[220px] sm:px-4 lg:w-auto ${isPositive ? 'shadow-[0_0_10px_rgba(16,185,129,0.2)]' : ''}`}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-black uppercase tracking-wider text-on-surface-variant sm:text-[11px]">
          <Zap className={`h-3.5 w-3.5 ${isPositive ? 'text-cyan-400' : 'text-on-surface-variant'}`} />
          Today's P&L
        </span>
        <span className={`flex items-center whitespace-nowrap text-[15px] font-black tracking-tight sm:text-[17px] ${isPositive ? 'text-bull-green drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'text-bear-red drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]'}`}>
          {totalPnL >= 0 ? '+' : ''}₹
          <NumberFlow
            value={totalPnL}
            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            className="inline-block"
          />
        </span>
      </div>
      

    </div>
  );
}

function roundCurrency(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}
