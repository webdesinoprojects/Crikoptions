"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  Activity,
  BarChart3,
  BookOpenCheck,
  Brain,
  CircleDollarSign,
  FlaskConical,
  LineChart,
  RadioTower,
  ShieldCheck,
  Trophy,
  WalletCards,
  type LucideIcon,
} from "lucide-react"

import { dashboardService } from "@/features/dashboard/services/dashboard.service"
import { leaderboardApi, type LeaderboardEntry, formatRoi } from "@/features/leaderboard/leaderboard"
import { type Match } from "@/types"

gsap.registerPlugin(ScrollTrigger)

type FlowCard = {
  title: string
  body: string
  icon: LucideIcon
  visual: "balls" | "chain" | "score"
}

type ProofCard = {
  title: string
  body: string
  icon: LucideIcon
  highlights: string[]
}

const flowCards: FlowCard[] = [
  {
    title: "Read the moment",
    body: "Follow score, wickets, over state, run pace, and match pressure before you make a pick.",
    icon: RadioTower,
    visual: "balls",
  },
  {
    title: "Back your call",
    body: "Choose a cricket outcome, stake CricCoins, and see the multiplier before you confirm.",
    icon: BarChart3,
    visual: "chain",
  },
  {
    title: "Climb the board",
    body: "Watch your CricCoins score, open picks, and leaderboard progress move with the match.",
    icon: ShieldCheck,
    visual: "score",
  },
]

const proofCards: ProofCard[] = [
  {
    title: "Live match arena",
    body: "A matchday surface for score context, upcoming fixtures, challenges, and leaderboard state.",
    icon: Activity,
    highlights: ["Live score context", "Matchday challenges", "Leaderboard"],
  },
  {
    title: "Trading terminal",
    body: "Live option chains, CricCoins stake, order book depth, and result tracking share one focused screen.",
    icon: LineChart,
    highlights: ["Option chain", "Order book", "Order execution"],
  },
  {
    title: "Portfolio analysis",
    body: "Track open positions, CricCoins results, risk exposure, and your comprehensive performance metrics from one place.",
    icon: WalletCards,
    highlights: ["Open positions", "ROI tracking", "Trading history"],
  },
]

