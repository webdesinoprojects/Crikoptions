"use client"

import React, { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Check } from "lucide-react"
import Link from "next/link"

gsap.registerPlugin(ScrollTrigger)

export const PricingSection = () => {
  const containerRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  return (
    <section id="pricing" ref={containerRef} className="relative w-full py-8 bg-black z-10 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-20 text-center">
           <h2 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter mb-4">
             Execution Tiers
           </h2>
           <p className="text-gray-400 font-sans max-w-2xl mx-auto text-lg">
             Transparent bandwidth allocation for proprietary trading firms.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          <div className="rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 relative group">
             <div className="h-full w-full rounded-[calc(2rem-0.375rem)] bg-[#0a1428] p-10 flex flex-col relative overflow-hidden transition-colors group-hover:bg-[#0f1d3a]">
               <div className="font-mono text-xs text-gray-500 mb-6 tracking-[0.2em]">[ TIER_01 / RETAIL ]</div>
               <h3 className="text-4xl font-display font-black text-white mb-2">Standard</h3>
               <div className="flex items-baseline gap-2 mb-8">
                 <span className="text-5xl font-sans font-bold text-white">$0</span>
                 <span className="text-gray-500 font-mono text-sm">/ mo</span>
               </div>
               
               <ul className="flex flex-col gap-4 mb-12 flex-grow">
                 {["Real-time Order Book Access", "Basic Portfolio Analytics", "Standard Execution Speed", "Community Support"].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 text-gray-300 font-sans">
                     <Check className="w-5 h-5 text-[#4AF626]" /> {item}
                   </li>
                 ))}
               </ul>

               <Link href="/register" className="w-full py-4 rounded-full border border-white/20 text-center text-white font-sans font-bold uppercase tracking-wider hover:bg-white/5 transition-colors">
                 Open Account
               </Link>
             </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-b from-[#3131f5] to-[#4d4dff]/20 p-1.5 relative group shadow-[0_0_50px_rgba(49,49,245,0.15)]">
             <div className="h-full w-full rounded-[calc(2rem-0.375rem)] bg-[#0a1428] p-10 flex flex-col relative overflow-hidden transition-colors group-hover:bg-[#0f1d3a]">
               <div className="absolute top-0 right-10 bg-[#3131f5] text-white px-4 py-1 rounded-b-lg font-mono text-xs font-bold tracking-widest">
                 RECOMMENDED
               </div>
               <div className="font-mono text-xs text-[#3131f5] mb-6 tracking-[0.2em]">[ TIER_02 / PROP ]</div>
               <h3 className="text-4xl font-display font-black text-white mb-2">Institutional</h3>
               <div className="flex items-baseline gap-2 mb-8">
                 <span className="text-5xl font-sans font-bold text-white">$499</span>
                 <span className="text-gray-500 font-mono text-sm">/ mo</span>
               </div>
               
               <ul className="flex flex-col gap-4 mb-12 flex-grow">
                 {["Direct API / FIX Protocol", "Sub-Millisecond Execution", "Custom Algorithmic Hedging", "Dedicated Account Manager"].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 text-white font-sans">
                     <Check className="w-5 h-5 text-[#3131f5]" /> {item}
                   </li>
                 ))}
               </ul>

               <Link href="/register" className="w-full py-4 rounded-full bg-[#3131f5] text-center text-white font-sans font-black uppercase tracking-wider hover:bg-[#4d4dff] transition-colors shadow-[0_0_20px_rgba(49,49,245,0.4)]">
                 Initialize Node
               </Link>
             </div>
          </div>

        </div>
      </div>
    </section>
  )
}
