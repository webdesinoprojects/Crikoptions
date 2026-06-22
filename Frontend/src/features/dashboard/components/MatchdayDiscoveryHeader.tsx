import React from "react";
import { ChevronDown } from "lucide-react";

export function MatchdayDiscoveryHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8 mb-4">
      <div>
        <h2 className="text-xl font-bold font-display text-white tracking-widest uppercase mb-1">
          Matchday Discovery
        </h2>
        <p className="text-sm text-on-surface-variant">
          Follow what moved, build your streak, and find your next edge.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 bg-[#0a1428] hover:bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-white font-medium transition-colors">
          RCB vs KKR
          <ChevronDown className="w-4 h-4 text-white/50" />
        </button>
        <button className="flex items-center gap-2 bg-error/10 hover:bg-error/20 border border-error/30 px-4 py-2 rounded-lg transition-colors">
          <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
          <span className="text-sm font-bold text-error tracking-widest uppercase">LIVE</span>
        </button>
      </div>
    </div>
  );
}
