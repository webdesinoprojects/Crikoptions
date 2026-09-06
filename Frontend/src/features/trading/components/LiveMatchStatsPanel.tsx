"use client";

import React from "react";
import NumberFlow from "@number-flow/react";
import { Activity, Gauge, Info, Radio, Swords } from "lucide-react";
import { BackendMarket } from "@/lib/adapters/market.adapter";
import { cn } from "@/lib/utils";
import { BatterStats, Match, Team } from "@/types";
import { useOnFieldMatrix } from "../hooks/useOnFieldMatrix";
import { useStableMatchSnapshot } from "../hooks/useStableMatchSnapshot";
import {
  overBallChipClassName,
  overBallLabel,
  overBallVariant,
  feedStatusLabel,
  type PulseTone,
} from "../utils/on-field-matrix";
import {
  BallEvent,
  ballClassName,
  battingTeamForMatch,
  bowlingTeamForMatch,
  currentInningsScoreParts,
  teamCode,
} from "../utils/terminal-context";
import { isSimulatorMatch } from "../utils/home-matches";

interface LiveMatchStatsPanelProps {
  match?: Match;
  market?: BackendMarket;
  className?: string;
}

export function LiveMatchStatsPanel({ match, market, className }: LiveMatchStatsPanelProps) {
  const { stableMatch, balls } = useStableMatchSnapshot(match);
  const matrix = useOnFieldMatrix(stableMatch, market?.matchId ?? undefined, stableMatch?.id);
  const isCriclive = stableMatch?.dataSource === "criclive" || stableMatch?.dataSource === "sportmonks";
  const isSim = isSimulatorMatch(stableMatch ?? match);

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
  const targetScore = stableMatch?.targetScore ?? 0;
  const isChase = innings === 2 && targetScore > 0;
  const runsNeeded = isChase ? Math.max(0, targetScore - currentScore) : 0;
  const rrr = isChase && ballsLeft > 0 && runsNeeded > 0 ? (runsNeeded / ballsLeft) * 6 : 0;

  const compactThisOver = balls.length > 6;
  const battingTeam = battingTeamForMatch(stableMatch);
  const bowlingTeam = bowlingTeamForMatch(stableMatch);
  const battingCode = teamCode(battingTeam?.shortName || battingTeam?.name);
  const bowlingCode = teamCode(bowlingTeam?.shortName || bowlingTeam?.name);

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
                isSim
                  ? "border-purple-400/30 bg-purple-500/15 text-purple-200"
                  : match?.status === "LIVE" || match?.status === "INNINGS_BREAK"
                    ? "border-amber-300/25 bg-amber-400/12 text-amber-200"
                    : "border-cyan-300/20 bg-cyan-400/10 text-cyan-200"
              )}
            >
              {(match?.status === "LIVE" || match?.status === "INNINGS_BREAK") && (
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    isSim ? "bg-purple-300 shadow-[0_0_10px_rgba(192,132,252,0.9)]" : "bg-amber-200 shadow-[0_0_10px_rgba(253,230,138,0.9)]"
                  )}
                />
              )}
              {isSim
                ? "WARM UP"
                : match?.status === "INNINGS_BREAK"
                  ? "INNINGS BREAK"
                  : match?.status === "UPCOMING"
                    ? "UPCOMING"
                    : match?.status ?? "LIVE"}
            </span>
            {isSim ? (
              <span className="rounded border border-purple-400/25 bg-purple-400/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-purple-200">
                24/7 Warm Up Session
              </span>
            ) : (match?.dataSource === "criclive" || match?.dataSource === "sportmonks") && match.status !== "UPCOMING" && feedStatusLabel(match) ? (
              <span className="rounded border border-amber-400/20 bg-amber-400/8 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-amber-200/90">
                {feedStatusLabel(match)}
              </span>
            ) : null}
            {match?.status === "UPCOMING" && match.startTime && (
              <span className="rounded border border-cyan-300/20 bg-cyan-400/8 px-2 py-1 font-data-tabular text-[9px] font-black uppercase tracking-wider text-cyan-100">
                {new Date(match.startTime).toLocaleString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <span className="truncate text-right text-[13px] font-bold tracking-tight text-slate-100">
              {(() => {
                const titleStr = stableMatch?.title ?? `${battingCode} vs ${bowlingCode}`;
                const parts = titleStr.split(' vs ');
                return parts.map((part, i) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < parts.length - 1 && <span className="mx-1 text-cyan-400 font-black italic">vs</span>}
                  </React.Fragment>
                ));
              })()}
            </span>
          </div>

          <div className="grid grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-3">
            <TeamMark code={teamCode(match?.homeTeam.shortName || match?.homeTeam.name)} active={battingTeam?.id === match?.homeTeam.id} team={match?.homeTeam} isSimulator={isSim} />
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
            <TeamMark code={teamCode(match?.awayTeam.shortName || match?.awayTeam.name)} active={battingTeam?.id === match?.awayTeam.id} team={match?.awayTeam} isSimulator={isSim} />
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
            <span className={cn(
              "inline-flex items-center gap-1 rounded border px-2 py-1 text-[9px] font-black uppercase tracking-wider",
              matrix.showLiveBadge
                ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                : "border-slate-400/20 bg-slate-400/8 text-slate-400"
            )}>
              {matrix.showLiveBadge && (
                <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              )}
              {matrix.showLiveBadge ? "Live" : match?.status === "UPCOMING" ? "Upcoming" : "Live"}
            </span>
          </div>

          <div className="grid gap-2">
            <FieldBlock icon={<Swords className="size-4" />} title="Batting now" tone="cyan">
              {matrix.showWaiting ? (
                <MissingPlayerFeed hint={matrix.waitingHint} />
              ) : (
                <>
                  <BatterRow
                    player={matrix.liveContext!.striker}
                    striker
                    strikeRate={matrix.strikerStrikeRate}
                  />
                  <BatterRow
                    player={matrix.liveContext!.nonStriker}
                    strikeRate={matrix.nonStrikerStrikeRate}
                  />
                  <MetricRow
                    label="Partnership"
                    value={`${matrix.liveContext!.partnership.runs} (${matrix.liveContext!.partnership.balls})`}
                    mono
                  />
                </>
              )}
            </FieldBlock>

            <FieldBlock icon={<Activity className="size-4" />} title="Bowling now">
              {matrix.showWaiting ? (
                <MissingPlayerFeed hint={matrix.waitingHint} />
              ) : (
                <>
                  <MetricRow label="Bowler" value={matrix.liveContext!.bowler.name} strong />
                  <MetricRow label="Figures" value={matrix.bowlerFigures} mono />
                  <div className="flex items-center justify-between gap-3 py-1.5">
                    <span className="text-[10px] text-slate-400">This over</span>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      {isCriclive ? (
                        matrix.thisOver.map((ball, index) => (
                          <span
                            key={`${stableMatch?.id}-${innings}-${overs}-over-${index}`}
                            className={cn(
                              "flex size-4 items-center justify-center rounded-full border font-data-tabular text-[7px] font-black",
                              overBallChipClassName(overBallVariant(ball))
                            )}
                          >
                            {overBallLabel(ball)}
                          </span>
                        ))
                      ) : (
                        balls.map((ball, index) => (
                          <span
                            key={`${stableMatch?.id}-${innings}-${overs}-${index}-mini`}
                            className={cn(
                              "flex size-4 items-center justify-center rounded-full border font-data-tabular text-[7px] font-black",
                              ballClassName(ball.kind)
                            )}
                          >
                            {ball.label}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <MetricRow label="Economy" value={matrix.bowlerEconomy} mono />
                </>
              )}
            </FieldBlock>
          </div>
        </section>

        <section className="p-3">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-200">
            <Gauge className="size-3.5 text-cyan-400" aria-hidden />
            Match pulse
          </div>
          <div className="overflow-hidden rounded-[6px] border border-cyan-100/10 bg-[#050d1d]">
            <PulseRow label="Last wicket" value={matrix.matchPulse.lastWicket} />
            <PulseRow label="Momentum" value={matrix.matchPulse.momentum} tone={matrix.matchPulse.momentumTone} />
            <PulseRow label="Market volatility" value={matrix.matchPulse.marketVolatility} tone={matrix.matchPulse.volatilityTone} />
            <PulseRow label="Pressure" value={matrix.matchPulse.pressure} tone={matrix.matchPulse.pressureTone} />
          </div>
        </section>
      </div>
    </aside>
  );
}

function TeamMark({ active, code, team, isSimulator }: { active: boolean; code: string; team?: Team; isSimulator?: boolean }) {
  const [imgError, setImgError] = React.useState(false);
  const showLogo = Boolean(team?.logoUrl) && !imgError && !isSimulator;

  return (
    <div className="text-center">
      <div
        className={cn(
          "mx-auto flex w-12 h-8 items-center justify-center rounded-[6px] border font-data-tabular text-[11px] font-black tracking-tight overflow-hidden transition-all",
          active 
            ? "border-cyan-300/40 text-cyan-200 bg-cyan-950/60 shadow-[0_0_20px_rgba(34,211,238,0.15)]" 
            : "border-white/10 text-slate-300 bg-[#071326]"
        )}
      >
        {showLogo ? (
          <img 
            src={team?.logoUrl} 
            alt={code} 
            className="h-full w-full object-cover" 
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full bg-gradient-to-br from-cyan-900/40 via-blue-900/30 to-slate-900 text-cyan-200 font-extrabold text-[11px] tracking-wider">
            {code}
          </span>
        )}
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

function BatterRow({
  player,
  striker = false,
  strikeRate,
}: {
  player: BatterStats;
  striker?: boolean;
  strikeRate: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 py-1.5 text-[10px]">
      <span className="truncate font-semibold text-slate-200">
        {player.name}
        {striker ? (
          <span className="ml-1 text-[9px] font-bold uppercase tracking-wide text-cyan-300/80">(Striker)</span>
        ) : null}
      </span>
      <span className="font-data-tabular font-bold text-slate-100">
        {player.runs} ({player.balls})
      </span>
      <span className="w-12 text-right font-data-tabular text-[9px] text-slate-500">SR {strikeRate}</span>
    </div>
  );
}

function MissingPlayerFeed({ hint }: { hint?: string }) {
  return (
    <div className="flex h-[82px] flex-col items-center justify-center gap-1.5 py-2">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Syncing line-up
      </div>
      {hint ? <div className="text-[9px] font-medium text-slate-500">{hint}</div> : null}
      <div className="flex gap-2">
        <div className="h-1 w-8 rounded-full bg-slate-700/50" />
        <div className="h-1 w-12 rounded-full bg-slate-700/50" />
        <div className="h-1 w-6 rounded-full bg-slate-700/50" />
      </div>
    </div>
  );
}

function PulseRow({ label, tone = "muted", value }: { label: string; tone?: PulseTone; value: string }) {
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

function ordinal(value: number) {
  if (value === 1) return "1st";
  if (value === 2) return "2nd";
  if (value === 3) return "3rd";
  return `${value}th`;
}
