"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { useAuthStore } from "@/features/auth/hooks/useAuth"

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Terminal", href: "#terminal" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
]

export function Navbar1() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated } = useAuthStore()

  const primaryHref = isAuthenticated ? "/dashboard" : "/register"
  const primaryLabel = isAuthenticated ? "Workspace" : "Start trading"

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#020711]/30 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-3 rounded-full pr-2"
          aria-label="CricOptions home"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-sky-300/30 bg-sky-400 text-sm font-black text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_14px_34px_rgba(14,165,233,0.22)]">
            CO
          </span>
          <span className="hidden text-lg font-black text-slate-50 sm:block">
            CricOptions
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-1 py-2 text-base font-semibold text-slate-400 transition-colors hover:text-slate-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated && user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] py-1.5 pl-2 pr-3 text-sm font-semibold text-slate-200 transition hover:border-sky-300/40"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-sky-400/15 font-mono text-xs text-sky-300">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </span>
              <span className="max-w-24 truncate">{user.name || "Profile"}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-white/10 bg-white/2.5 px-6 py-3 text-base font-semibold text-slate-300 transition-colors hover:border-sky-300/25 hover:text-slate-50"
            >
              Sign in
            </Link>
          )}

          <Link
            href={primaryHref}
            className="rounded-full bg-sky-400 px-7 py-3 text-base font-black text-slate-950 shadow-[0_16px_34px_rgba(14,165,233,0.28)] transition hover:bg-sky-300 active:translate-y-px"
          >
            {primaryLabel}
          </Link>
        </div>

        <button
          className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/4 text-slate-50 md:hidden"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
          type="button"
        >
          <Menu className="size-5" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed inset-0 z-50 bg-[#020617]/96 px-4 py-4 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                <span className="flex size-10 items-center justify-center rounded-full bg-sky-400 text-sm font-black text-slate-950">
                  CO
                </span>
                <span className="text-sm font-black text-slate-50">CricOptions</span>
              </Link>
              <button
                className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-50"
                onClick={() => setIsOpen(false)}
                aria-label="Close navigation menu"
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-12 grid gap-3">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex rounded-xl border border-white/10 bg-white/[0.035] px-5 py-4 text-lg font-semibold text-slate-100"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 grid gap-3 border-t border-white/10 pt-6">
              {!isAuthenticated ? (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-white/10 px-5 py-3 text-center text-base font-semibold text-slate-100"
                >
                  Sign in
                </Link>
              ) : null}
              <Link
                href={primaryHref}
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-sky-400 px-5 py-3 text-center text-base font-black text-slate-950"
              >
                {primaryLabel}
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
