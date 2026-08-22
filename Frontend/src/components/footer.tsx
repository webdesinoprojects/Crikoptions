"use client";

import Link from "next/link";
import { ArrowUpRight, Phone, Sparkles } from "lucide-react";

const footerNavigation = [
  {
    title: "Platform",
    links: [
      { label: "Strategy Board", href: "/trading" },
      { label: "Match Simulator", href: "/simulator" },
      { label: "Live Match Arena", href: "/dashboard" },
      { label: "Score Room", href: "/portfolio" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Frequently Asked Questions", href: "/#faq" },
      { label: "How It Works", href: "/#flow" },
      { label: "Game Rules", href: "/#faq" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: "/login" },
      { label: "Create Account", href: "/register" },
      { label: "Matchday Workspace", href: "/dashboard" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#020612] text-slate-300">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2.6fr]">
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-2">
              <img
                src="/cricoptions_logo.jpg"
                alt="CricOptions Logo"
                className="h-9 w-9 rounded-xl object-cover shadow-[0_0_24px_rgba(14,165,233,0.3)]"
              />
              <img
                src="/cricoptions.png"
                alt="CricOptions"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="max-w-sm text-xs leading-relaxed text-slate-400">
              A CricCoins cricket strategy game for live match predictions,
              option-style learning, and leaderboard competition.
            </p>

            <div className="inline-flex max-w-sm flex-col gap-3 rounded-xl border border-white/10 bg-slate-950/80 p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Sparkles className="size-3.5 text-amber-400" />
                <span>Powered by</span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src="/startup_india.jpg"
                  alt="Startup India"
                  className="h-10 w-auto rounded-md border border-white/10 object-contain shadow-md"
                />
              </div>
              <div className="flex items-center gap-2 border-t border-white/10 pt-2 text-xs text-slate-300">
                <Phone className="size-3.5 shrink-0 text-sky-400" />
                <span className="text-slate-400">Contact:</span>
                <a
                  href="tel:+13149864709"
                  className="font-mono font-semibold text-sky-300 transition-colors hover:text-sky-200"
                >
                  +1(314) 986-4709
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerNavigation.map((col) => (
              <div key={col.title} className="space-y-3.5">
                <h3 className="font-display text-xs font-black uppercase tracking-wider text-slate-100">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-sky-300"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-white/5 bg-slate-900/40 p-4 text-xs leading-relaxed text-slate-400">
          <span className="font-bold text-slate-200">Legal Disclaimer:</span>{" "}
          CricOptions is a social cricket strategy game for entertainment and
          educational purposes. All picks and balances use CricCoins
          with zero real monetary value. CricOptions does not operate
          real-money contests, payouts, deposits, withdrawals, or wagering
          services.
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#01040a]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>(C) {new Date().getFullYear()} CricOptions. All rights reserved.</div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/#faq" className="transition hover:text-slate-200">
              Privacy Policy
            </Link>
            <span>/</span>
            <Link href="/#faq" className="transition hover:text-slate-200">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
