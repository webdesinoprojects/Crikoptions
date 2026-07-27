"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { useAuthStore } from "@/features/auth/hooks/useAuth"

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Terminal", href: "#terminal" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
  { label: "FAQ", href: "#faq" },
]

export function Navbar1() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated } = useAuthStore()

  const primaryHref = isAuthenticated ? "/dashboard" : "/register"
  const primaryLabel = isAuthenticated ? "Workspace" : "Start trading"

  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#020711]/82 shadow-[0_16px_50px_rgba(0,0,0,0.26)] backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between px-3 sm:px-5 lg:h-16 lg:px-10 xl:px-12">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-0 lg:gap-1 rounded-full pr-2"
          aria-label="CricOptions home"
        >
          <img src="/cricoptions_logo.jpg" alt="CricOptions Logo" className="h-8 w-8 shrink-0 rounded-lg object-cover lg:h-9 lg:w-9 shadow-[0_0_28px_rgba(14,165,233,0.28)]" />
          <img src="/cricoptions.png" alt="CricOptions" className="h-9 sm:h-10 lg:h-11 w-auto object-contain" />
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] p-1 lg:flex xl:gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-semibold text-slate-400 transition-colors hover:bg-white/[0.045] hover:text-slate-50 xl:px-4"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated && user ? (
            <Link
              href="/profile"
              className="flex max-w-40 items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] py-1.5 pl-2 pr-3 text-sm font-semibold text-slate-200 transition hover:border-sky-300/40"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-sky-400/15 font-mono text-xs text-sky-300">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </span>
              <span className="max-w-24 truncate">{user.name || "Profile"}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-white/10 bg-white/2.5 px-5 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:border-sky-300/25 hover:text-slate-50 xl:px-6 xl:py-3"
            >
              Sign in
            </Link>
          )}

          <Link
            href={primaryHref}
            className="rounded-full bg-sky-400 px-5 py-2.5 text-sm font-black text-slate-950 shadow-[0_16px_34px_rgba(14,165,233,0.28)] transition hover:bg-sky-300 active:translate-y-px xl:px-7 xl:py-3"
          >
            {primaryLabel}
          </Link>
        </div>

        <button
          className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/4 text-slate-50 transition hover:bg-white/8 active:scale-[0.98] lg:hidden"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          type="button"
        >
          <Menu className="size-5" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed inset-0 z-50 min-h-[100dvh] overflow-y-auto bg-[#020617]/96 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-0" onClick={() => setIsOpen(false)}>
                <img src="/cricoptions_logo.jpg" alt="CricOptions Logo" className="h-6 w-6 rounded object-cover" />
                <img src="/cricoptions.png" alt="CricOptions" className="h-8 sm:h-9 w-auto object-contain" />
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
                    className="flex min-h-14 items-center rounded-xl border border-white/10 bg-white/[0.035] px-5 py-4 text-base font-semibold text-slate-100 transition hover:border-sky-300/30 hover:bg-white/[0.06] active:scale-[0.99]"
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
