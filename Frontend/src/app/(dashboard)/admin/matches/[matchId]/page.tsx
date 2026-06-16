"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { OptionChain } from "@/features/trading/components/OptionChain";
import { BackendMarket } from "@/lib/adapters/market.adapter";
import { toast } from "sonner";

type BallEvent = {
  runs: number;
  wicket: boolean;
  wide?: boolean;
  noBall?: boolean;
};

export default function AdminMatchControlPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<any>(null);
  const [market, setMarket] = useState<BackendMarket | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    if (!matchId) return;
    setLoading(true);
    try {
      const [matchRes, marketsRes] = await Promise.all([
        apiClient.get<{ success: boolean; data: any }>(`/v1/matches/${matchId}`),
        apiClient.get<{ success: boolean; data: BackendMarket[] }>(`/v1/matches/${matchId}/markets`),
      ]);
      setMatch(matchRes.data.data);
      const depthMarket = marketsRes.data.data.find((m: BackendMarket) => m.type === "match_depth") || marketsRes.data.data[0];
      setMarket(depthMarket || null);
    } catch (error) {
      toast.error("Failed to load match or markets");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [matchId]);

  const resetMatch = async () => {
    if (!match) return;
    setUpdating(true);
    try {
      await apiClient.patch(`/v1/admin/matches/${matchId}/score`, {
        innings: match.innings,
        currentScore: 0,
        wicketsLost: 0,
        ballsLeft: 120,
        status: "live",
      });
      toast.success("Match reset to start of innings");
      await fetchData();
    } catch (error: any) {
      toast.error(`Failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const applyBallEvent = async (event: BallEvent) => {
    if (!match) return;
    setUpdating(true);
    try {
      let newScore = match.currentScore;
      let newWickets = match.wicketsLost;
      let newBallsLeft = match.ballsLeft;

      if (event.wide) {
        newScore += 1;
      } else if (event.noBall) {
        newScore += 1;
        newBallsLeft = Math.max(0, newBallsLeft - 1);
      } else {
        newBallsLeft = Math.max(0, newBallsLeft - 1);
        newScore += event.runs;
        if (event.wicket) {
          newWickets += 1;
        }
      }

      let newStatus = match.status;
      if (newBallsLeft === 0 || newWickets >= 10) {
        newStatus = "completed";
      }

      const payload = {
        innings: match.innings,
        currentScore: newScore,
        wicketsLost: newWickets,
        ballsLeft: newBallsLeft,
        status: newStatus,
      };

      await apiClient.patch(`/v1/admin/matches/${matchId}/score`, payload);
      toast.success("Ball event applied");
      await fetchData();
    } catch (error: any) {
      toast.error(`Failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8">Loading match…</div>;
  if (!match) return <div className="p-8 text-red-500">Match not found</div>;
  if (!market) return <div className="p-8 text-red-500">No market found for this match</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Match Control</h1>

      <div className="mb-6 p-4 border rounded-lg bg-gray-900 text-white">
        <h2 className="text-lg font-semibold mb-2">Match State</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-400">Score</div>
            <div className="text-xl font-bold">{match.currentScore}/{match.wicketsLost}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Balls Left</div>
            <div className="text-xl font-bold">{match.ballsLeft}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Overs</div>
            <div className="text-xl font-bold">{match.oversText}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Status</div>
            <div className="text-xl font-bold">{match.status}</div>
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={resetMatch} disabled={updating} variant="outline">
            Reset to Start (0/0, 120 balls)
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Ball Events</h2>
        <div className="grid grid-cols-4 gap-2">
          <Button onClick={() => applyBallEvent({ runs: 0, wicket: false })} disabled={updating}>Dot Ball</Button>
          <Button onClick={() => applyBallEvent({ runs: 1, wicket: false })} disabled={updating}>1 Run</Button>
          <Button onClick={() => applyBallEvent({ runs: 2, wicket: false })} disabled={updating}>2 Runs</Button>
          <Button onClick={() => applyBallEvent({ runs: 3, wicket: false })} disabled={updating}>3 Runs</Button>
          <Button onClick={() => applyBallEvent({ runs: 4, wicket: false })} disabled={updating}>Boundary (4)</Button>
          <Button onClick={() => applyBallEvent({ runs: 6, wicket: false })} disabled={updating}>Six (6)</Button>
          <Button onClick={() => applyBallEvent({ runs: 0, wicket: true })} disabled={updating} variant="destructive">Wicket</Button>
          <Button onClick={() => applyBallEvent({ runs: 1, wide: true })} disabled={updating} variant="secondary">Wide (+1)</Button>
          <Button onClick={() => applyBallEvent({ runs: 1, noBall: true })} disabled={updating} variant="secondary">No Ball (+1)</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-2">Option Chain (Market: {market.title})</h2>
          <OptionChain marketId={market._id} market={market} match={match} />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
            <li>Click ball events to manually advance the match.</li>
            <li>The option chain will update automatically after each event.</li>
            <li>Use this to test pricing responsiveness and order flow.</li>
            <li>This page is admin‑only; non‑admin users cannot modify the match.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}