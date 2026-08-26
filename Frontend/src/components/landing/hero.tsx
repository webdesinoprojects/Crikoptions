"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CircleDollarSign, RadioTower, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"

function HeroStrategyBoard() {
  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-lg border border-cyan-200/15 bg-[#050b15]/94 shadow-[0_36px_120px_rgba(0,0,0,0.56)] backdrop-blur-xl">
      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#081322] px-4 py-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <span>CricOptions</span>
            <span className="rounded border border-emerald-300/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase text-emerald-300">
              CricCoins Trading Terminal
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Live Cricket Options Terminal</p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="rounded border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 text-xs font-black text-amber-200">
            ₵5,000
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-200">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Match
          </span>
        </div>
      </div>

      {/* Header Banner Image (Upper Image) */}
      <div className="relative h-40 overflow-hidden border-b border-white/10 sm:h-52 lg:h-56">
        <Image
          src="/cricoptions-hero-trading.png"
          alt="CricOptions matchday trading workspace"
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover object-[56%_42%]"
        />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,21,0.92)_0%,rgba(5,11,21,0.5)_42%,rgba(5,11,21,0.18)_100%)]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050b15] to-transparent" />
        <div className="absolute left-4 top-4 max-w-[240px] rounded-md border border-white/10 bg-[#071120]/85 p-3 shadow-[0_18px_44px_rgba(0,0,0,0.35)] backdrop-blur-md sm:left-5 sm:top-5">
          <p className="text-[10px] font-black uppercase tracking-wide text-cyan-300">
            Matchday Terminal
          </p>
          <p className="mt-1 text-sm font-black leading-5 text-white">
            Live option chains, order book, and instant execution.
          </p>
        </div>
      </div>

      {/* Main Terminal Screenshot (Below Upper Image) */}
      <div className="relative w-full overflow-hidden bg-slate-950">
        <img
          src="/cricoptions_terminal_preview.png"
          alt="CricOptions real-time match depth terminal and order ticket dashboard preview"
          className="w-full h-auto object-cover select-none"
        />
        {/* Soft shadow gradients to blend the image edges */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none" />
      </div>
    </div>
  )
}

const proofPoints = [
  { icon: RadioTower, label: "Live match moments", isSymbol: false },
  { symbol: "₵", label: "CricCoins only", isSymbol: true },
]

export function HeroSection() {
  return (
    <section className="relative min-h-[94dvh] overflow-hidden bg-[#020711] px-4 pb-16 pt-24 text-white sm:px-6 lg:px-8 lg:pt-28">
      <Image
        src="/Backgroun_land.png"
        alt=""
        fill
        priority
        aria-hidden
        sizes="100vw"
        className="z-0 object-cover object-center"
      />

      <div aria-hidden className="absolute inset-0 z-[1]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,7,17,0.98)_0%,rgba(2,7,17,0.88)_36%,rgba(2,7,17,0.44)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,7,17,0.78)_0%,rgba(2,7,17,0.18)_42%,rgba(2,7,17,0.95)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(94dvh-7rem)] max-w-[1500px] items-center gap-10 lg:grid-cols-[0.82fr_1.18fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 text-xs font-black uppercase text-cyan-200">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            CricOptions Matchday Game
          </p>

          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.98] tracking-normal text-white sm:text-6xl lg:text-7xl">
            Dopamine delivered ball by ball.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Use CricCoins to back cricket outcomes, shape your match score,
            and compete in a live strategy game inspired by options thinking.
            No real money. Just cricket, skill, and timing.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-3 rounded-lg bg-cyan-300 px-6 py-3.5 text-sm font-black text-slate-950 shadow-[0_18px_44px_rgba(34,211,238,0.24)] transition hover:bg-cyan-200 active:translate-y-px"
            >
              Start with CricCoins
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link
              href="/trading"
              className="inline-flex items-center justify-center rounded-lg border border-white/12 bg-white/[0.035] px-6 py-3.5 text-sm font-bold text-slate-200 transition hover:border-cyan-300/35 hover:text-white"
            >
              Launch Terminal
            </Link>
          </div>

          <div className="mt-9 grid max-w-md gap-3 sm:grid-cols-2">
            {proofPoints.map(({ icon: Icon, symbol, label, isSymbol }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-amber-300/20 bg-amber-300/10 text-amber-300 font-mono text-base font-black shadow-[0_0_12px_rgba(252,211,77,0.15)]">
                  {isSymbol ? (
                    <span>{symbol}</span>
                  ) : Icon ? (
                    <Icon className="size-4 text-cyan-300" aria-hidden="true" />
                  ) : null}
                </span>
                <span className="text-sm font-semibold leading-5 text-slate-300">{label}</span>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-xl text-xs leading-5 text-slate-500">
            CricOptions uses CricCoins for entertainment, education, and
            strategy practice. No cash deposits, withdrawals, or wagering.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="relative"
        >
          <HeroStrategyBoard />
        </motion.div>
      </div>

      <div aria-hidden className="absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-[#020617] to-transparent" />
    </section>
  )
}
