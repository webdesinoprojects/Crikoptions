"use client";

import React from "react";
import NumberFlow from "@number-flow/react";
import { Activity, Gauge, Info, Radio, Swords } from "lucide-react";
import { BackendMarket } from "@/lib/adapters/market.adapter";
import { cn } from "@/lib/utils";
import { BatterStats, Match } from "@/types";
import { useStableMatchSnapshot } from "../hooks/useStableMatchSnapshot";
import {
  BallEvent,
  ballClassName,
  battingTeamForMatch,
  bowlingTeamForMatch,
  currentInningsScoreParts,
  teamCode,
} from "../utils/terminal-context";

interface LiveMatchStatsPanelProps {
  match?: Match;
  market?: BackendMarket;
  className?: string;
}

export function LiveMatchStatsPanel({ match, market, className }: LiveMatchStatsPanelProps) {
  const { stableMatch, balls } = useStableMatchSnapshot(match, market?.matchId);
  
  const score = currentInningsScoreParts(stableMatch);
  const parsedRuns = Number.parseInt(score.runs, 10);
  const parsedWickets = Number.parseInt(score.wickets, 10);
  const currentScore = Number.isFinite(parsedRuns) ? parsedRuns : 0;
  const wickets = Number.isFinite(parsedWickets) ? parsedWickets : 0;
  const totalBalls = totalBallsForFormat(stableMatch?.format);
  const ballsLeft = Math.max(0, Math.min(totalBalls, stableMatch?.ballsLeft ?? totalBalls));
  const ballsBowled = totalBalls - ballsLeft;
  const overs = stableMatch?.currentOver ?? oversTextFromBalls(ballsBowled);
  const crr = ballsBowled > 0 ? currentScore / (ballsBowled / 6) : 0;
  const projected = projectedFinal(currentScore, ballsLeft, crr, market);
  const projectionReady = ballsBowled >= 6;
  const innings = stableMatch?.innings ?? 1;
  const liveContext = stableMatch?.liveContext;
  const targetScore = stableMatch?.targetScore ?? 0;
  const isChase = innings === 2 && targetScore > 0;
  const runsNeeded = isChase ? Math.max(0, targetScore - currentScore) : 0;
  const rrr = isChase && ballsLeft > 0 && runsNeeded > 0 ? (runsNeeded / ballsLeft) * 6 : 0;
  const bowlerEconomy = liveContext && liveContext.bowler.balls > 0
    ? liveContext.bowler.runs / (liveContext.bowler.balls / 6)
    : 0;
  
  const compactThisOver = balls.length > 6;
  const battingTeam = battingTeamForMatch(stableMatch);
  const bowlingTeam = bowlingTeamForMatch(stableMatch);
  const battingCode = teamCode(battingTeam?.shortName || battingTeam?.name);
  const bowlingCode = teamCode(bowlingTeam?.shortName || bowlingTeam?.name);
  const lastWicket = [...balls].reverse().find((ball) => isWicket(ball));
  const momentum = momentumLabel(balls, crr, battingCode, bowlingCode);
  const volatility = volatilityLabel(market);

  return (
    <aside
      className={cn(
        "relative flex h-[620px] min-h-[460px] flex-col overflow-hidden rounded-[10px] border border-cyan-300/16 bg-[#030916]/96 shadow-[0_24px_80px_rgba(0,0,0,0.42)]",
        className
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/70 to-transparent" />

      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-color:rgba(56,189,248,0.22)_transparent] [scrollbar-width:thin]">
        <section className="border-b border-cyan-100/10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_48%),#050c1b] p-3.5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em]",
                match?.status === "LIVE"
                  ? "border-amber-300/25 bg-amber-400/12 text-amber-200"
                  : "border-cyan-300/20 bg-cyan-400/10 text-cyan-200"
              )}
            >
              {match?.status === "LIVE" && <span className="size-1.5 rounded-full bg-amber-200 shadow-[0_0_10px_rgba(253,230,138,0.9)]" />}
              {match?.status ?? "LIVE"}
            </span>
            <span className="truncate text-right text-[13px] font-bold tracking-tight text-slate-100">
              {stableMatch?.title ?? `${battingCode} vs ${bowlingCode}`}
            </span>
          </div>

          <div className="grid grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-3">
            <TeamMark code={teamCode(match?.homeTeam.shortName || match?.homeTeam.name)} active={innings === 1} />
            <div className="min-w-0 text-center">
              <div className="font-data-tabular text-[25px] font-black leading-none tracking-[-0.04em] text-cyan-300">
                {battingCode}{" "}
                <NumberFlow value={currentScore} />
                <span className="text-cyan-200">/</span>
                <NumberFlow value={wickets} />
                <span className="ml-1.5 text-[12px] font-semibold tracking-normal text-slate-400">({overs} ov)</span>
              </div>
              <div className="mt-2 truncate text-[10px] text-slate-400">
                {bowlingCode} bowling <span className="mx-1 text-slate-600">•</span> {stableMatch?.format ?? "T20"}
                <span className="mx-1 text-slate-600">•</span> {ordinal(innings)} innings
              </div>
              {isChase && (
                <div className="mt-1.5 font-data-tabular text-[11px] font-bold text-amber-200">
                  Target {targetScore}
                  <span className="mx-1.5 font-normal text-slate-500">·</span>
                  Need {runsNeeded} off {ballsLeft}
                </div>
              )}
            </div>
            <TeamMark code={teamCode(match?.awayTeam.shortName || match?.awayTeam.name)} active={innings === 2} />
          </div>

          <div className={cn("mt-3 grid gap-2", isChase ? "grid-cols-3" : "grid-cols-2")}>
            <StatBox
              label="CRR · runs/over"
              value={crr.toFixed(2)}
              hint={ballsBowled > 0 ? `${currentScore} ÷ ${ballsBowled} balls × 6` : "Starts after first ball"}
            />
            {isChase ? (
              <>
                <StatBox
                  label="Target"
                  value={targetScore}
                  hint={`${battingCode} need ${targetScore} to win`}
                  tone="cyan"
                />
                <StatBox
                  label="RRR · required"
                  value={rrr > 0 ? rrr.toFixed(2) : "—"}
                  hint={runsNeeded > 0 ? `${runsNeeded} runs in ${ballsLeft} balls` : "Chase complete"}
                  tone="cyan"
                />
              </>
            ) : (
              <StatBox
                label="Projected"
                value={projectionReady ? projected : "—"}
                hint={projectionReady ? "At current run rate" : "Available after 1 over"}
                tone="cyan"
              />
            )}
          </div>
        </section>

        <section className="border-b border-cyan-100/10 bg-[#040b18] px-3.5 py-3">
          <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
            Recent balls
            <Info className="size-3 text-slate-500" aria-hidden />
          </div>
          <BallStrip balls={balls} compact={compactThisOver} matchId={stableMatch?.id ?? ""} innings={innings} over={overs} />
        </section>

        <section className="border-b border-cyan-100/10 p-3">
          <div className="mb-2 flex items-center justify-between border-b border-cyan-100/10 pb-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-200">
              <Radio className="size-3.5 text-cyan-400" aria-hidden />
              On-field matrix
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              Live
            </span>
          </div>

          <div className="grid gap-2">
            <FieldBlock icon={<Swords className="size-4" />} title="Batting now" tone="cyan">
              {liveContext ? (
                <>
                  <BatterRow player={liveContext.striker} striker />
                  <BatterRow player={liveContext.nonStriker} />
                  <MetricRow
                    label="Partnership"
                    value={`${liveContext.partnership.runs} off ${liveContext.partnership.balls}`}
                    mono
                  />
                </>
              ) : (
                <MissingPlayerFeed />
              )}
            </FieldBlock>

            <FieldBlock icon={<Activity className="size-4" />} title="Bowling now">
              {liveContext ? (
                <>
                  <MetricRow label="Bowler" value={liveContext.bowler.name} strong />
                  <MetricRow
                    label="Figures"
                    value={`${oversFromBalls(liveContext.bowler.balls)}-${liveContext.bowler.maidens}-${liveContext.bowler.runs}-${liveContext.bowler.wickets}`}
                    mono
                  />
                </>
              ) : (
                <MissingPlayerFeed />
              )}
              <div className="flex items-center justify-between gap-3 py-1.5">
                <span className="text-[10px] text-slate-400">This over</span>
                <div className="flex items-center gap-1 flex-wrap justify-end">
                  {balls.map((ball, index) => (
                    <span
                      key={`${stableMatch?.id}-${innings}-${overs}-${index}-mini`}
                      className={cn(
                        "flex size-4 items-center justify-center rounded-full border font-data-tabular text-[7px] font-black",
                        ballClassName(ball.kind)
                      )}
                    >
                      {ball.label}
                    </span>
                  ))}
                </div>
              </div>
              <MetricRow label="Economy" value={liveContext ? bowlerEconomy.toFixed(2) : "—"} mono />
            </FieldBlock>
          </div>
        </section>

        <section className="p-3">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-200">
            <Gauge className="size-3.5 text-cyan-400" aria-hidden />
            Match pulse
          </div>
          <div className="overflow-hidden rounded-[6px] border border-cyan-100/10 bg-[#050d1d]">
            <PulseRow label="Last wicket" value={lastWicket?.detail ?? "No wicket this over"} />
            <PulseRow label="Momentum" value={momentum.value} tone={momentum.tone} />
            <PulseRow label="Market volatility" value={volatility.value} tone={volatility.tone} />
            <PulseRow label="Pressure" value={crr >= 8 ? `On ${bowlingCode}` : "Balanced phase"} tone={crr >= 8 ? "amber" : "muted"} />
          </div>
        </section>
      </div>
    </aside>
  );
}

