"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BarChart3, Crosshair, ShieldCheck, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

const featureSignals = [
  {
    icon: BarChart3,
    title: "Real-time odds",
    body: "Live, non-delayed market data",
  },
  {
    icon: Crosshair,
    title: "Ball-by-ball",
    body: "Granular markets on every delivery",
  },
  {
    icon: ShieldCheck,
    title: "Risk engine",
    body: "Portfolio protection built in",
  },
]

const stats = [
  { label: "Active traders", value: "18,842", color: "#16e6a7" },
  { label: "Markets live", value: "2,341", color: "#0ea5e9" },
  { label: "24h volume", value: "$7.48M", color: "#ffd700" },
]

const orderRows = [
  ["2.28", "$12,340", "2.30", "$8,910"],
  ["2.26", "$9,120", "2.32", "$7,230"],
  ["2.24", "$15,670", "2.34", "$11,230"],
  ["2.22", "$10,980", "2.36", "$9,880"],
  ["2.20", "$8,770", "2.38", "$12,450"],
]

function Sparkline({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 72 28" className="h-7 w-16" aria-hidden>
      <path
        d="M2 22 L12 21 L19 13 L27 18 L36 8 L45 14 L55 10 L70 4"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 22 L12 21 L19 13 L27 18 L36 8 L45 14 L55 10 L70 4"
        fill="none"
        stroke={color}
        strokeOpacity="0.2"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MiniCandleChart() {
  const bars = [26, 34, 22, 42, 31, 48, 38, 54, 45, 62, 50, 67, 58, 71, 64, 78, 61, 70]

  return (
    <div className="relative h-44 overflow-hidden rounded-xl bg-[#050a14] p-4">
      <div
        aria-hidden
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(56,189,248,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.14) 1px, transparent 1px)",
          backgroundSize: "38px 34px",
        }}
      />
      <div className="relative flex h-full items-end gap-2">
        {bars.map((height, index) => {
          const positive = index % 4 !== 2
          return (
            <span
              key={index}
              className={positive ? "bg-emerald-400" : "bg-red-400"}
              style={{
                height: `${height}%`,
                width: "8px",
                boxShadow: positive
                  ? "0 0 16px rgba(52,211,153,0.25)"
                  : "0 0 16px rgba(248,113,113,0.24)",
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

function OrderBookPanel() {
  return (
    <div className="rounded-2xl border border-sky-300/12 bg-[#071020]/92 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-normal text-slate-100">
        <span>Order book</span>
        <span className="font-semibold text-slate-400">Lay</span>
      </div>
      <div className="space-y-1.5">
        {orderRows.map(([back, backSize, lay, laySize]) => (
          <div key={`${back}-${lay}`} className="grid grid-cols-4 items-center gap-2 text-[11px]">
            <span className="rounded bg-sky-400/22 px-2 py-1 font-black text-sky-200">
              {back}
            </span>
            <span className="text-right text-sky-300/75">{backSize}</span>
            <span className="rounded bg-red-400/18 px-2 py-1 font-black text-red-200">
              {lay}
            </span>
            <span className="text-right text-slate-400">{laySize}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-end gap-1">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={index}
            className="w-1 rounded-t bg-sky-400"
            style={{ height: `${6 + index * 2}px`, opacity: 0.28 + index * 0.035 }}
          />
        ))}
      </div>
    </div>
  )
}

function MatchPanel() {
  return (
    <div className="rounded-2xl border border-sky-300/14 bg-[#071020]/92 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-normal text-emerald-300">
        <span className="size-1.5 rounded-full bg-emerald-400" />
        Live match
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-white text-sm font-black text-slate-950">
              IND
            </span>
            <span className="text-base font-black text-white">IND</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white">186/4</div>
            <div className="text-[11px] text-slate-400">(19.2 overs)</div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-emerald-400 text-sm font-black text-slate-950">
              AUS
            </span>
            <span className="text-base font-black text-white">AUS</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white">208</div>
            <div className="text-[11px] text-slate-400">(50 overs)</div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold text-sky-300">IND needs 23 runs in 30 balls</p>
    </div>
  )
}

function OrderTicket() {
  return (
    <div className="rounded-2xl border border-sky-300/12 bg-[#071020]/95 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl">
      <div className="mb-4 grid grid-cols-2 rounded-lg bg-white/4 p-1 text-center text-xs font-black">
        <span className="rounded-md bg-sky-400/18 py-2 text-sky-200">Back</span>
        <span className="py-2 text-slate-400">Lay</span>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-slate-400">Odds</p>
          <p className="text-2xl font-black text-white">2.28</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Stake (USD)</p>
          <p className="text-2xl font-black text-white">1,000</p>
        </div>
        <button
          type="button"
          className="w-full rounded-xl bg-sky-400 px-4 py-3 text-sm font-black text-slate-950 shadow-[0_16px_36px_rgba(14,165,233,0.25)]"
        >
          Place Back
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm font-semibold">
        <span className="text-sky-300">Est. Payout</span>
        <span className="text-sky-200">$2,280.00</span>
      </div>
    </div>
  )
}

export const HeroSection = () => {
  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden bg-[#020711] px-4 pb-20 pt-28 text-white sm:px-6 lg:px-8 lg:pb-10 lg:pt-28">
      <Image
        src="/Backgroun_land.png"
        alt=""
        fill
        priority
        aria-hidden
        sizes="100vw"
        className="z-0 object-cover object-center"
      />

      <div aria-hidden className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,7,17,0.96)_0%,rgba(2,7,17,0.82)_34%,rgba(2,7,17,0.36)_68%,rgba(2,7,17,0.58)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,7,17,0.88)_0%,rgba(2,7,17,0.18)_36%,rgba(2,7,17,0.34)_70%,rgba(2,7,17,0.92)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-8rem)] w-full max-w-[1500px] items-center gap-10 lg:min-h-[calc(100dvh-10rem)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:gap-14">
        <motion.div
          className="relative z-20 max-w-[620px] pt-4 lg:pt-0"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        >
          <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] p-1 text-sm font-bold text-slate-300 shadow-[0_14px_42px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-normal text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Live markets
            </span>
            <span className="pr-3 text-xs sm:text-sm">IND vs AUS - 2nd ODI</span>
          </div>

          <h1 className="landing-reveal max-w-[620px] text-[3.25rem] font-black leading-[0.98] tracking-normal text-white drop-shadow-2xl sm:text-[4rem] lg:text-[4.05rem] xl:text-[4.35rem]">
            Trade cricket
            <br />
            options{" "}
            <span className="bg-linear-to-r from-sky-300 via-cyan-300 to-[#ffe45c] bg-clip-text text-transparent">
              with
              <br />
              terminal control
            </span>
          </h1>

          <p className="landing-reveal landing-reveal-delay-1 mt-6 max-w-[540px] text-base leading-7 text-slate-300 sm:text-lg">
            Live odds, ball data, and portfolio risk - all in one execution
            workspace.
          </p>

          <div className="landing-reveal landing-reveal-delay-2 mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-3 rounded-xl bg-sky-400 px-7 py-4 text-base font-black text-slate-950 shadow-[0_20px_46px_rgba(14,165,233,0.28)] transition hover:bg-sky-300 active:translate-y-px"
            >
              Start trading
              <span className="flex size-7 items-center justify-center rounded-full bg-white/18 transition-transform group-hover:translate-x-1">
                <ArrowRight className="size-4" />
              </span>
            </Link>
            <Link
              href="#terminal"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] px-7 py-4 text-base font-bold text-slate-300 transition hover:border-sky-300/35 hover:text-white"
            >
              Explore terminal
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {featureSignals.map((item) => {
              const Icon = item.icon

              return (
                <div key={item.title} className="grid grid-cols-[42px_1fr] gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full border border-sky-300/20 bg-sky-400/10 text-sky-300">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-black text-white">{item.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-400">{item.body}</span>
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label} className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-400">{item.label}</p>
                  <p className="mt-1 text-2xl font-black text-white">{item.value}</p>
                </div>
                <Sparkline color={item.color} />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="relative z-10 min-h-[620px] w-full lg:min-h-[600px]"
          initial={{ opacity: 0, x: 34 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.85, ease: "easeOut", delay: 0.12 }}
        >
          <div className="absolute left-[3%] top-[9%] hidden w-[32%] lg:block">
            <MatchPanel />
          </div>

          <div className="absolute right-[1%] top-[4%] hidden w-[31%] lg:block">
            <OrderBookPanel />
          </div>

          <div className="absolute bottom-[6%] left-[11%] hidden w-[54%] rounded-2xl border border-sky-300/12 bg-[#071020]/95 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.44)] backdrop-blur-xl lg:block">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white">IND Win</span>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-400">
                    In play
                  </span>
                </div>
                <div className="mt-2 flex items-end gap-3">
                  <span className="text-4xl font-black text-white">2.28</span>
                  <span className="pb-1 text-sm font-black text-emerald-300">+3.21%</span>
                </div>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/[0.06] text-sky-300">
                <TrendingUp className="size-5" />
              </div>
            </div>
            <MiniCandleChart />
          </div>

          <div className="absolute bottom-[6%] right-[2%] hidden w-[32%] lg:block">
            <OrderTicket />
          </div>

          <div className="absolute bottom-[-10%] left-[10%] right-[2%] hidden grid-cols-4 gap-3 lg:grid">
            {[
              ["Next ball", "55%", "Batting side"],
              ["Run rate", "9.61", "Current"],
              ["Over trend", "6 1 0 4 2", "Last five"],
              ["Partnership", "42 (28)", "Kohli & Hardik"],
            ].map(([label, value, detail]) => (
              <div
                key={label}
                className="rounded-2xl border border-sky-300/10 bg-[#071020]/88 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl"
              >
                <p className="text-sm font-medium text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-black text-white">{value}</p>
                <p className="mt-1 text-xs text-sky-300">{detail}</p>
              </div>
            ))}
          </div>

          <div className="relative mx-auto overflow-hidden rounded-2xl border border-sky-300/12 bg-[#071020]/90 p-3 shadow-[0_32px_96px_rgba(0,0,0,0.42)] backdrop-blur-xl lg:hidden">
            <Image
              src="/cricoptions-hero-trading.png"
              alt="CricOptions cricket options trading workstation"
              width={1792}
              height={1024}
              priority
              className="aspect-[16/10] w-full rounded-xl object-cover object-[55%_40%]"
            />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <MatchPanel />
              <OrderTicket />
            </div>
          </div>
        </motion.div>
      </div>

      <div aria-hidden className="absolute bottom-0 left-0 z-20 h-32 w-full bg-gradient-to-t from-[#05070b] to-transparent pointer-events-none" />
    </section>
  )
}
