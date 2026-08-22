"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CircleDollarSign, RadioTower, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"

const predictionRows = [
  { pick: "Chase over 165", cost: "1.50", trend: "Rising", signal: "Strong" },
  { pick: "Next over 8+", cost: "1.28", trend: "Hot", signal: "Medium" },
  { pick: "Batter 50", cost: "1.74", trend: "Steady", signal: "Open" },
  { pick: "Late surge", cost: "2.10", trend: "Volatile", signal: "Bold" },
]

const orderRows = [
  ["1.50", "710", "1.56", "520"],
  ["1.46", "620", "1.60", "480"],
  ["1.42", "390", "1.64", "610"],
  ["1.38", "440", "1.68", "700"],
]

function HeroStrategyBoard() {
  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-lg border border-cyan-200/15 bg-[#050b15]/94 shadow-[0_36px_120px_rgba(0,0,0,0.56)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#081322] px-4 py-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <span>CricOptions</span>
            <span className="rounded border border-emerald-300/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase text-emerald-300">
              CricCoins only
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">Live match strategy board</p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="rounded border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 text-xs font-black text-amber-200">
            ₵125,000
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-200">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Live Match
          </span>
        </div>
      </div>

      <div className="relative h-40 overflow-hidden border-b border-white/10 sm:h-52 lg:h-56">
        <Image
          src="/cricoptions-hero-trading.png"
          alt="CricOptions matchday strategy workspace"
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover object-[56%_42%]"
        />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,11,21,0.92)_0%,rgba(5,11,21,0.5)_42%,rgba(5,11,21,0.18)_100%)]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#050b15] to-transparent" />
        <div className="absolute left-4 top-4 max-w-[220px] rounded-md border border-white/10 bg-[#071120]/78 p-3 shadow-[0_18px_44px_rgba(0,0,0,0.35)] backdrop-blur-md sm:left-5 sm:top-5">
          <p className="text-[10px] font-black uppercase tracking-wide text-amber-300">
            Matchday view
          </p>
          <p className="mt-1 text-sm font-black leading-5 text-white">
            Cricket, picks, and CricCoins in one live game surface.
          </p>
        </div>
      </div>

      <div className="grid gap-px bg-white/10 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="bg-[#050b15] p-4">
          <div className="rounded-md border border-white/10 bg-[#081423] p-4">
            <div className="grid grid-cols-3 items-end gap-3">
              <div>
                <p className="text-[10px] font-black uppercase text-cyan-300">Batting</p>
                <p className="mt-1 text-3xl font-black text-white">162/4</p>
                <p className="text-xs text-slate-400">18.2 overs</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-400">Need 47 from 34</p>
                <div className="mt-3 grid grid-cols-6 gap-1">
                  {["1", "4", "1", "6", "W", "0"].map((ball, index) => (
                    <span
                      key={`${ball}-${index}`}
                      className="flex aspect-square items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-black text-slate-100"
                    >
                      {ball}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-amber-300">Target</p>
                <p className="mt-1 text-3xl font-black text-white">209</p>
                <p className="text-xs text-slate-400">ODI chase</p>
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-md border border-white/10">
              <div className="border-b border-white/10 bg-[#0a1829] px-3 py-2 text-xs font-black text-white">
                Prediction Board
              </div>
              <table className="w-full text-sm">
                <thead className="bg-[#071120] text-[10px] uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Pick</th>
                    <th className="px-3 py-2 text-right">Cost</th>
                    <th className="px-3 py-2 text-right">Trend</th>
                    <th className="px-3 py-2 text-right">Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {predictionRows.map((row) => (
                    <tr key={row.pick} className="border-t border-white/6 odd:bg-white/[0.025]">
                      <td className="px-3 py-2 font-black text-white">{row.pick}</td>
                      <td className="px-3 py-2 text-right font-mono text-amber-300">{row.cost}</td>
                      <td className="px-3 py-2 text-right text-xs text-emerald-300">{row.trend}</td>
                      <td className="px-3 py-2 text-right text-xs text-cyan-200">{row.signal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-md border border-white/10 bg-[#071120] p-3">
              <div className="grid grid-cols-2 rounded-md bg-white/[0.04] p-1 text-center text-xs font-black">
                <span className="rounded bg-emerald-400/18 py-2 text-emerald-200">Back</span>
                <span className="py-2 text-slate-400">Skip</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Pick</p>
                  <p className="mt-1 font-black text-white">Chase 165+</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Multiplier</p>
                  <p className="mt-1 font-mono font-black text-white">1.50</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Stake</p>
                  <p className="mt-1 font-mono font-black text-white">100</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">CricCoins</p>
                  <p className="mt-1 font-mono font-black text-amber-300">₵125,000</p>
                </div>
              </div>
              <div className="mt-4 rounded-md border border-amber-300/15 bg-amber-300/8 px-3 py-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Pick cost</span>
                  <span className="font-mono font-black text-amber-200">₵150</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Balance after</span>
                  <span className="font-mono font-black text-slate-100">₵124,850</span>
                </div>
              </div>
              <button
                type="button"
                className="mt-4 w-full rounded-md bg-emerald-400 px-4 py-3 text-sm font-black text-slate-950"
              >
                Preview pick
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-white/10">
          <div className="bg-[#071120] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-white">Match Pulse</p>
              <p className="text-xs text-slate-500">How the crowd is leaning</p>
            </div>
            <div className="mt-3 space-y-2">
              {orderRows.map(([bid, bidSize, ask, askSize]) => (
                <div key={`${bid}-${ask}`} className="grid grid-cols-4 gap-2 text-xs">
                  <span className="rounded bg-emerald-400/12 px-2 py-1 font-mono text-emerald-300">{bid}</span>
                  <span className="text-right text-slate-400">{bidSize}</span>
                  <span className="rounded bg-red-400/12 px-2 py-1 font-mono text-red-300">{ask}</span>
                  <span className="text-right text-slate-400">{askSize}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#071120] p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-black text-white">Match Score</p>
                <p className="mt-1 text-xs text-slate-500">Your CricCoins result updates live</p>
              </div>
              <p className="font-mono text-lg font-black text-emerald-300">+3,860</p>
            </div>
            <svg viewBox="0 0 320 112" className="mt-3 h-28 w-full" aria-hidden="true">
              <path
                d="M6 88 C32 74 44 83 64 61 C82 41 100 69 123 46 C144 23 163 50 188 32 C212 15 225 34 244 24 C268 11 286 18 314 8"
                fill="none"
                stroke="#34d399"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M6 88 C32 74 44 83 64 61 C82 41 100 69 123 46 C144 23 163 50 188 32 C212 15 225 34 244 24 C268 11 286 18 314 8 V112 H6 Z"
                fill="url(#pnlFill)"
              />
              <defs>
                <linearGradient id="pnlFill" x1="160" x2="160" y1="8" y2="112" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#34d399" stopOpacity="0.25" />
                  <stop offset="1" stopColor="#34d399" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

const proofPoints = [
  { icon: RadioTower, label: "Live match moments" },
  { icon: CircleDollarSign, label: "CricCoins wallet" },
  { icon: ShieldCheck, label: "CricCoins only" },
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
            Every ball becomes a decision
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
              href="#terminal"
              className="inline-flex items-center justify-center rounded-lg border border-white/12 bg-white/[0.035] px-6 py-3.5 text-sm font-bold text-slate-200 transition hover:border-cyan-300/35 hover:text-white"
            >
              See how it works
            </Link>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {proofPoints.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-cyan-300">
                  <Icon className="size-4" aria-hidden="true" />
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
