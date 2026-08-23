"use client"

import { useEffect, useRef } from "react"
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
    title: "Score room",
    body: "Track open positions, CricCoins results, challenge score, and your matchday history from one place.",
    icon: WalletCards,
    highlights: ["Open positions", "CricCoins score", "Match history"],
  },
  {
    title: "Match intelligence",
    body: "Momentum, outcome distribution, scenarios, and event impact panels help explain match movement.",
    icon: Brain,
    highlights: ["Momentum hub", "Scenario lab", "Pattern archive"],
  },
]

function FlowVisual({ visual }: { visual: FlowCard["visual"] }) {
  if (visual === "balls") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black text-white">IND vs ENG</span>
          </div>
          <span className="rounded bg-cyan-400/15 px-2 py-0.5 text-[10px] font-bold text-cyan-300">T20 LIVE</span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-2xl font-black text-white">184/5</p>
            <p className="text-[11px] text-slate-400">19.4 overs • CRR 9.35</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-emerald-300">Need 4 off 2</p>
            <p className="text-[10px] text-slate-400">Target: 188</p>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-1.5 pt-1">
          {[
            { ball: "1", bg: "bg-white/5 text-slate-200" },
            { ball: "4", bg: "bg-cyan-400/20 text-cyan-300 border-cyan-400/40" },
            { ball: "6", bg: "bg-emerald-400/25 text-emerald-300 border-emerald-400/50" },
            { ball: "W", bg: "bg-red-400/25 text-red-300 border-red-400/50" },
            { ball: "2", bg: "bg-white/5 text-slate-200" },
            { ball: "4", bg: "bg-cyan-400/20 text-cyan-300 border-cyan-400/40" },
          ].map((item, index) => (
            <span
              key={`${item.ball}-${index}`}
              className={`flex aspect-square items-center justify-center rounded border font-mono text-xs font-black ${item.bg}`}
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
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300">Match Win Probability</span>
          <span className="font-mono text-cyan-300 font-bold">IND 64% vs ENG 36%</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 flex">
          <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: "64%" }} />
          <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: "36%" }} />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="rounded border border-white/10 bg-white/[0.03] p-2 text-center">
            <p className="text-[10px] text-slate-400">Required Rate</p>
            <p className="font-mono text-sm font-black text-amber-300">12.00 rpo</p>
          </div>
          <div className="rounded border border-white/10 bg-white/[0.03] p-2 text-center">
            <p className="text-[10px] text-slate-400">Option Call Price</p>
            <p className="font-mono text-sm font-black text-emerald-300">₵54.00</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 text-xs font-bold text-slate-300">
        <span>Leaderboard</span>
        <span className="text-[10px] font-mono text-amber-300">TOP TRADERS</span>
      </div>

      {[
        { rank: "#1", name: "Trader_Pro", score: "₵482.5k", pnl: "+38.4%", badge: "🥇", isUser: false },
        { rank: "#2", name: "CricketKing", score: "₵310.2k", pnl: "+24.1%", badge: "🥈", isUser: false },
        { rank: "#3", name: "You (Demo)", score: "₵125.0k", pnl: "+14.2%", badge: "🥉", isUser: true },
        { rank: "#4", name: "AlphaMaster", score: "₵98.4k", pnl: "+9.8%", badge: "4", isUser: false },
      ].map((user) => (
        <div
          key={user.name}
          className={`flex items-center justify-between rounded px-2.5 py-1.5 text-xs ${
            user.isUser
              ? "border border-cyan-400/30 bg-cyan-400/10 font-bold"
              : "bg-white/[0.025]"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-5 text-center font-mono text-slate-400">{user.rank}</span>
            <span className={user.isUser ? "text-cyan-200" : "text-white"}>{user.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-amber-300 font-bold">{user.score}</span>
            <span className="font-mono text-[11px] text-emerald-300">{user.pnl}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function LandingMotionSections() {
  const rootRef = useRef<HTMLDivElement>(null)

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
                  <FlowVisual visual={visual} />
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
            <p className="text-xs font-black uppercase tracking-wide text-cyan-300">Product proof</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.04] text-white sm:text-5xl">
              Built from real platform surfaces
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-400">
              The page should show what users actually get after signing in:
              match arena, strategy board, CricCoins score, simulator, and
              intelligence tools.
            </p>
          </div>

          <div className="proof-grid mt-12 grid gap-4 md:grid-cols-2">
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
              CricOptions is a CricCoins cricket strategy game for learning,
              competition, and option-style thinking. The safety message should
              be visible before the footer disclaimer.
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
            <p className="text-xs font-black uppercase tracking-wide text-cyan-300">For strategy players</p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
              Depth is there when users are ready
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Live and replay match data",
              "CricCoins wallet and ledger",
              "Live option chains with order book depth",
              "Admin controls for game operations",
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