function TeamMark({ active, code }: { active: boolean; code: string }) {
  return (
    <div className="text-center">
      <div
        className={cn(
          "mx-auto flex size-10 items-center justify-center rounded-[7px] border bg-[#071326] font-data-tabular text-[11px] font-black tracking-tight",
          active ? "border-cyan-300/40 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.12)]" : "border-white/10 text-slate-400"
        )}
      >
        {code}
      </div>
      <div className={cn("mt-1 text-[9px] font-bold", active ? "text-slate-200" : "text-slate-500")}>{code}</div>
    </div>
  );
}

function BallStrip({ balls, compact, matchId, innings, over }: { balls: BallEvent[]; compact: boolean; matchId: string; innings: number; over: string }) {
  return (
    <div className={cn("w-full flex items-center gap-2", compact ? "flex-wrap justify-center" : "justify-between")}>
      {balls.map((ball, index) => (
        <span
          key={`${matchId}-${innings}-${over}-${index}`}
          aria-label={ball.kind === "empty" ? `Ball ${index + 1}: not yet bowled` : `Ball ${index + 1}: ${ball.detail ?? ball.label}`}
          title={ball.detail ?? ball.label}
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full border font-data-tabular font-black",
            compact ? "h-7 min-w-7 justify-self-center px-1 text-[9px]" : "h-9 min-w-9 px-2 text-[11px]",
            ballClassName(ball.kind)
          )}
        >
          {ball.label}
        </span>
      ))}
    </div>
  );
}

