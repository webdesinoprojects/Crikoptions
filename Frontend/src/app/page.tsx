import Link from "next/link"
import type { ReactNode } from "react"
import {
  ArrowRight,
  BarChart3,
  Code2,
  LineChart,
} from "lucide-react"

import { DataTable, type DataTableColumn } from "@/components/data-table"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/landing/hero"
import { LandingMotionSections } from "@/components/landing/landing-motion-sections"
import { Navbar1 } from "@/components/ui/navbar-1"

type MarketRow = {
  contract: string
  bid: string
  ask: string
  move: string
  depth: string
}

const marketRows: MarketRow[] = [
  {
    contract: "India match winner",
    bid: "1.82",
    ask: "1.86",
    move: "+3.4%",
    depth: "Strong",
  },
  {
    contract: "Kohli fifty",
    bid: "2.34",
    ask: "2.42",
    move: "-1.1%",
    depth: "Medium",
  },
  {
    contract: "Powerplay over 47.5",
    bid: "1.94",
    ask: "2.02",
    move: "+5.8%",
    depth: "Strong",
  },
  {
    contract: "Death overs sixes",
    bid: "3.10",
    ask: "3.28",
    move: "+2.0%",
    depth: "Thin",
  },
]

const marketColumns: DataTableColumn<MarketRow>[] = [
  {
    key: "contract",
    header: "Contract",
    accessor: "contract",
    cellClassName: "font-medium text-slate-100",
  },
  {
    key: "bid",
    header: "Bid",
    accessor: "bid",
    align: "right",
    cellClassName: "font-mono text-emerald-300",
  },
  {
    key: "ask",
    header: "Ask",
    accessor: "ask",
    align: "right",
    cellClassName: "font-mono text-rose-300",
  },
  {
    key: "move",
    header: "Move",
    accessor: (row) => (
      <span
        className={
          row.move.startsWith("+") ? "text-emerald-300" : "text-rose-300"
        }
      >
        {row.move}
      </span>
    ),
    align: "right",
    cellClassName: "font-mono",
  },
  {
    key: "depth",
    header: "Depth",
    accessor: "depth",
    align: "right",
    cellClassName: "text-slate-300",
  },
]

const testimonials = [
  {
    quote:
      "Seeing match state and exposure together changes how quickly I hedge after a volatile over.",
    name: "Naveen Rao",
    role: "Options trader",
  },
  {
    quote:
      "Execution, match intelligence, and portfolio state finally feel like one desk.",
    name: "Meera Kapoor",
    role: "Product operator",
  },
]

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
      className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-400 px-6 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-sky-300 active:translate-y-px"
    >
      {children}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar1 />

      <main className="w-full max-w-full overflow-x-hidden">
        <HeroSection />

        <LandingMotionSections />

        <section id="terminal" className="relative z-10 border-t border-white/10 bg-[#071120] px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div>
              <div className="flex size-12 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-400/10 text-sky-300">
                <BarChart3 className="size-6" aria-hidden="true" />
              </div>
              <h2 className="mt-6 text-3xl font-black leading-tight text-slate-50 sm:text-4xl">
                Market data that stays readable
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
                The board keeps contracts, prices, movement, and liquidity
                close together so traders can scan without losing context.
              </p>
            </div>

            <DataTable
              caption="Sample live board for product preview"
              columns={marketColumns}
              data={marketRows}
              getRowKey={(row) => row.contract}
            />
          </div>
        </section>

        <section className="bg-[#071120] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <div className="flex size-12 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-400/10 text-sky-300">
                <LineChart className="size-6" aria-hidden="true" />
              </div>
              <h2 className="mt-6 text-3xl font-black leading-tight text-slate-50 sm:text-4xl">
                Designed for operators who watch every ball
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {testimonials.map((testimonial) => (
                <figure
                  key={testimonial.name}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 p-6"
                >
                  <blockquote className="text-base leading-7 text-slate-200">
                    {testimonial.quote}
                  </blockquote>
                  <figcaption className="mt-5 text-sm text-slate-500">
                    <span className="font-semibold text-slate-300">
                      {testimonial.name}
                    </span>
                    <span className="block">{testimonial.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-slate-950 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-black leading-tight text-slate-50 sm:text-4xl">
                Choose your access path
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-400">
                Start with the product workspace, then expand into deeper market
                and developer workflows as the platform opens.
              </p>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-lg border border-slate-800 bg-slate-900/55 p-6">
                <h3 className="text-xl font-semibold text-slate-50">
                  Preview desk
                </h3>
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  Create an account, explore the terminal surface, and follow
                  markets as live data lands.
                </p>
                <div className="mt-6">
                  <PrimaryLink href="/register">Start trading</PrimaryLink>
                </div>
              </div>

              <div className="rounded-lg border border-sky-400/40 bg-sky-400/10 p-6">
                <h3 className="text-xl font-semibold text-slate-50">
                  Trading workspace
                </h3>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Open dashboards, portfolio views, match intelligence, and
                  order tools from one authenticated workspace.
                </p>
                <div className="mt-6">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-full border border-sky-300/60 px-6 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-300/10 active:translate-y-px"
                  >
                    View markets
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="docs" className="bg-[#071120] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
            <div>
              <div className="flex size-12 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-400/10 text-sky-300">
                <Code2 className="size-6" aria-hidden="true" />
              </div>
              <h2 className="mt-6 text-3xl font-black leading-tight text-slate-50 sm:text-4xl">
                Ready for systematic workflows
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
                Developer workflows can subscribe to ball events, refresh
                markets, and place structured orders from one integration layer.
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
              <pre className="overflow-x-auto p-6 text-sm leading-7 text-slate-300">
                <code>{`const match = cricOptions.match("IND-AUS")

match.on("ball", (event) => {
  risk.update(event)
  markets.refresh("match-winner")
})

await cricOptions.orders.place({
  market: "match-winner",
  side: "buy",
  limit: 1.84
})`}</code>
              </pre>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-lg border border-slate-800 bg-[linear-gradient(135deg,#0f1f36_0%,#071120_55%,#020617_100%)] p-8 sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-3xl font-black leading-tight text-slate-50 sm:text-4xl">
                  Put the live board in front of your next match
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                  Start with the landing flow, then move into the workspace
                  where market context and exposure stay connected.
                </p>
              </div>
              <PrimaryLink href="/register">Start trading</PrimaryLink>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
