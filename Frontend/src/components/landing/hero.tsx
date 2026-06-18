"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import dynamic from "next/dynamic"

const PixelTrail = dynamic(
  () => import("@/components/ui/pixel-trail").then((mod) => mod.PixelTrail),
  { ssr: false }
)

export const HeroSection = () => {
  const [showPixelTrail, setShowPixelTrail] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reducedMotion) return

    if ("requestIdleCallback" in window && "cancelIdleCallback" in window) {
      const idleCallback = window.requestIdleCallback(
        () => setShowPixelTrail(true),
        { timeout: 1400 }
      )

      return () => {
        window.cancelIdleCallback(idleCallback)
      }
    }

    const timer = globalThis.setTimeout(() => setShowPixelTrail(true), 900)
    return () => globalThis.clearTimeout(timer)
  }, [])

  return (
    <section className="relative w-full min-h-[100dvh] flex flex-col items-center justify-center pt-24 pb-0 overflow-hidden bg-[#020617]">
      {/* Interactive Pixel Trail Background */}
      <div className="absolute inset-0 z-0">
        {showPixelTrail ? (
          <PixelTrail
            pixelSize={64}
            fadeDuration={650}
            delay={0}
            pixelClassName="rounded-full bg-[#0ea5e9]/20 shadow-[0_0_14px_rgba(14,165,233,0.3)]"
          />
        ) : null}
      </div>
      {/* Radial Gradient Wash — Sky Blue + Gold tones */}
      <div aria-hidden className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.15)_0%,rgba(2,6,23,0)_70%)] opacity-90 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.04)_0%,rgba(2,6,23,0)_70%)] opacity-60 mix-blend-screen" />
      </div>

      {/* Grid Lines */}
      <div aria-hidden className="absolute inset-0 pointer-events-none z-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(rgba(14,165,233,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.15) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex flex-col items-center text-center">
        {/* Eyebrow — Sky Blue accent */}
        <div className="mb-8 rounded-full px-5 py-2 border border-[#0ea5e9]/25 bg-[#0ea5e9]/5 backdrop-blur-sm shadow-[0_0_20px_rgba(14,165,233,0.08)]">
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#38bdf8] font-bold uppercase">&lt; TERMINAL / V2.0 OP_READY &gt;</span>
        </div>

        {/* H1 — tight letter-spacing, premium feel */}
        <h1 className="landing-reveal max-w-5xl text-[clamp(3rem,8vw,7rem)] leading-[0.85] font-display font-black tracking-[-0.04em] text-white uppercase drop-shadow-2xl">
          Institutional Grade<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] via-[#38bdf8] to-[#ffd700]">Cricket Options</span>
        </h1>

        {/* Subtitle */}
        <p className="landing-reveal landing-reveal-delay-1 mt-10 max-w-2xl text-lg md:text-xl font-sans text-slate-400 tracking-wide leading-relaxed" style={{ textWrap: "balance" }}>
          Advanced predictive algorithms, gapless execution, and real-time event telemetry. Engineered for mechanical efficiency.
        </p>

        {/* CTAs */}
        <div className="landing-reveal landing-reveal-delay-2 mt-14 flex flex-col sm:flex-row items-center gap-5">
          <Link href="/register" className="group relative inline-flex items-center justify-center rounded-2xl bg-white/5 p-1.5 ring-1 ring-white/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 hover:ring-[#0ea5e9]/30 active:scale-[0.98]">
            <div className="relative flex items-center gap-4 rounded-[calc(1rem-0.375rem)] bg-[#0ea5e9] px-8 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_4px_20px_rgba(14,165,233,0.3)] transition-colors duration-500 group-hover:bg-[#38bdf8]">
              <span className="font-sans font-extrabold uppercase tracking-widest text-white text-sm">Initialize Workspace</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-out group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
            </div>
          </Link>

          <Link href="/login" className="group relative inline-flex items-center justify-center rounded-2xl bg-white/5 p-1.5 ring-1 ring-white/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 hover:ring-[#ffd700]/20 active:scale-[0.98]">
            <div className="relative flex items-center gap-4 rounded-[calc(1rem-0.375rem)] bg-[#0a1428] px-8 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-colors duration-500 group-hover:bg-[#112240]">
              <span className="font-sans font-bold uppercase tracking-widest text-slate-300 text-sm group-hover:text-[#ffd700] transition-colors duration-300">Client Login</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom fade — blends seamlessly into next section */}
      <div aria-hidden className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#020617] to-transparent z-20 pointer-events-none" />
    </section>
  )
}