function FieldBlock({
  children,
  icon,
  title,
  tone,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  tone?: "cyan";
}) {
  return (
    <div className="overflow-hidden rounded-[6px] border border-cyan-100/10 bg-[#050d1d]">
      <div
        className={cn(
          "flex items-center gap-2 border-b border-cyan-100/10 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.08em]",
          tone === "cyan" ? "bg-cyan-400/7 text-cyan-100" : "bg-white/[0.02] text-slate-300"
        )}
      >
        <span className={tone === "cyan" ? "text-cyan-400" : "text-slate-500"}>{icon}</span>
        {title}
      </div>
      <div className="divide-y divide-cyan-100/8 px-2.5">{children}</div>
    </div>
  );
}

function MetricRow({ label, mono, strong, value }: { label: string; mono?: boolean; strong?: boolean; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-[10px]">
      <span className="text-slate-400">{label}</span>
      <span className={cn("truncate text-right text-slate-200", mono && "font-data-tabular", strong && "font-semibold")}>{value}</span>
    </div>
  );
}

function BatterRow({ player, striker = false }: { player: BatterStats; striker?: boolean }) {
  const strikeRate = player.balls > 0 ? (player.runs / player.balls) * 100 : 0;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 py-1.5 text-[10px]">
      <span className="truncate font-semibold text-slate-200">
        {player.name}{striker ? " *" : ""}
      </span>
      <span className="font-data-tabular font-bold text-slate-100">{player.runs} ({player.balls})</span>
      <span className="w-12 text-right font-data-tabular text-[9px] text-slate-500">SR {strikeRate.toFixed(1)}</span>
    </div>
  );
}