function FlowVisual({
  visual,
  match,
  leaderboard,
}: {
  visual: FlowCard["visual"]
  match: Match | null
  leaderboard: LeaderboardEntry[]
}) {
  if (visual === "balls") {
    const title = match
      ? `${match.homeTeam?.shortName || match.homeTeam?.name || "IND"} vs ${match.awayTeam?.shortName || match.awayTeam?.name || "ENG"}`
      : "IND vs ENG"
    const score = match?.homeScore || (match?.currentScore ? `${match.currentScore}/${match.wicketsLost ?? 0}` : "184/5")
    const overs = match?.currentOver ? `${match.currentOver} overs` : "19.4 overs"
    const crr = "CRR 9.35"
    const statusText = match?.status === "LIVE" ? "T20 LIVE" : "T20 LIVE"
    const targetText = match?.targetScore ? `Target: ${match.targetScore}` : "Target: 188"
    const needText = "Need 4 off 2"

    const ballsList =
      match?.thisOver && match.thisOver.length > 0
        ? match.thisOver.map((b) => ({
            ball: b.isWicket ? "W" : String(b.runs),
            bg: b.isWicket
              ? "bg-red-500/25 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
              : b.runs >= 6
              ? "bg-emerald-400/25 text-emerald-300 border-emerald-400/50 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
              : b.runs >= 4
              ? "bg-cyan-400/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]"
              : "bg-white/5 text-slate-200 border-white/10",
          }))
        : [
            { ball: "1", bg: "bg-white/5 text-slate-200 border-white/10" },
            { ball: "4", bg: "bg-cyan-400/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]" },
            { ball: "6", bg: "bg-emerald-400/25 text-emerald-300 border-emerald-400/50 shadow-[0_0_10px_rgba(52,211,153,0.3)]" },
            { ball: "W", bg: "bg-red-500/25 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]" },
            { ball: "2", bg: "bg-white/5 text-slate-200 border-white/10" },
            { ball: "4", bg: "bg-cyan-400/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.25)]" },
          ]

    return (
      <div className="space-y-3.5 rounded-lg border border-cyan-500/20 bg-[#040a16]/90 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs font-black uppercase tracking-wide text-white">{title}</span>
          </div>
          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-300">
            {statusText}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-3xl font-black tracking-tight text-white">{score}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
              {overs} • {crr}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-emerald-300">{needText}</p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">{targetText}</p>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-1.5 pt-1">
          {ballsList.map((item, index) => (
            <span
              key={`${item.ball}-${index}`}
              className={`flex aspect-square items-center justify-center rounded-md border font-mono text-xs font-black transition-transform hover:scale-105 ${item.bg}`}
            >
              {item.ball}
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (visual === "chain") {
    return (
      <div className="space-y-3.5 rounded-lg border border-cyan-500/20 bg-[#040a16]/90 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-md">
        <div className="flex items-center justify-between text-xs">
          <span className="font-black text-slate-200">Match Win Probability</span>
          <span className="font-mono text-xs font-black text-cyan-300">IND 64% vs ENG 36%</span>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10 flex p-0.5">
          <div className="h-full rounded-l-full bg-gradient-to-r from-cyan-400 to-sky-400 transition-all duration-500" style={{ width: "64%" }} />
          <div className="h-full rounded-r-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500" style={{ width: "36%" }} />
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-2.5 text-center">
            <p className="text-[10px] font-bold uppercase text-slate-400">Required Rate</p>
            <p className="mt-1 font-mono text-sm font-black text-amber-300">12.00 rpo</p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-2.5 text-center">
            <p className="text-[10px] font-bold uppercase text-slate-400">Option Call Price</p>
            <p className="mt-1 font-mono text-sm font-black text-emerald-300">₵54.00</p>
          </div>
        </div>
      </div>
    )
  }

  const defaultLeaderboard: LeaderboardEntry[] = [
    { rank: 1, name: "Trader_Pro", country: "IN", roi: 38.4, winRate: 74 },
    { rank: 2, name: "CricketKing", country: "GB", roi: 24.1, winRate: 68 },
    { rank: 3, name: "You (Demo)", country: "IN", roi: 14.2, winRate: 62 },
    { rank: 4, name: "AlphaMaster", country: "AU", roi: 9.8, winRate: 55 },
  ]

  const displayList = leaderboard.length > 0 ? leaderboard.slice(0, 4) : defaultLeaderboard

  return (
    <div className="space-y-2 rounded-lg border border-cyan-500/20 bg-[#040a16]/90 p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-black text-white">
        <span className="flex items-center gap-1.5">
          <Trophy className="size-3.5 text-amber-400" />
          Live Leaderboard
        </span>
        <span className="rounded bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] font-black text-amber-300">
          TOP TRADERS
        </span>
      </div>

      <div className="space-y-1.5 pt-1">
        {displayList.map((user, idx) => {
          const isTop3 = idx < 3
          const badgeIcon = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${user.rank}`
          const isUser = user.name.includes("You") || idx === 2

          return (
            <div
              key={`${user.name}-${idx}`}
              className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                isUser
                  ? "border border-cyan-400/40 bg-cyan-400/12 font-bold shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                  : "bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate max-w-[140px]">
                <span className="w-4 text-center font-mono text-xs text-slate-300 font-bold">{badgeIcon}</span>
                <span className={`truncate text-xs font-bold ${isUser ? "text-cyan-200" : "text-white"}`}>
                  {user.name}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs font-black text-amber-300">
                  ₵{Math.round(5000 * (1 + user.roi / 100)).toLocaleString()}
                </span>
                <span className="font-mono text-[11px] font-bold text-emerald-400">
                  {formatRoi(user.roi)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function LandingMotionSections() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [match, setMatch] = useState<Match | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    dashboardService
      .getLiveMatches()
      .then((matches) => {
        if (matches && matches.length > 0) {
          setMatch(matches[0])
        }
      })
      .catch(() => {})

    leaderboardApi
      .getLeaderboard()
      .then((data) => {
        if (data && data.length > 0) {
          setLeaderboard(data)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion || !rootRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".flow-card",
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ".flow-grid", start: "top 78%" },
        }
      )

      gsap.fromTo(
        ".proof-card",
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: { trigger: ".proof-grid", start: "top 76%" },
        }
      )
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={rootRef}>
      <section id="flow" className="relative scroll-mt-20 overflow-hidden bg-[#020617] px-4 py-24 text-slate-100 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-cyan-300">How it works</p>
              <h2 className="mt-4 max-w-2xl text-4xl font-black leading-[1.04] text-white sm:text-5xl">
                From live cricket moment to matchday score
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-slate-400 lg:justify-self-end">
              CricOptions is easiest to understand as a game loop: read the
              match, execute option orders with CricCoins, then watch your score and
              leaderboard rank respond to every over.
            </p>
          </div>

          <div className="flow-grid mt-12 grid gap-4 lg:grid-cols-3">
            {flowCards.map(({ title, body, icon: Icon, visual }) => (
              <article
                key={title}
                className="flow-card min-h-80 rounded-lg border border-white/10 bg-[#070d18] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.24)]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-cyan-300">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-xl font-black text-white">{title}</h3>
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-400">{body}</p>
                <div className="mt-8 rounded-lg border border-white/10 bg-[#030811] p-4">
                  <FlowVisual visual={visual} match={match} leaderboard={leaderboard} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="relative scroll-mt-20 bg-[#05070b] px-4 py-24 text-slate-100 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-wide text-cyan-300">The Arena</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.04] text-white sm:text-5xl">
              Engineered for split-second decisions
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-400">
              Explore the exact platform interface you will use: our real-time match center, live options trading terminal, and detailed portfolio analysis workspace.
            </p>
          </div>

          <div className="proof-grid mt-12 grid gap-4 md:grid-cols-3">
            {proofCards.map(({ title, body, icon: Icon, highlights }) => (
              <article
                key={title}
                className="proof-card rounded-lg border border-white/10 bg-[#071120] p-6 transition hover:border-cyan-300/35"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-white">{title}</h3>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">{body}</p>
                  </div>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-cyan-300">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {highlights.map((item) => (
                    <span
                      key={item}
                      className="rounded border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs font-semibold text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="simulator" className="relative scroll-mt-20 overflow-hidden bg-[#020617] px-4 py-24 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-amber-300">Simulator and safety</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.04] text-white sm:text-5xl">
              Practice before matchday pressure
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
              Test your trading strategies in a risk-free environment. Use our simulated matching engine and historical match replays to build confidence and learn option patterns with zero financial risk.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Practice mode",
                body: "Trade option contracts with CricCoins and learn how match movement changes your result.",
                icon: FlaskConical,
              },
              {
                title: "Replay mode",
                body: "Use historical ball events to replay decisions, improve timing, and compare outcomes.",
                icon: BookOpenCheck,
              },
              {
                title: "Competition layer",
                body: "Challenges, rankings, and social features make improvement visible across matchdays.",
                icon: Trophy,
              },
            ].map(({ title, body, icon: Icon }) => (
              <article key={title} className="rounded-lg border border-white/10 bg-[#071120] p-5">
                <span className="flex size-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-amber-300">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-black text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="operators" className="border-y border-white/10 bg-[#071120] px-4 py-16 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-cyan-300">Expert Utility</p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
              Advanced depth when you need it
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Options trading for live & practice matches",
              "Unified CricCoins wallet & transaction ledger",
              "Live option chains with order book depth",
              "Interactive Academy for complex strategy training",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.025] px-4 py-3 text-sm font-semibold text-slate-300">
                <span className="size-1.5 shrink-0 rounded-full bg-cyan-300" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

