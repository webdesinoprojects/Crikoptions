import React from "react";
import { useMatchDetails } from "@/features/dashboard/hooks";
import { useWatchlist, useAddWatchlist, useRemoveWatchlist } from "@/features/watchlist/hooks/useWatchlist";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface MatchAnalyticsPanelProps {
  matchId: string;
  marketId: string;
}

export function MatchAnalyticsPanel({ matchId, marketId }: MatchAnalyticsPanelProps) {
  const { data: match, isLoading } = useMatchDetails(matchId);
  const { data: watchlist } = useWatchlist();
  
  const addWatchlistMutation = useAddWatchlist();
  const removeWatchlistMutation = useRemoveWatchlist();

  const isWatchlisted = watchlist?.marketIds.includes(marketId) || false;

  const handleWatchlistToggle = () => {
    if (isWatchlisted) {
      removeWatchlistMutation.mutate(marketId, {
        onSuccess: () => {
          toast.success("Removed market from watchlist");
        },
        onError: () => {
          toast.error("Failed to remove from watchlist");
        },
      });
    } else {
      addWatchlistMutation.mutate(marketId, {
        onSuccess: () => {
          toast.success("Added market to watchlist");
        },
        onError: () => {
          toast.error("Failed to add to watchlist");
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 bg-surface-container-lowest border border-outline-variant rounded-xl">
        <Skeleton className="h-24 rounded-lg bg-surface-container" />
        <Skeleton className="h-32 rounded-lg bg-surface-container" />
        <Skeleton className="h-40 rounded-lg bg-surface-container" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Match Scorecard Header with Watchlist Toggle */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-3 relative">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-bold text-primary tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">
            {match?.format || "T20"} • {match?.status || "LIVE"}
          </span>
          
          <button
            type="button"
            onClick={handleWatchlistToggle}
            className={`p-1 rounded-md border transition-all ${
              isWatchlisted
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
                : "bg-surface border-outline-variant text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Star className={`w-4 h-4 ${isWatchlisted ? "fill-amber-500" : ""}`} />
          </button>
        </div>

        {/* Teams and Score */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm font-bold text-on-surface">
            <span>{match?.homeTeam?.name || "CSK"}</span>
            <span className="font-data-tabular">{match?.homeScore || "0/0"}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-on-surface">
            <span>{match?.awayTeam?.name || "MI"}</span>
            <span className="font-data-tabular">{match?.awayScore || "—"}</span>
          </div>
        </div>

        <div className="flex justify-between text-[11px] text-on-surface-variant border-t border-outline-variant pt-2">
          <span>Overs: <strong className="text-on-surface">{match?.currentOver || "0.0"}</strong></span>
          <span>Match State DNA: <strong className="text-bull-green">94% CLUTCH</strong></span>
        </div>
      </div>

      {/* Head to Head (H2H) Analytics Panel */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-3">
        <span className="font-label-sm text-label-sm font-bold text-on-surface border-b border-outline-variant pb-1.5">
          Match DNA Metrics
        </span>
        
        <div className="flex flex-col gap-3 text-xs">
          {/* Strike Rate comparison progress bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-on-surface-variant">
              <span>Avg Strike Rate</span>
              <span>CSK (142) vs MI (148)</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden flex">
              <div className="bg-primary h-full" style={{ width: "48%" }} />
              <div className="bg-orange-500 h-full" style={{ width: "52%" }} />
            </div>
          </div>

          {/* Economy comparison progress bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] text-on-surface-variant">
              <span>Bowling Economy</span>
              <span>CSK (7.8) vs MI (8.2)</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden flex">
              <div className="bg-primary h-full" style={{ width: "51%" }} />
              <div className="bg-orange-500 h-full" style={{ width: "49%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Live Video Stream Player Simulator */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden relative flex-grow flex flex-col min-h-[160px]">
        <div className="bg-surface px-3 py-2 border-b border-outline-variant flex justify-between items-center">
          <span className="font-label-sm text-label-sm font-bold text-on-surface">Live Broadcast</span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-bear-red">
            <span className="w-1.5 h-1.5 rounded-full bg-bear-red animate-pulse" />
            LIVE FEED
          </span>
        </div>

        {/* Video simulation placeholder */}
        <div className="flex-grow bg-black relative flex items-center justify-center">
          <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: "url('/assets/live-stadium.jpg')" }} />
          <span className="text-white text-[11px] font-bold z-10 bg-black/60 px-3 py-1.5 rounded-md border border-outline-variant">
            Broadcast Feed Connected
          </span>
        </div>
      </div>
    </div>
  );
}
