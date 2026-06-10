"use client"

import React, { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Terminal } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

export const DocsSection = () => {
  const containerRef = useRef<HTMLElement>(null)
  
  useEffect(() => {
    const ctx = gsap.context(() => {
        gsap.fromTo(".code-line", 
            { opacity: 0, x: -20 },
            { 
                opacity: 1, 
                x: 0, 
                stagger: 0.1, 
                duration: 0.5,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 60%"
                }
            }
        )
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="docs" ref={containerRef} className="relative w-full py-8 bg-black z-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
        
        <div className="w-full lg:w-1/2">
           <div className="font-mono text-xs text-[#d4af37] mb-6 tracking-[0.2em]">[ DOCS / API_V2 ]</div>
           <h2 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter mb-6 leading-[0.9]">
             Developer <br/>Integration
           </h2>
           <p className="text-gray-400 font-sans text-lg mb-8 leading-relaxed">
             Our REST and WebSocket APIs are designed for minimal latency. Stream live implied volatility, place multi-leg orders, and manage portfolio risk programmatically.
           </p>
           
           <div className="flex gap-4">
             <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-sans font-bold rounded-full transition-colors flex items-center gap-2">
                <Terminal className="w-4 h-4" /> Read Documentation
             </button>
           </div>
        </div>

        <div className="w-full lg:w-1/2">
            <div className="w-full rounded-2xl bg-[#0a1428] border border-white/10 overflow-hidden shadow-2xl">
                <div className="flex items-center px-4 py-3 bg-[#020617] border-b border-white/5 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="ml-4 font-mono text-xs text-gray-500">crikoptions-api.js</span>
                </div>
                <div className="p-6 font-mono text-sm overflow-x-auto">
                    <pre className="text-gray-300 leading-relaxed">
<code className="block code-line"><span className="text-[#d4af37]">import</span> {'{'} CrikOptions {'}'} <span className="text-[#d4af37]">from</span> <span className="text-green-400">'@crikoptions/sdk'</span>;</code>
<code className="block code-line"></code>
<code className="block code-line"><span className="text-blue-400">const</span> client = <span className="text-[#d4af37]">new</span> CrikOptions({'{'}</code>
<code className="block code-line">  apiKey: process.env.<span className="text-white">CRIK_API_KEY</span>,</code>
<code className="block code-line">  environment: <span className="text-green-400">'production'</span></code>
<code className="block code-line">{'}'});</code>
<code className="block code-line"></code>
<code className="block code-line"><span className="text-gray-500">// Subscribe to live match feed</span></code>
<code className="block code-line">client.ws.subscribe(<span className="text-green-400">'match:INDvAUS'</span>, (data) =&gt; {'{'}</code>
<code className="block code-line">  <span className="text-blue-400">if</span> (data.impliedVolatility &gt; <span className="text-orange-400">45.5</span>) {'{'}</code>
<code className="block code-line">    client.orders.place({'{'}</code>
<code className="block code-line">      type: <span className="text-green-400">'SELL_STRADDLE'</span>,</code>
<code className="block code-line">      size: <span className="text-orange-400">1000</span></code>
<code className="block code-line">    {'}'});</code>
<code className="block code-line">  {'}'}</code>
<code className="block code-line">{'}'});</code>
                    </pre>
                </div>
            </div>
        </div>

      </div>
    </section>
  )
}
