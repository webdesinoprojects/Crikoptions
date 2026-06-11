"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

const plans = [
  {
    name: "Retail",
    description:
      "Essential toolkit for retail traders looking to get started with sports options",
    price: 12,
    yearlyPrice: 99,
    buttonText: "Launch Terminal",
    buttonVariant: "outline" as const,
    includes: [
      "Standard Features:",
      "Real-time market feeds",
      "Standard order execution",
      "Portfolio hub access",
      "Two-factor authentication",
    ],
  },
  {
    name: "Alpha",
    description:
      "Advanced features and sub-millisecond data feeds for active volume traders",
    price: 49,
    yearlyPrice: 399,
    buttonText: "Go Pro",
    buttonVariant: "default" as const,
    popular: true,
    includes: [
      "Everything in Retail, plus:",
      "Sub-millisecond Order Book",
      "Predictive Alpha Signals",
      "Advanced custom risk limits",
      "Priority order routing",
    ],
  },
  {
    name: "Institutional",
    description:
      "Dedicated infrastructure and tailored integration for syndicates and market makers",
    price: 99,
    yearlyPrice: 899,
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const,
    includes: [
      "Everything in Alpha, plus:",
      "Bespoke risk engines",
      "Co-located servers",
      "Dedicated API infrastructure",
      "Custom SLA & 24/7 Support",
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
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-neutral-900/80 border border-white/10 p-1 backdrop-blur-md">
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit h-10 rounded-full sm:px-6 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer",
            selected === "0" ? "text-black" : "text-gray-400 hover:text-white",
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId={"switch"}
              className="absolute inset-0 rounded-full bg-primary"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-20">Monthly</span>
        </button>

        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit h-10 rounded-full sm:px-6 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer",
            selected === "1" ? "text-black" : "text-gray-400 hover:text-white",
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId={"switch"}
              className="absolute inset-0 rounded-full bg-primary"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-20">Yearly</span>
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
        delay: i * 0.25,
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
      className="min-h-screen py-20 sm:py-32 relative bg-black overflow-x-hidden border-t border-white/10"
      ref={pricingRef}
      id="pricing"
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <TimelineContent
          animationNum={4}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="absolute top-0 left-0 right-0 h-96 overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]"
        >
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff0c_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:70px_80px]"></div>
          <SparklesComp
            density={1200}
            direction="bottom"
            speed={0.5}
            color="#0ea5e9"
            className="absolute inset-x-0 bottom-0 h-full w-full opacity-30 [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
          />
        </TimelineContent>
        
        <TimelineContent
          animationNum={5}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="absolute left-0 top-[-150px] w-full h-[100dvh] flex flex-col items-start justify-start overflow-hidden p-0 z-0 opacity-20"
        >
          <div className="absolute left-[-20%] right-[-20%] top-0 h-[800px] rounded-full"
            style={{
              border: "150px solid #0ea5e9",
              filter: "blur(120px)",
              WebkitFilter: "blur(120px)",
            }}
          />
        </TimelineContent>
      </div>

      <article className="text-center mb-16 px-4 max-w-3xl mx-auto space-y-6 relative z-10">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white uppercase font-display leading-tight">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.12}
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
            PLANS TAILORED FOR YOUR EDGE
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base font-normal leading-relaxed"
        >
          Institutional-grade infrastructure, high-fidelity feeds, and absolute execution priority. Find the tier right for your strategy.
        </TimelineContent>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="pt-4"
        >
          <PricingSwitch onSwitch={togglePricingPeriod} />
        </TimelineContent>
      </article>

      <div
        className="absolute top-0 left-[10%] right-[10%] w-[80%] h-full z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, rgba(14, 165, 233, 0.04) 0%, transparent 60%)
          `,
        }}
      />

      <div className="grid md:grid-cols-3 max-w-6xl gap-6 px-4 sm:px-6 lg:px-8 mx-auto relative z-10">
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
                "relative text-white border-white/5 bg-[#020617]/40 backdrop-blur-md w-full flex flex-col justify-between hover:border-white/10 transition-all duration-300 rounded-2xl overflow-hidden",
                plan.popular && "border-primary/20 shadow-[0_0_50px_rgba(14,165,233,0.08)] ring-1 ring-primary/20"
              )}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-primary text-black font-mono font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Popular
                </div>
              )}
              
              <CardHeader className="text-left p-6 sm:p-8">
                <h3 className="text-2xl font-bold tracking-tight text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl sm:text-5xl font-mono font-bold text-white">
                    $
                    <NumberFlow
                      format={{
                        style: "decimal",
                      }}
                      value={isYearly ? plan.yearlyPrice : plan.price}
                      className="text-4xl sm:text-5xl font-mono font-bold"
                    />
                  </span>
                  <span className="text-zinc-500 text-xs font-semibold ml-2 tracking-wide uppercase">
                    /{isYearly ? "year" : "month"}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal min-h-[32px]">{plan.description}</p>
              </CardHeader>

              <CardContent className="p-6 sm:p-8 pt-0 flex-grow flex flex-col justify-between">
                <div>
                  <button
                    className={cn(
                      "w-full mb-8 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer duration-300",
                      plan.popular
                        ? "bg-primary text-black hover:bg-primary/90 shadow-md shadow-primary/10 active:scale-[0.98]"
                        : "bg-white/5 text-white hover:bg-white/10 border border-white/10 active:scale-[0.98]"
                    )}
                  >
                    {plan.buttonText}
                  </button>

                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <h4 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider">
                      {plan.includes[0]}
                    </h4>
                    <ul className="space-y-3">
                      {plan.includes.slice(1).map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center gap-3"
                        >
                          <span className="h-1.5 w-1.5 bg-primary rounded-full shrink-0"></span>
                          <span className="text-xs text-zinc-400 font-normal">{feature}</span>
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
