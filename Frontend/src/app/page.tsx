import Link from "next/link"
import type { ReactNode } from "react"
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  LayoutDashboard,
  LineChart,
  ShieldCheck,
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
