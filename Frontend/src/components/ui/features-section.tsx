"use client";

import { Icons } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Marquee } from "@/components/ui/marquee";

const marqueeData = [
  "What's the best business structure for my brand?",
  "What risks should I prepare for?",
  "How do I manage my business finances?",
  "How do I protect my intellectual property?",
  "How do I price my services?",
  "How do I stand out from my competitors?",
  "Who is my ideal customer?",
  "How do I know if my idea is viable?",
  "What business model should I choose?",
  "How much capital do I need to start?",
  "What licenses or permits do I need?",
  "How do I build a strong team?",
];

const features = [
  {
    description:
      "No jargon, no overcomplication — just clear steps you can follow to start and grow your business confidently.",
    icon: Icons.grass,
    title: "We make things simple",
  },
  {
    description:
      "Every strategy we create is designed to help you launch faster, grow smarter, and increase profits.",
    icon: Icons.shine,
    title: "We focus on real results",
  },
  {
    description:
      "With years of hands-on experience across industries, we bring proven strategies and practical solutions to the table.",
    icon: Icons.unBlur,
    title: "We know what works",
  },
  {
    description:
      "From your first idea to scaling your business, we provide ongoing support, not just a one-time plan.",
    icon: Icons.shaders,
    title: "With you all the way",
  },
];

export default function Features() {
  const m1 = marqueeData.slice(0, marqueeData.length / 3);
  const m2 = marqueeData.slice(
    marqueeData.length / 3,
    (marqueeData.length / 3) * 2,
  );
  const m3 = marqueeData.slice((marqueeData.length / 3) * 2);

  return (
    <section className="relative bg-black py-20 sm:py-32 text-white border-t border-white/10 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center space-y-6 text-center mb-16">
          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-primary/80 leading-tight">
            Removing the roadblocks to your success
          </h2>
          <p className="max-w-2xl text-sm sm:text-base text-zinc-400 font-normal leading-relaxed">
            It's easy to get lost in a sea of advice, conflicting opinions, and
            endless "must-dos." We filter out the noise, focus on what truly
            matters, and give you the kind of clarity that lets your business
            shine in the market.
          </p>
          
          <div className="relative w-full max-w-4xl overflow-hidden pt-8">
            {/* Fade overlays */}
            <div className="absolute left-0 top-0 bottom-0 z-20 w-16 sm:w-28 bg-gradient-to-r from-black to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 z-20 w-16 sm:w-28 bg-gradient-to-l from-black to-transparent pointer-events-none" />

            <div className="flex flex-col gap-3">
              <Marquee className="[--duration:35s] [--gap:0.75rem]" repeat={3}>
                {m1.map((q, idx) => (
                  <Badge
                    className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all px-4 py-2 text-xs text-zinc-300 font-medium whitespace-nowrap cursor-default"
                    key={`m1-${idx}`}
                    variant="outline"
                  >
                    {q}
                  </Badge>
                ))}
              </Marquee>

              <Marquee
                className="[--duration:40s] [--gap:0.75rem]"
                repeat={3}
                reverse
              >
                {m2.map((q, idx) => (
                  <Badge
                    className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all px-4 py-2 text-xs text-zinc-300 font-medium whitespace-nowrap cursor-default"
                    key={`m2-${idx}`}
                    variant="outline"
                  >
                    {q}
                  </Badge>
                ))}
              </Marquee>

              <Marquee className="[--duration:32s] [--gap:0.75rem]" repeat={3}>
                {m3.map((q, idx) => (
                  <Badge
                    className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all px-4 py-2 text-xs text-zinc-300 font-medium whitespace-nowrap cursor-default"
                    key={`m3-${idx}`}
                    variant="outline"
                  >
                    {q}
                  </Badge>
                ))}
              </Marquee>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 border-t border-white/10 border-dashed sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 divide-dashed">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                className="flex flex-col gap-6 p-8 lg:p-10 hover:bg-white/[0.01] transition-all group duration-300 relative overflow-hidden"
                key={feature.title}
              >
                {/* Micro highlight effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/0 to-primary/[0.015] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-primary group-hover:border-primary/30 transition-all duration-300 shadow-md">
                  <Icon className="w-6 h-6 transform group-hover:scale-110 transition-transform duration-300" />
                </div>

                <div className="flex flex-col gap-3 pt-6 lg:pt-12">
                  <h3 className="font-display font-semibold text-xl sm:text-2xl text-white group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
