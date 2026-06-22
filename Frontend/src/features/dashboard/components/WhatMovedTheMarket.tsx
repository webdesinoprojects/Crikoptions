import { Info, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLiveTicker } from "@/features/dashboard/hooks";

export function WhatMovedTheMarket() {
  const { data: tickers } = useLiveTicker();
  const tradingHref = tickers?.[0]?.id ? `/trading/${tickers[0].id}` : "/dashboard";
  const events = [
    { over: "16.1", type: "SIX", typeColor: "text-[#d4af37]", contract: "Kohli 75+ Runs", before: 61, now: 72, move: "+18.4%", isUp: true },
    { over: "15.5", type: "DOT", typeColor: "text-white/60", contract: "RCB Match Winner", before: 66, now: 64, move: "-3.0%", isUp: false },
    { over: "15.3", type: "FOUR", typeColor: "text-cyan-400", contract: "RCB 175+ Total", before: 48, now: 55, move: "+14.6%", isUp: true },
    { over: "14.6", type: "WICKET", typeColor: "text-error", contract: "Next Wicket <18 OV", before: 31, now: 38, move: "+22.6%", isUp: true },
  ];

  return (
    <div className="bg-[#0a1428] rounded-xl border border-white/10 flex flex-col h-full">
      <div className="p-5 border-b border-white/10">
        <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-1">What Moved The Market</h3>
        <p className="text-xs text-on-surface-variant">Live contracts repriced by match events</p>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] text-on-surface-variant font-bold tracking-widest uppercase border-b border-white/5 bg-white/[0.02]">
              <th className="px-5 py-3 font-medium">Event</th>
              <th className="px-5 py-3 font-medium">Contract</th>
              <th className="px-5 py-3 font-medium">Before</th>
              <th className="px-5 py-3 font-medium">Now</th>
              <th className="px-5 py-3 font-medium">Move</th>
              <th className="px-5 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {events.map((ev, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center bg-black/20 text-xs font-bold text-white font-data-tabular">
                      {ev.over}
                    </div>
                    <span className={cn("text-xs font-black uppercase tracking-widest", ev.typeColor)}>
                      {ev.type}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-white/90">
                  {ev.contract}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-data-tabular text-white/60">Rs {ev.before}</span>
                    <MockSparkline isUp={ev.isUp} />
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 bg-[#00284d] px-3 py-1.5 rounded-md border border-cyan-500/30 w-fit">
                    <span className="text-sm font-data-tabular font-bold text-cyan-400">Rs {ev.now}</span>
                    <MockSparkline isUp={ev.isUp} highlight />
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className={cn("flex items-center gap-1 text-sm font-data-tabular font-bold", ev.isUp ? "text-bull-green" : "text-bear-red")}>
                    {ev.move}
                    {ev.isUp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-right">
                  <Link href={tradingHref} className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-400 border border-cyan-500/50 rounded hover:bg-cyan-500/10 transition-colors inline-block text-center">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/[0.01]">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Info className="w-4 h-4" />
          Every movement is connected to the delivery that caused it.
        </div>
        <Link href={tradingHref} className="text-xs font-bold text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors flex items-center gap-1">
          Open Live Terminal ↗
        </Link>
      </div>
    </div>
  );
}

function MockSparkline({ isUp, highlight = false }: { isUp: boolean, highlight?: boolean }) {
  const color = highlight ? "#22d3ee" : "#3b82f6"; // cyan-400 or blue-500
  return (
    <svg width="40" height="12" viewBox="0 0 40 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      {isUp ? (
        <path d="M1 10L10 6L18 8L30 2L39 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M1 2L10 5L18 3L30 9L39 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}
