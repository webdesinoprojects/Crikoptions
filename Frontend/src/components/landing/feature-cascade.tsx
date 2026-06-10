"use client"

import React, { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    title: "ALGORITHMIC HEDGING",
    desc: "Deploy multi-leg options strategies instantly. The system automatically calculates delta-neutral positions and executes across all available strike prices.",
    number: "01",
    color: "from-[#1e3a8a]/30 to-[#020617]"
  },
  {
    title: "LIVE EVENT TELEMETRY",
    desc: "Ingest pitch-level data feeds. Our websockets push ball-by-ball updates directly into the options pricing model, dynamically adjusting implied volatility.",
    number: "02",
    color: "from-[#0ea5e9]/20 to-[#020617]"
  },
  {
    title: "INSTITUTIONAL API",
    desc: "Connect your proprietary quantitative models directly to our matching engine via ultra-low latency FIX and REST APIs.",
    number: "03",
    color: "from-[#d4af37]/20 to-[#020617]"
  }
]

export const FeatureCascade = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const mm = gsap.matchMedia(containerRef)

    mm.add("(min-width: 1024px)", () => {
      // Pin the entire container
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "+=200%", // Scroll duration for the pinning
        pin: true,
        scrub: 1,
      })

      // Animate each card stacking up
      cardsRef.current.forEach((card, index) => {
        if (!card || index === 0) return // First card is already visible

        gsap.fromTo(card,
          { 
            y: "150%", 
            scale: 0.8,
            opacity: 0,
            rotationX: 10
          },
          {
            y: `${index * 5}%`, // Stack slightly offset
            scale: 1 - (features.length - 1 - index) * 0.05,
            opacity: 1,
            rotationX: 0,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: `top+=${index * 30}% top`,
              end: `top+=${(index + 1) * 30}% top`,
              scrub: 1,
            }
          }
        )
        
        // Push the previous cards back slightly in the Z-axis
        if (index > 0) {
            const prevCards = cardsRef.current.slice(0, index);
            prevCards.forEach((prevCard, i) => {
                if(!prevCard) return;
                gsap.to(prevCard, {
                    scale: 1 - (features.length - i) * 0.05,
                    y: `${i * 2}%`,
                    opacity: 0.5,
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: `top+=${index * 30}% top`,
                        end: `top+=${(index + 1) * 30}% top`,
                        scrub: 1,
                    }
                })
            })
        }
      })
    })

    mm.add("(max-width: 1023px)", () => {
      // Mobile animation: fade cards in individually as they enter viewport
      cardsRef.current.forEach((card) => {
        if (!card) return
        gsap.fromTo(card,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse"
            }
          }
        )
      })
    })

    return () => mm.revert()
  }, [])

  return (
    <section id="terminal" ref={containerRef} className="relative w-full min-h-screen bg-black flex items-center justify-center py-20 lg:py-0 overflow-clip">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_bottom,rgba(30,58,138,0.15)_0%,transparent_80%)]" />

      <div className="w-full max-w-5xl mx-auto px-4 relative flex flex-col lg:block h-auto lg:h-[70vh] justify-center mt-16 lg:mt-0 gap-10">
        <div className="relative lg:absolute top-0 left-0 w-full lg:w-1/3 z-10 pt-12 pb-8 lg:pb-0 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter drop-shadow-lg">
              Mechanical <br className="hidden lg:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-white">Precision</span>
            </h2>
            <p className="mt-4 lg:mt-6 text-gray-400 font-sans text-lg">
                Scroll to initialize system architecture protocols.
            </p>
        </div>

        <div className="relative lg:absolute right-0 top-0 w-full lg:w-3/5 flex flex-col gap-6 lg:block h-auto lg:h-full perspective-[1000px]">
          {features.map((feature, i) => (
            <div 
              key={i}
              ref={el => { cardsRef.current[i] = el }}
              className={`relative lg:absolute lg:top-12 lg:left-0 w-full rounded-[2rem] bg-white/5 p-1.5 ring-1 ring-white/10 shadow-2xl origin-top ${i === 0 ? 'z-10' : 'z-' + (i + 1) * 10}`}
            >
              <div className={`relative w-full min-h-[320px] sm:min-h-[400px] rounded-[calc(2rem-0.375rem)] bg-gradient-to-br ${feature.color} p-8 sm:p-12 overflow-hidden flex flex-col justify-between`}>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <span className="text-9xl font-display font-black text-white">{feature.number}</span>
                </div>
                
                <div>
                  <div className="font-mono text-xs text-[#4AF626] mb-8 tracking-[0.2em]">[ PROTOCOL_ENGAGED ]</div>
                  <h3 className="text-4xl font-display font-black text-white uppercase tracking-tight max-w-sm leading-none drop-shadow-md">
                    {feature.title}
                  </h3>
                </div>

                <p className="text-gray-300 font-sans text-lg max-w-md leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
