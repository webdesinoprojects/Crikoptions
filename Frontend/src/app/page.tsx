import Link from "next/link"
import type { ReactNode } from "react"
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Diamond,
  GitBranch,
  LayoutDashboard,
  LineChart,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react"

import { Footer } from "@/components/footer"
import { FaqSection } from "@/components/landing/FaqSection"
import { HeroSection } from "@/components/landing/hero"
import { LandingMotionSections } from "@/components/landing/landing-motion-sections"
import { Navbar1 } from "@/components/ui/navbar-1"

function PrimaryLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-6 py-3 text-sm font-black text-slate-950 shadow-[0_16px_40px_rgba(34,211,238,0.2)] transition hover:bg-cyan-200 active:translate-y-px"
    >
      {children}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  )
}

const accessItems = [
  "Create an account and receive a CricCoins balance",
  "Follow live or simulated match moments",
  "Trade option contracts with real-time ₵ order execution",
  "Track open positions, challenges, and leaderboard progress in ₵",
]

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100">
      <Navbar1 />

      <main className="w-full max-w-full overflow-x-hidden">
        <HeroSection />

        <section id="challenges" className="scroll-mt-20 border-y border-white/10 bg-gradient-to-b from-[#020617] via-[#0b152d] to-[#020617] px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-wide text-cyan-300">Trading Academy</p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">
                Master sports option strategy
              </h2>
              <p className="mt-4 mx-auto max-w-2xl text-base leading-7 text-slate-300">
                Unlock milestones, build trading discipline, and earn credentials across specialized sports trading academies.
              </p>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  id: "long-call",
                  title: "Long Call Academy",
                  window: "Bullish Strategy · Bronze Badge",
                  desc: "Learn the fundamentals of bullish options trading. Master the first trade, profitable exits, and momentum catching.",
                  reward: "₵9,000",
                  gradient: "from-emerald-500/[0.08] to-transparent",
                  border: "border-emerald-500/20 hover:border-emerald-400/50",
                  glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
                  textColor: "text-emerald-400",
                  iconColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
                  icon: TrendingUp,
                  status: "in-progress",
                  img: "/powerplay_pro.png",
                },
                {
                  id: "short-call",
                  title: "Short Call Academy",
                  window: "Bearish Strategy · Silver Badge",
                  desc: "Discover sell-side trading. Learn to collect option premiums and profit from price consolidation or decays.",
                  reward: "₵9,000",
                  gradient: "from-rose-500/[0.08] to-transparent",
                  border: "border-rose-500/20 hover:border-rose-400/50",
                  glow: "hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]",
                  textColor: "text-rose-400",
                  iconColor: "bg-rose-500/10 text-rose-300 border-rose-500/20",
                  icon: TrendingDown,
                  status: "in-progress",
                  img: "/death_over_assassin.png",
                },
                {
                  id: "bull-spread",
                  title: "Bull Call Spread Academy",
                  window: "Hedged Strategy · Gold Badge",
                  desc: "Cap your downside and manage risks by building spread strategies using combinations of buy and sell calls.",
                  reward: "₵30,500",
                  gradient: "from-cyan-500/[0.08] to-transparent",
                  border: "border-cyan-500/20 hover:border-cyan-400/50",
                  glow: "hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
                  textColor: "text-cyan-400",
                  iconColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
                  icon: GitBranch,
                  status: "locked",
                  img: "/middle_over_genius.png",
                },
                {
                  id: "iron-fly",
                  title: "Iron Fly Academy",
                  window: "Neutral Strategy · Platinum Badge",
                  desc: "Master high-tier delta-neutral iron butterflies to capture time decay in stable range-bound match stages.",
                  reward: "₵28,500",
                  gradient: "from-amber-500/[0.08] to-transparent",
                  border: "border-amber-500/20 hover:border-amber-400/50",
                  glow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
                  textColor: "text-amber-400",
                  iconColor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
                  icon: Diamond,
                  status: "locked",
                  img: "/last_over_hero.png",
                },
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.id}
                    className={`group relative overflow-hidden rounded-xl border bg-[#0e172a]/95 bg-gradient-to-b ${c.gradient} p-4 sm:p-5 shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${c.border} ${c.glow}`}
                  >
                    {/* Visual Asset Header */}
                    <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden rounded-lg border border-white/5 bg-slate-900 shadow-inner">
                      <img
                        src={c.img}
                        alt={c.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Gradient overlay to soften bottom of image */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0e172a] via-transparent to-transparent opacity-80" />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`flex size-10 items-center justify-center rounded-md border ${c.iconColor}`}>
                        <Icon className="size-5" />
                      </span>
                      <span className="font-mono text-xs font-black text-amber-200">Total {c.reward}</span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white">{c.title}</h3>
                        {c.status === "completed" ? (
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300 border border-emerald-500/20">
                            Completed
                          </span>
                        ) : c.status === "locked" ? (
                          <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-400 border border-white/10">
                            Locked
                          </span>
                        ) : (
                          <span className={`rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${c.textColor} border border-emerald-500/20`}>
                            Active
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] font-semibold text-slate-400">{c.window}</p>
                      <p className="mt-3 text-xs leading-5 text-slate-300">{c.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Daily Reward Pool Banner */}
            <div className="mt-12 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-[#1e1b12] to-[#0f172a]/50 p-6 sm:p-8 backdrop-blur-md shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
              <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <h4 className="text-lg font-black text-white">Academy Graduation Rewards</h4>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    Complete all tasks in any of the academies to unlock your professional credential badge and claim cumulative course rewards of up to ₵77,000 CricCoins.
                  </p>
                </div>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-md transition hover:bg-amber-300 active:translate-y-px"
                >
                  Start Learning
                </Link>
              </div>
            </div>
          </div>
        </section>

        <LandingMotionSections />

        <section id="criccoins" className="scroll-mt-20 border-t border-white/10 bg-[#020617] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-amber-300">CricCoins</p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
                CricCoins make the game simple
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
                Users get a clear practice balance, every order shows its ₵
                cost, and results stay tied to the game instead of real money.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: CircleDollarSign,
                  title: "Start with ₵",
                  body: "A demo balance gives users room to learn the board before a high-pressure over.",
                  value: "₵5,000",
                },
                {
                  icon: BarChart3,
                  title: "Trade contracts",
                  body: "The order execution panel shows cost and balance after confirmation, so the next action is obvious.",
                  value: "₵540",
                },
                {
                  icon: WalletCards,
                  title: "Track results",
                  body: "Challenge score, match history, and leaderboard progress all stay readable in ₵.",
                  value: "+₵3,860",
                },
              ].map(({ icon: Icon, title, body, value }) => (
                <article key={title} className="rounded-lg border border-white/10 bg-[#071120] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex size-10 items-center justify-center rounded-md border border-amber-300/20 bg-amber-300/10 text-amber-300">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-sm font-black text-amber-200">{value}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-black text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="access" className="scroll-mt-20 bg-slate-950 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-cyan-300">Get started</p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-slate-50 sm:text-4xl">
                Start with the matchday game
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
                Create an account, get CricCoins, choose a match moment, and
                start learning how timing changes your score.
              </p>
              <div className="mt-7">
                <PrimaryLink href="/register">Create account</PrimaryLink>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#071120] p-6">
              <div className="grid gap-3">
                {accessItems.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-md border border-white/10 bg-white/[0.025] p-4">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden="true" />
                    <span className="text-sm leading-6 text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#071120] px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: LayoutDashboard,
                title: "Dashboard",
                body: "Live match arena, coming-up fixtures, challenges, and leaderboard progress.",
              },
              {
                icon: LineChart,
                title: "Trading Terminal",
                body: "Live option chains, order book depth, CricCoins stake, and P&L tracking.",
              },
              {
                icon: WalletCards,
                title: "Score Room",
                body: "Open positions, wallet state, CricCoins result curve, and matchday history.",
              },
              {
                icon: ShieldCheck,
                title: "Safe by design",
                body: "CricCoins, no real-money stakes, and clear educational positioning.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <article key={title} className="rounded-lg border border-white/10 bg-slate-950/50 p-5">
                <Icon className="size-5 text-cyan-300" aria-hidden="true" />
                <h3 className="mt-5 text-lg font-black text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <FaqSection />

        <section className="bg-slate-950 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-lg border border-white/10 bg-[#071120] p-8 sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-3xl font-black leading-tight text-slate-50 sm:text-4xl">
                  Turn the next innings into a strategy game
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
                  Use CricCoins to make smarter cricket calls, learn
                  option-style strategy, and compete without real-money stakes.
                </p>
              </div>
              <PrimaryLink href="/register">Start with CricCoins</PrimaryLink>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
