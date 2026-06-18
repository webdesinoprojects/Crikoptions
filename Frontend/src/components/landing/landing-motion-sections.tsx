"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  Activity,
  BarChart3,
  RadioTower,
  ShieldCheck,
  WalletCards,
  Zap,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

type PressureCard = {
  title: string
  body: string
  icon: LucideIcon
  className: string
  visual: "signal" | "speed" | "risk" | "portfolio"
}

type WorkflowCard = {
  title: string
  body: string
  icon: LucideIcon
  visual: "over" | "market" | "exposure"
}

const pressureCards: PressureCard[] = [
  {
    title: "Live cricket context",
    body: "Ball-by-ball match state sits beside market prices, so every order starts with the latest game signal.",
    icon: RadioTower,
    className: "lg:col-span-4",
    visual: "signal",
  },
  {
    title: "Execution focus",
    body: "Bid, ask, size, and position changes stay visible while the match is moving.",
    icon: Zap,
    className: "lg:col-span-4",
    visual: "speed",
  },
  {
    title: "Risk before impulse",
    body: "Exposure and cash impact are surfaced before a trade reaches the book.",
    icon: ShieldCheck,
    className: "lg:col-span-4",
    visual: "risk",
  },
  {
    title: "Portfolio memory",
    body: "Every open contract and completed order rolls into one accountable trading history.",
    icon: WalletCards,
    className: "lg:col-span-12",
    visual: "portfolio",
  },
]

const workflowCards: WorkflowCard[] = [
  {
    title: "Read the over",
    body: "Match telemetry updates the pricing view as wickets, boundaries, and run pace change.",
    icon: RadioTower,
    visual: "over",
  },
  {
    title: "Price the outcome",
    body: "Options markets show bid, ask, depth, and movement in a compact board built for fast comparison.",
    icon: BarChart3,
    visual: "market",
  },
  {
    title: "Control exposure",
    body: "Portfolio state, margin, and open risk stay visible before and after each order.",
    icon: Activity,
    visual: "exposure",
  },
]

function SignalVisual() {
  return (
    <div className="relative mx-auto mt-4 flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-slate-950 shadow-[0_0_60px_rgba(14,165,233,0.18)]">
      <div className="absolute inset-3 rounded-full border border-white/8" />
      <div className="absolute h-14 w-14 rounded-full border-4 border-slate-600" />
      <div className="absolute h-9 w-9 rounded-full border-4 border-sky-300" />
      <div className="absolute h-1 w-20 rounded-full bg-slate-100" />
      <div className="absolute h-4 w-4 rounded-full bg-slate-100" />
    </div>
  )
}

