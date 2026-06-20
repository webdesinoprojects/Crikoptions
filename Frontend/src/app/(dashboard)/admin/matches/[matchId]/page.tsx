"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { OptionChain } from "@/features/trading/components/OptionChain";
import { BackendMarket } from "@/lib/adapters/market.adapter";
import { toast } from "sonner";
import { ballEventFromAdmin } from "@/features/trading/utils/terminal-context";
import { appendBall, clearBallLog } from "@/features/trading/utils/ball-log";
import type { LiveMatchContext, Match } from "@/types/match";

const wsEnabled = process.env.NEXT_PUBLIC_WS_ENABLED === "true";

type BallEvent = {
  runs: number;
  wicket: boolean;
  wide?: boolean;
  noBall?: boolean;
};

type BackendMatch = {
  _id?: string;
  innings: number;
  currentScore: number;
  wicketsLost: number;
  ballsLeft: number;
  targetScore?: number;
  status: string;
  oversText?: string;
  teamAName?: string;
  teamBName?: string;
  format?: string;
  liveContext?: LiveMatchContext;
};

const emptyLiveContext: LiveMatchContext = {
  striker: { name: "", runs: 0, balls: 0 },
  nonStriker: { name: "", runs: 0, balls: 0 },
  bowler: { name: "", balls: 0, maidens: 0, runs: 0, wickets: 0 },
  partnership: { runs: 0, balls: 0 },
};

// Convert BackendMatch to Match type for components
function toMatchType(backendMatch: BackendMatch): Match {
  const normalizedStatus = backendMatch.status?.toUpperCase();
  const status: Match["status"] =
    normalizedStatus === "UPCOMING" || normalizedStatus === "COMPLETED" ? normalizedStatus : "LIVE";
  const homeName = backendMatch.teamAName || "Team A";
  const awayName = backendMatch.teamBName || "Team B";

  return {
    id: backendMatch._id || '',
    title: `${homeName} vs ${awayName}`,
    status,
    homeTeam: { id: '1', name: homeName, shortName: homeName.slice(0, 3).toUpperCase() },
    awayTeam: { id: '2', name: awayName, shortName: awayName.slice(0, 3).toUpperCase() },
    startTime: new Date().toISOString(),
    format: backendMatch.format || 'T20',
    innings: backendMatch.innings,
    currentScore: backendMatch.currentScore,
    wicketsLost: backendMatch.wicketsLost,
    ballsLeft: backendMatch.ballsLeft,
    targetScore: backendMatch.targetScore,
    liveContext: backendMatch.liveContext,
    currentOver: backendMatch.oversText,
  };
}

