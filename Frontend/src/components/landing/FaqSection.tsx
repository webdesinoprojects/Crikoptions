"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, Search, AlertCircle } from "lucide-react";
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
      "CricOptions is a social options trading game where you can trade cricket-based options during live T20 and ODI matches. It is designed for options enthusiasts to test their trading skills in a fun, competitive environment using virtual coins.",
  },
  {
    id: "faq-2",
    category: "Safety & Coins",
    question: "Is my real money at stake?",
    answer:
      "No. CricOptions is a social game. All trades are executed using virtual coins, and no real money is involved. You cannot deposit, withdraw, or lose real money on the platform.",
  },
  {
    id: "faq-3",
    category: "Safety & Coins",
    question: "Can I win real cash or prizes?",
    answer:
      "No. CricOptions does not offer cash rewards for trading. Your performance is reflected through virtual profits, rankings, achievements, badges, and leaderboards.",
  },
  {
    id: "faq-4",
    category: "Trading Mechanics",
    question: "Why are there only Call Options and no Put Options?",
    answer:
      "Cricket scores can only move upwards as runs are scored—they never decrease. Since the underlying value only moves in one direction, CricOptions offers Call Options only, making the trading experience simple and intuitive.",
  },
  {
    id: "faq-5",
    category: "Trading Mechanics",
    question: "When does trading start?",
    answer:
      "Trading begins after the first ball of the innings is delivered. No trades can be placed before the match starts.",
  },
  {
    id: "faq-6",
    category: "Trading Mechanics",
    question: "Can I trade throughout the entire match?",
    answer:
      "Yes. You can trade during the live innings until the exchange stops accepting new orders before settlement.",
  },
  {
    id: "faq-7",
    category: "Safety & Coins",
    question: "What are virtual coins?",
    answer:
      "Virtual coins are the in-game currency used to buy and sell options on CricOptions. They have no monetary value and are intended solely for gameplay and learning.",
  },
  {
    id: "faq-8",
    category: "General",
    question: "Is CricOptions suitable for beginners?",
    answer:
      "Yes. Whether you're new to options trading or an experienced trader, CricOptions provides a risk-free environment to learn strategies, practise decision-making, and improve your trading skills.",
  },
  {
    id: "faq-9",
    category: "Trading Mechanics",
    question: "How are option prices determined?",
    answer:
      "Option prices are determined by the CricOptions exchange based on the live match situation, including factors such as the current score, overs remaining, wickets in hand, and market demand.",
  },
  {
    id: "faq-10",
    category: "Trading Mechanics",
    question: "What happens when an option expires?",
    answer:
      "At the end of the innings, all open positions are automatically settled by the exchange based on the final match outcome and the option's settlement value.",
  },
  {
    id: "faq-11",
    category: "Strategies",
    question: "Can I practice option strategies like Iron Fly or Iron Condor?",
    answer:
      "Yes. CricOptions allows you to practice a variety of option trading strategies, including Long Calls, Call Selling, Bull Call Spreads, Ratio Spreads, Iron Fly, and Iron Condor, all without risking real money.",
  },
  {
    id: "faq-12",
    category: "Safety & Coins",
    question: "Is CricOptions a gambling or betting platform?",
    answer:
      "No. CricOptions is a social trading game designed for entertainment and educational purposes. It does not involve wagering or winning real money.",
  },
  {
    id: "faq-13",
    category: "General",
    question: "Do I need prior experience in options trading?",
    answer:
      "Not at all. You can start with simple Call Option trades and gradually unlock more advanced strategies as you gain experience on the platform.",
  },
];

const CATEGORIES = ["All", "General", "Trading Mechanics", "Safety & Coins", "Strategies"];

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
      {/* Schema.org FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-60" />

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-300">
            <HelpCircle className="size-4" aria-hidden="true" />
            Frequently Asked Questions
          </div>
          <h2 className="mt-4 text-3xl font-black leading-tight text-slate-50 sm:text-4xl lg:text-5xl">
            Everything you need to know
          </h2>
          <p className="mt-4 text-base text-slate-400 sm:text-lg">
            Have questions about trading cricket options, virtual coins, or platform rules? We&apos;ve got answers.
          </p>
        </div>

        {/* Filter Tabs & Search */}
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

        {/* Accordion Items */}
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

        {/* Disclaimer Banner */}
        <div className="mt-12 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-400" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">Disclaimer</h4>
              <p className="mt-1 text-xs text-amber-200/80 leading-relaxed">
                CricOptions is a social game intended for entertainment and educational purposes only. All trades use virtual coins, and no real money, securities, or financial instruments are traded.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
