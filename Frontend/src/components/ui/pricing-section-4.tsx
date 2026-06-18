"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    description:
      "Great for small traders and beginners looking to get started with basic options",
    price: 12,
    yearlyPrice: 99,
    buttonText: "Get started",
    buttonVariant: "outline" as const,
    includes: [
      "Core features:",
      "Basic Market Data",
      "Standard execution speed",
      "2-factor authentication",
      "Email support",
    ],
  },
  {
    name: "Pro",
    description:
      "Best value for active traders that need advanced telemetry and low latency",
    price: 48,
    yearlyPrice: 399,
    buttonText: "Get started",
    buttonVariant: "default" as const,
    popular: true,
    includes: [
      "Everything in Starter, plus:",
      "Advanced predictive algorithms",
      "Sub-millisecond Order Books",
      "Live Event Telemetry",
      "Automated Risk Profiling",
      "Priority 24/7 support",
    ],
  },
  {
    name: "Institutional",
    description:
      "Advanced plan with FIX API, enhanced security, and unlimited access for funds",
    price: 299,
    yearlyPrice: 2899,
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    includes: [
      "Everything in Pro, plus:",
      "Direct FIX API Access",
      "Colocation services",
      "Dedicated account manager",
      "Custom margin requirements",
      "Military-grade data encryption",
    ],
  },
];

const PricingSwitch = ({ onSwitch }: { onSwitch: (value: string) => void }) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-[#0a1428] border border-white/10 p-1">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors cursor-pointer outline-none",
            selected === "0" ? "text-white" : "text-slate-400",
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId="switch"
              className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm shadow-[#0ea5e9]/50 border-[#0ea5e9] bg-gradient-to-t from-[#0ea5e9] to-[#38bdf8]"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">Monthly</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit h-10 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors cursor-pointer outline-none",
            selected === "1" ? "text-white" : "text-slate-400",
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId="switch"
              className="absolute top-0 left-0 h-10 w-full rounded-full border-4 shadow-sm shadow-[#0ea5e9]/50 border-[#0ea5e9] bg-gradient-to-t from-[#0ea5e9] to-[#38bdf8]"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">Yearly</span>
        </button>
      </div>
    </div>
  );
};

export default function PricingSection6() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const togglePricingPeriod = (value: string) =>
    setIsYearly(Number.parseInt(value) === 1);

  return (
    <div
      className="min-h-screen mx-auto relative bg-[#020617] overflow-x-hidden py-12 flex flex-col justify-center border-t border-white/5"
      ref={pricingRef}
      id="pricing"
    >
      {/* Background elements & grid & sparkles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <TimelineContent
          animationNum={4}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="absolute top-0 h-96 w-screen overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]"
        >
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:70px_80px]"></div>
          <SparklesComp
            density={1800}
            direction="bottom"
            speed={1}
            color="#0ea5e9"
            className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)] opacity-30"
          />
        </TimelineContent>

        <TimelineContent
          animationNum={5}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="absolute left-0 top-[-114px] w-full h-[113.625vh] flex flex-col items-start justify-start content-start flex-none flex-nowrap gap-2.5 overflow-hidden p-0 z-0"
        >
          <div className="absolute inset-0">
            <div
              className="absolute left-[-568px] right-[-568px] top-0 h-[2053px] flex-none rounded-full"
              style={{
                border: "200px solid #0ea5e9",
                opacity: 0.1,
                filter: "blur(92px)",
                WebkitFilter: "blur(92px)",
              }}
            ></div>
          </div>
        </TimelineContent>
      </div>

      {/* Radial Blue Overlay */}
      <div
        className="absolute top-0 left-[10%] right-[10%] w-[80%] h-full z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at center, rgba(14,165,233,0.15) 0%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />

      <article className="text-center mb-10 pt-16 max-w-3xl mx-auto space-y-4 relative z-50 px-4">
        <h2 className="text-4xl sm:text-5xl font-display font-black text-white uppercase tracking-tighter">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.15}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-center"
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: 0,
            }}
          >
            Access Tiers
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-slate-400 font-sans max-w-xl mx-auto text-lg leading-relaxed text-balance"
        >
          Deploy capital with the execution speed of institutional quant funds. Choose your access tier.
        </TimelineContent>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="pt-6"
        >
          <PricingSwitch onSwitch={togglePricingPeriod} />
        </TimelineContent>
      </article>

      <div className="grid md:grid-cols-3 max-w-6xl gap-6 px-4 mx-auto relative z-10">
        {plans.map((plan, index) => (
          <TimelineContent
            key={plan.name}
            as="div"
            animationNum={2 + index}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="flex"
          >
            <Card
              className={cn(
                "relative text-white border-white/10 w-full flex flex-col justify-between overflow-hidden rounded-[2rem]",
                plan.popular
                  ? "bg-gradient-to-b from-[#0a1428] to-[#020617] shadow-[0px_-10px_80px_0px_rgba(14,165,233,0.15)] z-20 ring-1 ring-[#0ea5e9]/30"
                  : "bg-gradient-to-b from-[#050b18] to-[#020617] z-10"
              )}
            >
              <CardHeader className="text-left p-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-[#0ea5e9]">{plan.name}</h3>
                  {plan.popular && (
                     <span className="text-xs font-mono tracking-widest text-[#ffd700] bg-[#ffd700]/10 px-3 py-1 rounded-full border border-[#ffd700]/20">RECOMMENDED</span>
                  )}
                </div>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl sm:text-5xl font-display font-black text-white">
                    $
                    <NumberFlow
                      format={{
                        style: "decimal",
                      }}
                      value={isYearly ? plan.yearlyPrice : plan.price}
                      className="text-4xl sm:text-5xl"
                    />
                  </span>
                  <span className="text-slate-400 ml-2 font-sans text-sm">
                    /{isYearly ? "year" : "month"}
                  </span>
                </div>
                <p className="text-sm font-sans text-slate-400 leading-relaxed min-h-[40px]">{plan.description}</p>
              </CardHeader>

              <CardContent className="p-8 pt-0 flex-grow flex flex-col justify-between">
                <div>
                  <button
                    className={cn(
                      "w-full mb-8 py-4 font-sans font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-[0.98]",
                      plan.popular
                        ? "bg-gradient-to-t from-[#0ea5e9] to-[#38bdf8] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_0_20px_rgba(14,165,233,0.3)] border border-[#38bdf8] text-white hover:brightness-110"
                        : "bg-white/5 shadow-lg border border-white/10 text-white hover:bg-white/10"
                    )}
                  >
                    {plan.buttonText}
                  </button>

                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <h4 className="font-mono text-xs tracking-widest text-slate-500 mb-4 uppercase">
                      {plan.includes[0]}
                    </h4>
                    <ul className="space-y-3">
                      {plan.includes.slice(1).map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center gap-3"
                        >
                          <div className="w-4 h-4 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center border border-[#0ea5e9]/30 shrink-0">
                             <div className="w-1.5 h-1.5 bg-[#0ea5e9] rounded-full" />
                          </div>
                          <span className="text-sm font-sans text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TimelineContent>
        ))}
      </div>
    </div>
  );
}