export default function AdminMatchControlPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<BackendMatch | null>(null);
  const [market, setMarket] = useState<BackendMarket | null>(null);
  const [targetInput, setTargetInput] = useState("");
  const [liveContextInput, setLiveContextInput] = useState<LiveMatchContext>(emptyLiveContext);
  const [incomingBatter, setIncomingBatter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchData = useCallback(async () => {
    if (!matchId) return;
    try {
      const [matchRes, marketsRes] = await Promise.all([
        apiClient.get<{ success: boolean; data: BackendMatch }>(`/v1/matches/${matchId}`),
        apiClient.get<{ success: boolean; data: BackendMarket[] }>(`/v1/matches/${matchId}/markets`),
      ]);
      setMatch(matchRes.data.data);
      setTargetInput(matchRes.data.data.targetScore ? String(matchRes.data.data.targetScore) : "");
      setLiveContextInput(matchRes.data.data.liveContext ?? emptyLiveContext);
      const depthMarket =
        marketsRes.data.data.find((m: BackendMarket) => m.type === "match_depth") || marketsRes.data.data[0];
      setMarket(depthMarket || null);
    } catch (error) {
      toast.error("Failed to load match or markets");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchData();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [fetchData]);

  const resetMatch = async () => {
    if (!match) return;
    setUpdating(true);
    try {
      await apiClient.patch(`/v1/admin/matches/${matchId}/score`, {
        innings: match.innings,
        currentScore: 0,
        wicketsLost: 0,
        ballsLeft: 120,
        targetScore: 0,
        status: "live",
      });
      clearBallLog(matchId);
      toast.success("Match reset to start of innings");
      await fetchData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to reset match"));
    } finally {
      setUpdating(false);
    }
  };

  const saveLiveContext = async () => {
    if (!matchId) return;
    if (!liveContextInput.striker.name.trim() || !liveContextInput.nonStriker.name.trim() || !liveContextInput.bowler.name.trim()) {
      toast.error("Enter striker, non-striker, and bowler names");
      return;
    }

    setUpdating(true);
    try {
      const response = await apiClient.patch<{ success: boolean; data: BackendMatch }>(
        `/v1/admin/matches/${matchId}/players`,
        liveContextInput
      );
      setMatch(response.data.data);
      setLiveContextInput(response.data.data.liveContext ?? liveContextInput);
      toast.success("Live player context saved");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save live player context"));
    } finally {
      setUpdating(false);
    }
  };

  const applyBallEvent = async (event: BallEvent) => {
    if (!match || !matchId) return;
    if (!match.liveContext) {
      toast.error("Save the live player context before recording deliveries");
      return;
    }
    if (event.wicket && !incomingBatter.trim()) {
      toast.error("Enter the incoming batter before recording a wicket");
      return;
    }

    setUpdating(true);
    try {
      const response = await apiClient.post<{ success: boolean; data?: BackendMatch }>(
        `/v1/admin/matches/${matchId}/ball`,
        {
          runs: event.wicket ? 0 : event.runs,
          isWicket: event.wicket,
          extra: event.wide ? "wide" : event.noBall ? "noball" : undefined,
          nextBatterName: event.wicket ? incomingBatter.trim() : undefined,
        }
      );

      if (response.data.data) {
        setMatch(response.data.data);
        setLiveContextInput(response.data.data.liveContext ?? liveContextInput);
      }

      if (!wsEnabled) {
        appendBall(matchId, ballEventFromAdmin(event));
      }

      if (event.wicket) setIncomingBatter("");

      toast.success("Ball event applied");
      await fetchData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to apply ball event"));
    } finally {
      setUpdating(false);
    }
  };

  const saveTargetScore = async () => {
    if (!match) return;
    const nextTarget = Number.parseInt(targetInput, 10) || 0;
    setUpdating(true);
    try {
      await apiClient.patch(`/v1/admin/matches/${matchId}/score`, {
        innings: match.innings,
        currentScore: match.currentScore,
        wicketsLost: match.wicketsLost,
        ballsLeft: match.ballsLeft,
        targetScore: nextTarget,
        status: match.status,
      });
      toast.success(nextTarget > 0 ? "Target score saved" : "Target score cleared");
      await fetchData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save target score"));
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
            <div className="text-xl font-bold">
              {match.currentScore}/{match.wicketsLost}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Balls Left</div>
            <div className="text-xl font-bold">{match.ballsLeft}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Overs</div>
            <div className="text-xl font-bold">{match.oversText ?? "0.0"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Status</div>
            <div className="text-xl font-bold">{match.status}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Target</div>
            <div className="text-xl font-bold">{match.targetScore || "--"}</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-sm text-gray-400">2nd innings target score</span>
            <input
              value={targetInput}
              onChange={(event) => setTargetInput(event.target.value)}
              type="number"
              min="0"
              className="h-10 w-40 rounded-md border border-gray-700 bg-gray-950 px-3 text-white"
              placeholder="e.g. 181"
            />
          </label>
          <Button onClick={saveTargetScore} disabled={updating} variant="secondary">
            Save Target
          </Button>
          <Button onClick={resetMatch} disabled={updating} variant="outline">
            Reset to Start (0/0, 120 balls)
          </Button>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-cyan-500/20 bg-slate-950 p-4 text-white">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Live player context</h2>
            <p className="mt-1 max-w-2xl text-xs text-slate-400">
              Set the official striker, non-striker, current bowler, and their figures. Every delivery updates these values automatically.
            </p>
          </div>
          <Button onClick={saveLiveContext} disabled={updating}>Save player context</Button>
        </div>

        <div className="grid gap-3 xl:grid-cols-3">
          <BatterEditor
            title="Striker"
            value={liveContextInput.striker}
            onChange={(striker) => setLiveContextInput((current) => ({ ...current, striker }))}
          />
          <BatterEditor
            title="Non-striker"
            value={liveContextInput.nonStriker}
            onChange={(nonStriker) => setLiveContextInput((current) => ({ ...current, nonStriker }))}
          />
          <BowlerEditor
            value={liveContextInput.bowler}
            onChange={(bowler) => setLiveContextInput((current) => ({ ...current, bowler }))}
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <NumberEditor
            label="Partnership runs"
            value={liveContextInput.partnership.runs}
            onChange={(runs) => setLiveContextInput((current) => ({
              ...current,
              partnership: { ...current.partnership, runs },
            }))}
          />
          <NumberEditor
            label="Partnership balls"
            value={liveContextInput.partnership.balls}
            onChange={(balls) => setLiveContextInput((current) => ({
              ...current,
              partnership: { ...current.partnership, balls },
            }))}
          />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Ball Events</h2>
        {!match.liveContext && (
          <p className="mb-3 rounded border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
            Save the live player context before recording deliveries.
          </p>
        )}
        <div className="mb-3 max-w-sm">
          <label className="mb-1 block text-sm text-gray-400">Incoming batter (required before wicket)</label>
          <input
            value={incomingBatter}
            onChange={(event) => setIncomingBatter(event.target.value)}
            className="h-10 w-full rounded-md border border-gray-700 bg-gray-950 px-3 text-white"
            placeholder="e.g. Rajat Patidar"
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Button onClick={() => applyBallEvent({ runs: 0, wicket: false })} disabled={updating || !match.liveContext}>
            Dot Ball
          </Button>
          <Button onClick={() => applyBallEvent({ runs: 1, wicket: false })} disabled={updating || !match.liveContext}>
            1 Run
          </Button>
          <Button onClick={() => applyBallEvent({ runs: 2, wicket: false })} disabled={updating || !match.liveContext}>
            2 Runs
          </Button>
          <Button onClick={() => applyBallEvent({ runs: 3, wicket: false })} disabled={updating || !match.liveContext}>
            3 Runs
          </Button>
          <Button onClick={() => applyBallEvent({ runs: 4, wicket: false })} disabled={updating || !match.liveContext}>
            Boundary (4)
          </Button>
          <Button onClick={() => applyBallEvent({ runs: 6, wicket: false })} disabled={updating || !match.liveContext}>
            Six (6)
          </Button>
          <Button onClick={() => applyBallEvent({ runs: 0, wicket: true })} disabled={updating || !match.liveContext || !incomingBatter.trim()} variant="destructive">
            Wicket
          </Button>
          <Button
            onClick={() => applyBallEvent({ runs: 1, wicket: false, wide: true })}
            disabled={updating || !match.liveContext}
            variant="secondary"
          >
            Wide (+1)
          </Button>
          <Button
            onClick={() => applyBallEvent({ runs: 1, wicket: false, noBall: true })}
            disabled={updating || !match.liveContext}
            variant="secondary"
          >
            No Ball (+1)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-2">Option Chain (Market: {market.title})</h2>
          <OptionChain marketId={market._id} market={market} match={toMatchType(match)} />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
            <li>Legal balls use POST /admin/matches/.../ball and push live WS commentary.</li>
            <li>Wides and no-balls are recorded as delivery events and do not consume a legal ball.</li>
            <li>Odd runs and completed overs rotate strike automatically.</li>
            <li>Enter the incoming batter before recording a wicket.</li>
            <li>The option chain updates automatically after each event.</li>
            <li>This page is admin-only; non-admin users cannot modify the match.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function BatterEditor({
  onChange,
  title,
  value,
}: {
  onChange: (value: LiveMatchContext["striker"]) => void;
  title: string;
  value: LiveMatchContext["striker"];
}) {
  return (
    <div className="rounded-md border border-white/10 bg-black/30 p-3">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-300">{title}</h3>
      <label className="mb-3 block">
        <span className="mb-1 block text-xs text-slate-400">Player name</span>
        <input
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
          className="h-9 w-full rounded border border-white/10 bg-slate-950 px-2.5 text-sm text-white"
          placeholder="Player name"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <NumberEditor label="Runs" value={value.runs} onChange={(runs) => onChange({ ...value, runs })} />
        <NumberEditor label="Balls" value={value.balls} onChange={(balls) => onChange({ ...value, balls })} />
      </div>
    </div>
  );
}

function BowlerEditor({
  onChange,
  value,
}: {
  onChange: (value: LiveMatchContext["bowler"]) => void;
  value: LiveMatchContext["bowler"];
}) {
  return (
    <div className="rounded-md border border-white/10 bg-black/30 p-3">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-300">Current bowler</h3>
      <label className="mb-3 block">
        <span className="mb-1 block text-xs text-slate-400">Player name</span>
        <input
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
          className="h-9 w-full rounded border border-white/10 bg-slate-950 px-2.5 text-sm text-white"
          placeholder="Bowler name"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <NumberEditor label="Balls bowled" value={value.balls} onChange={(balls) => onChange({ ...value, balls })} />
        <NumberEditor label="Maidens" value={value.maidens} onChange={(maidens) => onChange({ ...value, maidens })} />
        <NumberEditor label="Runs conceded" value={value.runs} onChange={(runs) => onChange({ ...value, runs })} />
        <NumberEditor label="Wickets" value={value.wickets} onChange={(wickets) => onChange({ ...value, wickets })} />
      </div>
    </div>
  );
}

function NumberEditor({ label, onChange, value }: { label: string; onChange: (value: number) => void; value: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-400">{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(Math.max(0, Number.parseInt(event.target.value, 10) || 0))}
        className="h-9 w-full rounded border border-white/10 bg-slate-950 px-2.5 font-mono text-sm text-white"
      />
    </label>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }
  return fallback;
}
