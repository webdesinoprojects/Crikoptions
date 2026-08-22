"use client";

import React, { useState } from "react";
import { AlertCircle, ChevronDown, HelpCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const FAQ_LIST: FaqItem[] = [
  {
    id: "faq-1",
    category: "General",
    question: "What is CricOptions?",
    answer:
      "CricOptions is a live cricket strategy game powered by CricCoins. It combines ball-by-ball match context, prediction picks, option-style thinking, score tracking, and leaderboards so users can practice smarter cricket decisions.",
  },
  {
    id: "faq-2",
    category: "Safety & Coins",
    question: "Is my real money at stake?",
    answer:
      "No. CricOptions is a social cricket strategy game. All picks use CricCoins, and no real money is involved. You cannot deposit, withdraw, or lose real money on the platform.",
  },
  {
    id: "faq-3",
    category: "Safety & Coins",
    question: "Can I win real cash or prizes?",
    answer:
      "No. CricOptions does not offer cash rewards. Performance is reflected through CricCoins results, rankings, achievements, badges, and leaderboards.",
  },
  {
    id: "faq-4",
    category: "Game Mechanics",
    question: "What can I predict on CricOptions?",
    answer:
      "The current product focuses on cricket outcomes such as innings totals, run milestones, chase targets, over momentum, and similar score-driven match moments. The option-style layer teaches timing, probability, and risk-reward without real money.",
  },
  {
    id: "faq-5",
    category: "Game Mechanics",
    question: "When can I start making picks?",
    answer:
      "For live match games, picks begin after match data is available and the game marks the moment as playable. Simulator games can also be replayed from historical ball events for practice.",
  },
  {
    id: "faq-6",
    category: "Game Mechanics",
    question: "Can I play throughout the entire match?",
    answer:
      "Yes. You can make picks during a live innings until the game stops accepting new picks before settlement.",
  },
  {
    id: "faq-7",
    category: "Safety & Coins",
    question: "What are CricCoins?",
    answer:
      "CricCoins are the in-game currency used to back picks on CricOptions. They have no monetary value and are intended solely for gameplay, learning, and strategy practice.",
  },
  {
    id: "faq-8",
    category: "General",
    question: "Is CricOptions suitable for beginners?",
    answer:
      "Yes. Whether you are new to options-style strategy or already understand probability games, CricOptions provides a virtual environment to practice decision-making and improve timing without risking real money.",
  },
  {
    id: "faq-9",
    category: "Game Mechanics",
    question: "How do pick costs and multipliers move?",
    answer:
      "Pick costs and multipliers are produced by the CricOptions game layer using match state, score context, overs remaining, wickets, and player demand. The strategy board shows the current moment before you confirm a pick.",
  },
  {
    id: "faq-10",
    category: "Game Mechanics",
    question: "What happens when a pick settles?",
    answer:
      "At the end of the relevant match moment or innings, open picks settle based on the final cricket outcome and update your CricCoins result.",
  },
  {
    id: "faq-11",
    category: "Strategies",
    question: "Can I practice option strategies like Iron Fly or Iron Condor?",
    answer:
      "Yes. CricOptions can help users understand option-style structures such as long calls, call selling, spreads, ratio spreads, Iron Fly, and Iron Condor using CricCoins.",
  },
  {
    id: "faq-12",
    category: "Safety & Coins",
    question: "Is CricOptions a gambling or betting platform?",
    answer:
      "No. CricOptions is a social cricket strategy game designed for entertainment and educational purposes. It does not involve wagering or winning real money.",
  },
  {
    id: "faq-13",
    category: "General",
    question: "Is there a mobile version?",
    answer:
      "The web app is responsive and can be used on smaller screens, but the full strategy-board experience is strongest on desktop and tablet-sized screens where the match, picks, score, and CricCoins panels can stay visible together.",
  },
];

const CATEGORIES = ["All", "General", "Game Mechanics", "Safety & Coins", "Strategies"];

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>("faq-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFaqs = FAQ_LIST.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_LIST.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section id="faq" className="relative scroll-mt-20 border-t border-white/10 bg-[#040a16] px-4 py-20 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-60" />

      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-300">
            <HelpCircle className="size-4" aria-hidden="true" />
            Frequently Asked Questions
          </div>
          <h2 className="mt-4 text-3xl font-black leading-tight text-slate-50 sm:text-4xl lg:text-5xl">
            Game rules and CricCoins basics
          </h2>
          <p className="mt-4 text-base text-slate-400 sm:text-lg">
            Clear answers about cricket predictions, CricCoins, strategy, and safety rules.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-bold transition-all duration-200",
                  selectedCategory === cat
                    ? "bg-sky-400 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                    : "border border-white/10 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:text-slate-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-white/10 bg-slate-900/80 py-2 pl-9 pr-4 text-xs font-medium text-slate-200 placeholder-slate-500 outline-none transition focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/50"
            />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={cn(
                    "overflow-hidden rounded-xl border transition-all duration-300",
                    isOpen
                      ? "border-sky-400/40 bg-[#09152a] shadow-[0_4px_24px_rgba(8,145,178,0.15)]"
                      : "border-white/10 bg-slate-900/50 hover:border-white/20 hover:bg-slate-900/80"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(faq.id)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors"
                  >
                    <span className="font-display text-base font-bold text-slate-100 sm:text-lg">
                      {faq.question}
                    </span>
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full border transition-transform duration-300",
                        isOpen
                          ? "rotate-180 border-sky-400/50 bg-sky-400/10 text-sky-300"
                          : "border-white/10 bg-white/5 text-slate-400"
                      )}
                    >
                      <ChevronDown className="size-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-white/5 px-5 pb-5 pt-3">
                      <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-8 text-center text-slate-400">
              No questions found matching your search.
            </div>
          )}
        </div>

        <div className="mt-12 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-400" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">Disclaimer</h4>
              <p className="mt-1 text-xs leading-relaxed text-amber-200/80">
                CricOptions is a social game intended for entertainment and educational purposes only. All picks use CricCoins with no monetary value, and no real money, securities, or financial instruments are traded.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
