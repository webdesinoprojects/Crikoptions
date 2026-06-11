"use client"

import React, { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { gsap } from "gsap"
import { PixelTrail } from "@/components/ui/pixel-trail"

export const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const pRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set([h1Ref.current, pRef.current, ctaRef.current], { 
        y: 50, 
        opacity: 0,
        filter: "blur(10px)"
      })

      // Reveal sequence
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } })
      
      tl.to(h1Ref.current, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 1.5,
        delay: 0.2
      })
      .to(pRef.current, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 1.2
      }, "-=1.0")
      .to(ctaRef.current, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 1.2
      }, "-=0.8")

    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative w-full min-h-[100dvh] flex flex-col items-center justify-center pt-24 pb-8 overflow-hidden bg-black">
      {/* Interactive Pixel Trail Background */}
      <div className="absolute inset-0 z-0">
        <PixelTrail
          pixelSize={48}
          fadeDuration={800}
          delay={0}
          pixelClassName="rounded-full bg-[#3131f5]/45 shadow-[0_0_12px_rgba(49,49,245,0.5)]"
        />
      </div>
      {/* Radial Gradient Wash */}
      <div aria-hidden className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(30,58,138,0.3)_0%,rgba(0,0,0,0)_70%)] opacity-80 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(49,49,245,0.08)_0%,rgba(0,0,0,0)_70%)] opacity-60 mix-blend-screen" />
      </div>

      {/* Grid Lines */}
      <div aria-hidden className="absolute inset-0 pointer-events-none z-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <div className="mb-8 rounded-full px-4 py-1.5 border border-[#4AF626]/30 bg-[#4AF626]/5 backdrop-blur-sm shadow-[0_0_15px_rgba(74,246,38,0.1)]">
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#4AF626] font-bold uppercase">&lt; TERMINAL / V2.0 OP_READY &gt;</span>
        </div>

        {/* H1 - 2-Line Iron Rule */}
        <h1 ref={h1Ref} className="max-w-5xl text-[clamp(3rem,8vw,7rem)] leading-[0.85] font-display font-black tracking-tighter text-white uppercase drop-shadow-2xl">
          Institutional Grade<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">Cricket Options</span>
        </h1>

        {/* Subtitle */}
        <p ref={pRef} className="mt-12 max-w-2xl text-lg md:text-xl font-sans text-gray-400 tracking-wide leading-relaxed">
          Advanced predictive algorithms, gapless execution, and real-time event telemetry. Engineered for mechanical efficiency.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="mt-16 flex flex-col sm:flex-row items-center gap-6">
          <Link href="/register" className="group relative inline-flex items-center justify-center rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 active:scale-[0.98]">
            <div className="relative flex items-center gap-4 rounded-[calc(2rem-0.375rem)] bg-[#3131f5] px-8 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] transition-colors duration-500 group-hover:bg-[#4d4dff]">
              <span className="font-sans font-black uppercase tracking-widest text-white text-sm">Initialize Workspace</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 ease-out group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
            </div>
          </Link>

          <Link href="/login" className="group relative inline-flex items-center justify-center rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 active:scale-[0.98]">
            <div className="relative flex items-center gap-4 rounded-[calc(2rem-0.375rem)] bg-[#0a1428] px-8 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-colors duration-500 group-hover:bg-[#112240]">
              <span className="font-sans font-bold uppercase tracking-widest text-white text-sm">Client Login</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
