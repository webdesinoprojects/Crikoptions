"use client"

import React, { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Activity, ShieldAlert, Cpu } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const BentoCard = ({ 
  className, 
  children, 
  title, 
  icon: Icon,
  delay = 0 
}: { 
  className?: string, 
  children: React.ReactNode, 
  title: string,
  icon: any,
  delay?: number
}) => {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    gsap.fromTo(el, 
      { y: 100, opacity: 0, scale: 0.95 },
      { 
        y: 0, 
        opacity: 1, 
        scale: 1,
        duration: 1.2, 
        ease: "power3.out",
        delay: delay,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    )
  }, [delay])

  return (
    <div ref={cardRef} className={`group relative rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 ${className}`}>
      <div className="relative h-full w-full rounded-[calc(2rem-0.375rem)] bg-[#020617]/95 backdrop-blur-sm p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.2)_0%,transparent_70%)]" />
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ring-1 ring-white/10">
              <Icon className="w-5 h-5 text-[#d4af37]" />
            </div>
            <h3 className="text-xl font-display font-bold text-white tracking-tight">{title}</h3>
          </div>
          <div className="flex-grow">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export const BentoGrid = () => {
  return (
    <section className="relative w-full py-8 bg-black z-10" id="features">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-20 text-center">
           <h2 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter mb-4">
             Tactical Telemetry
           </h2>
           <p className="text-gray-400 font-sans max-w-2xl mx-auto text-lg">
             Engineered for institutional-grade stability. No empty voids. No wasted cycles.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[300px] gap-4 grid-flow-dense">
          
          {/* Large Main Card - 8 cols, 2 rows */}
          <BentoCard 
            title="Predictive Liquidation Engine" 
            icon={Cpu}
            className="md:col-span-8 md:row-span-2"
            delay={0}
          >
            <div className="h-full w-full rounded-xl bg-black/40 border border-white/5 p-4 flex flex-col relative overflow-hidden">
               <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-4">
                 <span className="font-mono text-xs text-gray-500">[ SYS.CORE.LIQUIDATION ]</span>
                 <span className="font-mono text-xs text-[#4AF626] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#4AF626] animate-pulse" /> ACTIVE</span>
               </div>
               
               <div className="flex-grow flex items-end gap-2 px-2">
                 {[40, 60, 30, 80, 50, 90, 45, 75, 100, 85].map((h, i) => (
                   <div key={i} className="flex-1 bg-gradient-to-t from-[#1e3a8a] to-[#0ea5e9]/50 rounded-t-sm transition-all duration-1000 ease-out group-hover:scale-y-110 origin-bottom" style={{ height: `${h}%`, opacity: 0.5 + (i * 0.05) }} />
                 ))}
               </div>
               
               <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0a1428] to-transparent" />
            </div>
          </BentoCard>

          {/* Vertical Stack Card - 4 cols, 2 rows */}
          <BentoCard 
            title="Sub-Millisecond Order Books" 
            icon={Activity}
            className="md:col-span-4 md:row-span-2"
            delay={0.2}
          >
             <div className="h-full w-full rounded-xl bg-black/40 border border-white/5 p-4 overflow-hidden relative">
                <div className="font-mono text-xs flex flex-col gap-3 text-gray-400">
                  <div className="grid grid-cols-3 text-gray-600 mb-2 pb-2 border-b border-white/5">
                    <span>PRICE</span><span>SIZE</span><span>TIME</span>
                  </div>
                  {[
                    { p: "45.20", s: "1,200", t: "12:04:01.002", type: "sell" },
                    { p: "45.15", s: "800", t: "12:04:01.015", type: "sell" },
                    { p: "45.10", s: "3,500", t: "12:04:01.042", type: "sell" },
                    { p: "45.05", s: "150", t: "12:04:01.089", type: "sell" },
                    { p: "45.00", s: "10,000", t: "12:04:01.112", type: "buy" },
                    { p: "44.95", s: "4,200", t: "12:04:01.145", type: "buy" },
                    { p: "44.90", s: "850", t: "12:04:01.201", type: "buy" },
                    { p: "44.85", s: "5,000", t: "12:04:01.256", type: "buy" },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-3 hover:bg-white/5 px-1 py-0.5 rounded transition-colors cursor-default">
                      <span className={row.type === 'buy' ? 'text-[#22c55e]' : 'text-[#ef4444]'}>{row.p}</span>
                      <span>{row.s}</span>
                      <span className="text-gray-500">{row.t}</span>
                    </div>
                  ))}
                </div>
                {/* Fade overlay to hide bottom rows */}
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#0a1428] to-transparent pointer-events-none" />
             </div>
          </BentoCard>

          {/* Square Bottom Cards - 6 cols, 1 row each */}
          <BentoCard 
            title="Automated Risk Profiling" 
            icon={ShieldAlert}
            className="md:col-span-6 md:row-span-1"
            delay={0.3}
          >
             <p className="text-sm text-gray-400 font-sans leading-relaxed">
               Dynamic margin requirements calculated per over. Instant portfolio-wide hedging and auto-liquidation thresholds ensuring zero negative balance.
             </p>
          </BentoCard>
          
          <BentoCard 
            title="Encrypted Protocol" 
            icon={Cpu}
            className="md:col-span-6 md:row-span-1"
            delay={0.4}
          >
             <p className="text-sm text-gray-400 font-sans leading-relaxed">
               Military-grade data encryption securing all API payloads, WebSockets, and database transactions at rest and in transit.
             </p>
          </BentoCard>

        </div>
      </div>
    </section>
  )
}
