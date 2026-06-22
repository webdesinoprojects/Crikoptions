import { Bell } from "lucide-react";
import { useHomeMatches, useLiveTicker } from "@/features/dashboard/hooks";
import { useMarkets } from "@/features/trading/hooks";
import Link from "next/link";

export function ComingUp() {
  const { data: matches } = useHomeMatches();
  const { data: tickers } = useLiveTicker();

  const upcomingMatch = matches?.find(m => m.status === "UPCOMING");
  const { data: upcomingMarkets } = useMarkets(upcomingMatch?.id || "");
  
  const upcomingMarketId = upcomingMarkets?.[0]?.id;
  const tradingHref = upcomingMarketId ? `/trading/${upcomingMarketId}` : (tickers?.[0]?.id ? `/trading/${tickers[0].id}` : "/dashboard");

  const homeTeam = upcomingMatch?.homeTeam?.shortName || "CSK";
  const awayTeam = upcomingMatch?.awayTeam?.shortName || "MI";
  
  // Format start time if available
  const startTimeDisplay = upcomingMatch?.startTime 
    ? new Date(upcomingMatch.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "7:30 PM";

  return (
    <div className="bg-[#0a1428] rounded-xl border border-white/10 p-5 mt-4">
      <div className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-4">
        Coming Up
      </div>

      <div className="flex items-center gap-4">
        {/* Team Logos */}
        <div className="flex -space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-yellow-500 border-2 border-[#0a1428] flex items-center justify-center font-black text-[#000d1a] text-xs z-10">{homeTeam}</div>
          <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-[#0a1428] flex items-center justify-center font-black text-white text-xs">{awayTeam}</div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white/60">{startTimeDisplay}</span>
            <span className="text-sm font-bold text-white">{homeTeam} vs {awayTeam}</span>
          </div>
          <div className="text-xs text-on-surface-variant">
            Market opens in <span className="text-cyan-400 font-data-tabular font-bold">02:14:32</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={tradingHref} className="px-4 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors inline-block text-center">
            Preview
          </Link>
          <button className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
