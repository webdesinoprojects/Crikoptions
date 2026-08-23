"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CircleDollarSign, RadioTower, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"

const optionChainRows = [
  { contract: "IND Win Match", callPrice: "68.50", putPrice: "31.50", change: "+4.2%" },
  { contract: "Over 18.5 Runs > 10.5", callPrice: "54.00", putPrice: "46.00", change: "+12.5%" },
  { contract: "Next Wicket < 15 Runs", callPrice: "38.00", putPrice: "62.00", change: "-6.1%" },
  { contract: "Kohli 50+ Runs", callPrice: "76.00", putPrice: "24.00", change: "+8.4%" },
]

const orderBookRows = [
  ["54.00", "710", "54.50", "520"],
  ["53.50", "620", "55.00", "480"],
  ["53.00", "390", "55.50", "610"],
  ["52.50", "440", "56.00", "700"],
]

function HeroStrategyBoard() {
  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-lg border border-cyan-200/15 bg-[#050b15]/94 shadow-[0_36px_120px_rgba(0,0,0,0.56)] backdrop-blur-xl">
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

      <div className="grid gap-px bg-white/10 lg:grid-cols-[1.15fr_0.85fr]">
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

          <div className="mt-3 grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-md border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 bg-[#0a1829] px-3 py-2 text-xs font-black text-white">
                <span>Option Chain</span>
                <span className="text-[10px] font-mono text-cyan-300">LIVE STRIKES</span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-[#071120] text-[10px] uppercase text-slate-400">
                  <tr>
                    <th className="px-2.5 py-2 text-left">Contract</th>
                    <th className="px-2.5 py-2 text-right text-emerald-400">Call</th>
                    <th className="px-2.5 py-2 text-right text-red-400">Put</th>
                  </tr>
                </thead>
                <tbody>
                  {optionChainRows.map((row) => (
                    <tr key={row.contract} className="border-t border-white/6 odd:bg-white/[0.025] hover:bg-white/5 transition-colors">
                      <td className="px-2.5 py-2 font-bold text-white text-xs truncate max-w-[120px]">{row.contract}</td>
                      <td className="px-2.5 py-2 text-right font-mono text-xs font-bold text-emerald-300">₵{row.callPrice}</td>
                      <td className="px-2.5 py-2 text-right font-mono text-xs font-bold text-red-300">₵{row.putPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-md border border-white/10 bg-[#071120] p-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-black text-white">Order Form</span>
                <span className="rounded bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">MARKET</span>
              </div>

              <div className="mt-2.5 grid grid-cols-2 rounded bg-white/[0.04] p-0.5 text-center text-xs font-bold">
                <span className="rounded bg-emerald-400/20 py-1 text-emerald-300">BUY CALL</span>
                <span className="py-1 text-slate-400">SELL PUT</span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400">Option Strike</p>
                  <p className="font-bold text-white truncate text-xs">Over 18.5 Runs &gt; 10.5</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-slate-400">Contracts</p>
                    <p className="font-mono font-bold text-white">10</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Price/Contract</p>
                    <p className="font-mono font-bold text-emerald-300">₵54.00</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded border border-amber-300/15 bg-amber-300/8 p-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Total Stake</span>
                  <span className="font-mono font-bold text-amber-200">₵540</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Est. Payout</span>
                  <span className="font-mono font-bold text-emerald-300">₵1,000</span>
                </div>
              </div>

              <button
                type="button"
                className="mt-3 w-full rounded bg-cyan-400 py-2 text-xs font-black text-slate-950 shadow-[0_4px_16px_rgba(34,211,238,0.25)] transition hover:bg-cyan-300"
              >
                Execute Order (₵540)
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-white/10">
          <div className="bg-[#071120] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-white">Order Book</p>
              <p className="text-xs text-slate-400">Live Bids &amp; Asks</p>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="grid grid-cols-4 text-[10px] font-bold uppercase text-slate-400 pb-1 border-b border-white/5">
                <span>Bid (₵)</span>
                <span className="text-right">Qty</span>
                <span>Ask (₵)</span>
                <span className="text-right">Qty</span>
              </div>
              {orderBookRows.map(([bid, bidSize, ask, askSize]) => (
                <div key={`${bid}-${ask}`} className="grid grid-cols-4 gap-2 text-xs">
                  <span className="rounded bg-emerald-400/12 px-1.5 py-0.5 font-mono text-emerald-300 font-bold">{bid}</span>
                  <span className="text-right font-mono text-slate-400">{bidSize}</span>
                  <span className="rounded bg-red-400/12 px-1.5 py-0.5 font-mono text-red-300 font-bold">{ask}</span>
                  <span className="text-right font-mono text-slate-400">{askSize}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#071120] p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-black text-white">Portfolio P&amp;L</p>
                <p className="mt-1 text-xs text-slate-400">Live CricCoins Return</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-black text-emerald-300">+₵3,860</p>
                <p className="text-[10px] font-mono text-emerald-400 font-bold">+14.2% today</p>
              </div>
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
