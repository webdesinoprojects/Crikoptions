"use client";

import { LiveMarketTicker } from "@/features/dashboard/components/LiveMarketTicker";

export default function TopNavBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14 bg-[#000d1a] border-b border-white/10">
      <div className="flex items-center gap-10">
        <h1 className="font-headline-md text-headline-md font-bold text-primary-container flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container text-[24px]">
            token
          </span>
          PitchSide Pro
        </h1>
        <nav className="hidden md:flex items-center gap-6">
          <a className="text-white border-b-2 border-primary-container pb-1 font-body-md" href="#">
            Dashboard
          </a>
          <a className="text-outline hover:text-white transition-colors font-body-md" href="#">
            Market Scanner
          </a>
          <a className="text-outline hover:text-white transition-colors font-body-md" href="#">
            Match Terminal
          </a>
          <a className="text-outline hover:text-white transition-colors font-body-md" href="#">
            AI Signals
          </a>
        </nav>
      </div>
      <div className="flex items-center gap-6 flex-1 max-w-2xl px-12">
        <div className="hidden lg:block w-full">
          <LiveMarketTicker />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 border-r border-white/10 pr-4">
          <span className="material-symbols-outlined text-outline cursor-pointer hover:text-white text-[20px]">
            notifications
          </span>
          <span className="material-symbols-outlined text-outline cursor-pointer hover:text-white text-[20px]">
            history
          </span>
          <span className="material-symbols-outlined text-outline cursor-pointer hover:text-white text-[20px]">
            settings
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-[10px] text-outline leading-none mb-0.5">TRADER_0924</p>
            <p className="text-[11px] text-bull-green font-bold leading-none">PRO ACCOUNT</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center border border-white/20">
            <span className="text-white text-xs font-bold">T</span>
          </div>
        </div>
      </div>
    </header>
  );
}