function SpeedVisual() {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Execution</span>
        <span>14.34 ms</span>
      </div>
      <svg className="mt-5 h-20 w-full" viewBox="0 0 260 80" fill="none" aria-hidden="true">
        <path
          d="M4 63C22 26 48 38 68 34C82 32 83 10 93 20C101 28 93 43 111 37C129 31 143 42 154 39C169 35 172 12 184 22C195 31 196 48 207 30C218 11 225 26 232 18C240 9 250 22 256 25"
          stroke="#e2e8f0"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

function RiskVisual() {
  return (
    <div className="mt-6 grid grid-cols-3 gap-2">
      {["Cash", "Margin", "PnL", "Orders", "Hedge", "Limit"].map((item, index) => (
        <div
          key={item}
          className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-3 text-center"
        >
          <div className="mx-auto mb-2 h-1.5 rounded-full bg-sky-300" style={{ width: `${42 + index * 8}%` }} />
          <span className="text-[11px] font-semibold text-slate-500">{item}</span>
        </div>
      ))}
    </div>
  )
}

function PortfolioVisual() {
  return (
    <div className="relative mt-7 h-44 overflow-hidden rounded-lg border border-white/10 bg-slate-950">
      <div className="absolute left-5 top-5 flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-slate-700" />
        <span className="h-2 w-2 rounded-full bg-slate-700" />
        <span className="h-2 w-2 rounded-full bg-slate-700" />
      </div>
      <svg className="absolute bottom-0 right-0 h-40 w-[72%]" viewBox="0 0 420 190" fill="none" aria-hidden="true">
        <path
          d="M5 150C24 116 39 132 57 80C77 24 88 96 110 91C138 84 154 137 184 123C211 110 216 72 237 95C258 118 270 45 288 63C305 81 314 50 331 69C353 94 356 10 372 36C387 62 395 28 414 18"
          stroke="#e2e8f0"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M5 150C24 116 39 132 57 80C77 24 88 96 110 91C138 84 154 137 184 123C211 110 216 72 237 95C258 118 270 45 288 63C305 81 314 50 331 69C353 94 356 10 372 36C387 62 395 28 414 18V190H5V150Z"
          fill="url(#portfolioFade)"
        />
        <defs>
          <linearGradient id="portfolioFade" x1="210" x2="210" y1="18" y2="190" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0ea5e9" stopOpacity="0.18" />
            <stop offset="1" stopColor="#0ea5e9" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute left-6 top-20 max-w-52.5">
        <p className="text-2xl font-black text-slate-50">Portfolio memory</p>
        <p className="mt-2 text-sm leading-5 text-slate-500">
          Open, closed, and hedged positions stay tied to the match timeline.
        </p>
      </div>
    </div>
  )
}

function PressureVisual({ visual }: { visual: PressureCard["visual"] }) {
  if (visual === "signal") return <SignalVisual />
  if (visual === "speed") return <SpeedVisual />
  if (visual === "risk") return <RiskVisual />
  return <PortfolioVisual />
}

function WorkflowVisual({ visual }: { visual: WorkflowCard["visual"] }) {
  if (visual === "over") {
    return (
      <div className="grid grid-cols-6 gap-2 opacity-80">
        {["0", "4", "1", "W", "6", "2"].map((ball) => (
          <span key={ball} className="flex aspect-square items-center justify-center rounded-full border border-white/15 bg-white/4 font-mono text-sm text-slate-200">
            {ball}
          </span>
        ))}
      </div>
    )
  }

  if (visual === "market") {
    return (
      <div className="space-y-3">
        {[74, 52, 86, 38].map((width, index) => (
          <div key={width} className="flex items-center gap-3">
            <span className="w-12 font-mono text-xs text-slate-500">L{index + 1}</span>
            <span className="h-3 rounded-full bg-sky-400/60" style={{ width: `${width}%` }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {["Cash", "Limit", "Open", "Hedge"].map((item) => (
        <div key={item} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <span className="text-xs text-slate-500">{item}</span>
          <div className="mt-2 h-1.5 rounded-full bg-sky-400/70" />
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
        ".pressure-card",
        { y: 44, opacity: 0, scale: 0.94 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: ".pressure-grid",
            start: "top 78%",
          },
        }
      )

      gsap.fromTo(
        ".workflow-card",
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: ".workflow-rail",
            start: "top 76%",
          },
        }
      )
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={rootRef}>
      <section id="features" className="relative overflow-hidden bg-[#020617] px-4 py-28 text-slate-100 sm:px-6 md:py-36 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-24 h-80 w-208 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-5xl">
            <h2 className="text-4xl font-black leading-[1.02] text-slate-50 sm:text-5xl lg:text-6xl">
              Built for live decision pressure
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              CricOptions turns match movement, market depth, and portfolio risk
              into a focused workstation for cricket derivatives.
            </p>
          </div>

          <div className="pressure-grid mt-12 grid grid-flow-dense grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
            {pressureCards.map(({ title, body, icon: Icon, className, visual }) => (
              <article
                key={title}
                className={`pressure-card group min-h-80 overflow-hidden rounded-xl border border-white/10 bg-[#07090f] p-7 shadow-[0_22px_70px_rgba(0,0,0,0.28)] transition-transform duration-700 hover:-translate-y-1 hover:border-sky-300/45 ${className}`}
              >
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-sky-300">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <PressureVisual visual={visual} />
                  </div>
                  <div className={visual === "portfolio" ? "mt-7 max-w-xl" : "mt-8 text-center"}>
                    <h3 className="text-2xl font-black tracking-normal text-slate-50">
                      {title}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-slate-400">
                      {body}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#05070b] px-4 py-24 text-slate-100 sm:px-6 md:py-32 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
        <div className="pointer-events-none absolute -right-72 top-10 h-136 w-136 rounded-full bg-sky-500/8 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="lg:sticky lg:top-28 lg:h-fit lg:py-2">
            <div>
              <h2 className="max-w-2xl text-4xl font-black leading-[1.04] text-white sm:text-5xl">
                From match signal to managed exposure
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
                The product journey is simple: read the game, compare the market,
                then act with risk visible.
              </p>
              <div className="mt-8 hidden max-w-md rounded-2xl border border-white/10 bg-white/2.5 p-4 lg:block">
                {workflowCards.map((card) => (
                  <div key={card.title} className="flex gap-3 border-b border-white/8 py-3 first:pt-0 last:border-b-0 last:pb-0">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sky-300 shadow-[0_0_16px_rgba(14,165,233,0.65)]" />
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{card.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{card.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="workflow-rail space-y-4">
            {workflowCards.map(({ title, body, icon: Icon, visual }) => (
              <article
                key={title}
                className="workflow-card group relative overflow-hidden rounded-2xl border border-white/10 bg-[#07090f]/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] transition-colors duration-500 hover:border-sky-300/45 sm:p-6"
              >
                <div className="grid gap-5 sm:grid-cols-[1fr_240px] sm:items-center lg:grid-cols-[1fr_270px]">
                  <div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-sky-300">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-semibold">{title}</span>
                    </div>
                    <h3 className="mt-7 max-w-xl text-2xl font-black leading-[1.12] text-white sm:text-3xl">
                      {title}
                    </h3>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                      {body}
                    </p>
                  </div>
                  <div className="workflow-visual rounded-xl border border-white/10 bg-slate-950/70 p-4">
                    <WorkflowVisual visual={visual} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
