"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const footerNavigation = [
  {
    title: "Platform",
    links: [
      { label: "Trading Terminal", href: "/trading" },
      { label: "Match Simulator", href: "/simulator" },
      { label: "Live Markets", href: "/dashboard" },
      { label: "Portfolio Risk Hub", href: "/portfolio" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Frequently Asked Questions", href: "/#faq" },
      { label: "Developer Workflows", href: "/#docs" },
      { label: "Platform Rules", href: "/#faq" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: "/login" },
      { label: "Create Account", href: "/register" },
      { label: "Workspace Dashboard", href: "/dashboard" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#020612] text-slate-300">
      {/* Top Subtle Border Accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />

      {/* Main Footer Container */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2.6fr]">
          
          {/* Brand Info */}
          <div className="space-y-4">
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
              A workstation for live cricket derivatives, ball-by-ball option chains, and risk-free strategy simulation.
            </p>
          </div>

          {/* Navigation Columns */}
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

        {/* Legal Disclaimer Box */}
        <div className="mt-10 rounded-xl border border-white/5 bg-slate-900/40 p-4 text-xs leading-relaxed text-slate-400">
          <span className="font-bold text-slate-200">Legal Disclaimer:</span> CricOptions is a social trading simulation game for entertainment and educational purposes. All positions and balances use virtual coins with zero real monetary value. CricOptions does not operate real-money brokerage, securities trading, or wagering services.
        </div>
      </div>

      {/* Sub-Footer Bar */}
      <div className="border-t border-white/10 bg-[#01040a]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            © {new Date().getFullYear()} CricOptions. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/#faq" className="transition hover:text-slate-200">Privacy Policy</Link>
            <span>•</span>
            <Link href="/#faq" className="transition hover:text-slate-200">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
