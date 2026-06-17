import React from "react";
import { useMatchDetails } from "@/features/dashboard/hooks";
import { useAddWatchlist, useRemoveWatchlist, useWatchlist } from "@/features/watchlist/hooks/useWatchlist";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { BroadcastInterfaceMask } from "./BroadcastInterfaceMask";
import { ballClassName } from "../utils/terminal-context";
import { useThisOverBalls } from "../hooks/useThisOverBalls";

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
  const thisOverBalls = useThisOverBalls(match);
  const compactThisOver = thisOverBalls.length > 6;

  const handleWatchlistToggle = () => {
    if (!marketId) {
      toast.error("No backend market selected");
      return;
    }

    if (isWatchlisted) {
      removeWatchlistMutation.mutate(marketId, {
        onSuccess: () => toast.success("Removed market from watchlist"),
        onError: () => toast.error("Failed to remove from watchlist"),
      });
    } else {
      addWatchlistMutation.mutate(marketId, {
        onSuccess: () => toast.success("Added market to watchlist"),
        onError: () => toast.error("Failed to add to watchlist"),
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

  const homeName = match?.homeTeam?.name || "0";
  const awayName = match?.awayTeam?.name || "0";
  const homeScore = match?.homeScore || "0/0";
  const awayScore = match?.awayScore || "0";
  const currentOver = match?.currentOver || "0.0";
  const totalBalls = totalBallsForFormat(match?.format);
  const ballsLeft = Math.max(0, Math.min(totalBalls, match?.ballsLeft ?? totalBalls));

  return (
    <div className="flex flex-col gap-4 xl:h-full">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-md p-4 flex flex-col gap-3 relative">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-bold text-primary tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">
            {match?.format || "0"} - {match?.status || "0"}
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

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm font-bold text-on-surface">
            <span>{homeName}</span>
            <span className="font-data-tabular">{homeScore}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-on-surface">
            <span>{awayName}</span>
            <span className="font-data-tabular">{awayScore}</span>
          </div>
        </div>

        <div className="flex justify-between text-[11px] text-on-surface-variant border-t border-outline-variant pt-2">
          <span>
            Overs: <strong className="text-on-surface">{currentOver}</strong>
          </span>
          <span>
            Innings: <strong className="text-on-surface">{match?.innings ?? 1}</strong>
          </span>
        </div>

        <div className="border-t border-outline-variant pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">This Over</span>
            <span className="text-[10px] font-bold text-on-surface-variant">{ballsLeft} balls left</span>
          </div>
          <div className={compactThisOver ? "grid w-full grid-cols-6 gap-1.5" : "flex w-full items-center justify-between gap-1.5"}>
            {thisOverBalls.map((ball, index) => (
              <span
                key={`${ball.kind}-${ball.label}-${index}`}
                aria-label={ball.kind === "empty" ? `Ball ${index + 1}: not yet bowled` : `Ball ${index + 1}: ${ball.label}`}
                className={`flex shrink-0 items-center justify-center rounded-full border font-black font-data-tabular shadow-inner ${
                  compactThisOver ? "h-6 w-6 justify-self-center text-[9px]" : "h-8 w-8 text-[11px]"
                } ${ballClassName(ball.kind)}`}
              >
                {ball.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden bg-surface-container-lowest border border-outline-variant rounded-md p-4 xl:flex flex-col gap-3">
        <span className="font-label-sm text-label-sm font-bold text-on-surface border-b border-outline-variant pb-1.5">
          Match DNA Metrics
        </span>

        <div className="flex flex-col gap-3 text-xs">
          {["Avg Strike Rate", "Bowling Economy"].map((label) => (
            <div key={label} className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] text-on-surface-variant">
                <span>{label}</span>
                <span>{homeName} (0) vs {awayName} (0)</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden flex">
                <div className="bg-primary h-full" style={{ width: "0%" }} />
                <div className="bg-orange-500 h-full" style={{ width: "0%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden bg-surface-container-lowest border border-outline-variant rounded-md overflow-hidden relative xl:flex-grow xl:flex flex-col min-h-[160px]">
        <div className="bg-surface px-3 py-2 border-b border-outline-variant flex justify-between items-center">
          <span className="font-label-sm text-label-sm font-bold text-on-surface">Broadcast Feed</span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant">0</span>
        </div>
        <div className="flex-grow bg-black relative flex items-center justify-center min-h-[160px]">
          <BroadcastInterfaceMask />
        </div>
      </div>
    </div>
  );
}

function totalBallsForFormat(format?: string) {
  const upper = (format ?? "T20").toUpperCase();
  return upper.includes("ODI") || upper.includes("ONE") ? 300 : 120;
}
