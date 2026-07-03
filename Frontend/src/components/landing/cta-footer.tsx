"use client"

import React, { useEffect, useRef } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export const CtaFooter = () => {
  const containerRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Text scrub reveal
      const chars = textRef.current?.innerText.split("")
      if (textRef.current && chars) {
        textRef.current.innerText = ""
        chars.forEach(char => {
            const span = document.createElement("span")
            span.innerText = char
            span.style.opacity = "0.1"
            textRef.current?.appendChild(span)
        })

        gsap.to(textRef.current.children, {
            opacity: 1,
            stagger: 0.1,
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 70%",
                end: "center center",
                scrub: 1,
            }
        })
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <footer ref={containerRef} className="relative w-full bg-[#020617] border-t border-white/10 pt-16 flex flex-col items-center z-20">
      
      {/* Massive CTA */}
      <div className="w-full max-w-6xl mx-auto px-4 flex flex-col items-center text-center mb-16">
        <div className="font-mono text-xs text-[#0ea5e9] mb-8 tracking-[0.2em]">[ SYSTEM.READY ]</div>
        
        <h2 ref={textRef} className="text-[clamp(3rem,8vw,8rem)] leading-[0.85] font-display font-black text-white uppercase tracking-tighter mb-16">
          INITIALIZE WORKSPACE
        </h2>

        <Link href="/register" className="group relative inline-flex items-center justify-center rounded-[2rem] bg-white/5 p-2 ring-1 ring-white/10 transition-all duration-700 hover:bg-white/10 active:scale-[0.98]">
            <div className="relative flex items-center justify-center rounded-[calc(2rem-0.5rem)] bg-[#0ea5e9] px-16 py-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_0_40px_rgba(14,165,233,0.2)] transition-colors duration-500 group-hover:bg-[#38bdf8]">
              <span className="font-sans font-black uppercase tracking-widest text-white text-xl">Deploy Terminal</span>
            </div>
        </Link>
      </div>

      {/* Grid Footer */}
      <div className="w-full border-t border-white/10 bg-[#020617] py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 font-mono text-sm tracking-wider">
          
          <div className="flex flex-col gap-4">
            <span className="text-white font-bold text-lg mb-2">CRICOPTIONS</span>
            <span className="text-slate-500">© 2026 CricOptions Inc.</span>
            <span className="text-slate-500">All Systems Nominal.</span>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-white font-bold mb-2">PLATFORM</span>
            <Link href="/dashboard" className="text-slate-500 hover:text-white transition-colors">Markets</Link>
            <Link href="/portfolio" className="text-slate-500 hover:text-white transition-colors">Portfolio</Link>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-white font-bold mb-2">RESOURCES</span>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">API Documentation</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">System Status</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Risk Parameters</a>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-white font-bold mb-2">LEGAL</span>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Terms of Execution</a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors">Privacy Protocol</a>
            <div className="mt-4 w-full h-[1px] bg-white/10" />
            <span className="text-[#ef4444] text-xs">High Risk Derivative Trading. Capital at risk.</span>
          </div>

        </div>
      </div>
    </footer>
  )
}