function MissingPlayerFeed() {
  return (
    <div className="py-2 text-[10px] leading-relaxed text-amber-200/80">
      Player context is not set. Add striker, non-striker, and bowler in Admin Match Control.
    </div>
  );
}

function PulseRow({ label, tone = "muted", value }: { label: string; tone?: "cyan" | "emerald" | "amber" | "red" | "muted"; value: string }) {
  const tones = {
    cyan: "text-cyan-300",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    red: "text-red-400",
    muted: "text-slate-300",
  };

  return (
    <div className="flex items-center justify-between gap-3 border-b border-cyan-100/8 px-2.5 py-2 text-[10px] last:border-b-0">
      <span className="text-slate-400">{label}</span>
      <span className={cn("truncate text-right font-semibold", tones[tone])}>{value}</span>
    </div>
  );
}

function StatBox({ hint, label, tone, value }: { hint: string; label: string; tone?: "cyan"; value: React.ReactNode }) {
  return (
    <div className="rounded-[6px] border border-cyan-100/12 bg-[#07152a]/90 px-3 py-2 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="text-[9px] uppercase tracking-[0.1em] text-slate-400">{label}</div>
      <div className={cn("mt-0.5 font-data-tabular text-[17px] font-black", tone === "cyan" ? "text-cyan-300" : "text-slate-100")}>{value}</div>
      <div className="mt-0.5 truncate font-data-tabular text-[8px] text-slate-500" title={hint}>{hint}</div>
    </div>
  );
}

function momentumLabel(balls: BallEvent[], crr: number, battingCode: string, bowlingCode: string) {
  const completed = balls.filter((ball) => ball.kind !== "empty");
  const recent = completed.slice(-2);
  if (recent.some(isWicket)) return { value: `${bowlingCode} pressing`, tone: "red" as const };
  if (recent.some((ball) => ball.kind === "four" || ball.kind === "six") || crr >= 8) {
    return { value: `${battingCode} attacking`, tone: "emerald" as const };
  }
  return { value: "Even phase", tone: "cyan" as const };
}

function volatilityLabel(market?: BackendMarket) {
  const baseline = Math.max(1, market?.ltp ?? 0);
  const spread = Math.max(0, (market?.high ?? 0) - (market?.low ?? 0));
  const ratio = spread / baseline;
  if (ratio >= 0.12) return { value: "High", tone: "red" as const };
  if (ratio >= 0.04) return { value: "Active", tone: "amber" as const };
  return { value: "Stable", tone: "emerald" as const };
}

function isWicket(ball: BallEvent) {
  return ["wicket", "bowled", "lbw", "caught", "runOut"].includes(ball.kind);
}

function projectedFinal(currentScore: number, ballsLeft: number, crr: number, market?: BackendMarket) {
  if (currentScore === 0 && market?.ltp) return Math.round(market.ltp);
  if (crr <= 0) return currentScore;
  return Math.max(currentScore, Math.round(currentScore + crr * (ballsLeft / 6)));
}

function totalBallsForFormat(format?: string) {
  const upper = (format ?? "T20").toUpperCase();
  return upper.includes("ODI") || upper.includes("ONE") ? 300 : 120;
}

function oversTextFromBalls(balls: number) {
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

function oversFromBalls(balls: number) {
  const legalBalls = Math.max(0, balls);
  return `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
}

function ordinal(value: number) {
  if (value === 1) return "1st";
  if (value === 2) return "2nd";
  if (value === 3) return "3rd";
  return `${value}th`;
}
