"use client";

import { useState } from "react";

const mainLinks = [
  { label: "Dashboard", icon: "dashboard", href: "#", active: true },
  { label: "Market Scanner", icon: "query_stats", href: "#", active: false },
  { label: "Match Analysis", icon: "analytics", href: "#", active: false },
  { label: "Portfolio", icon: "account_balance_wallet", href: "#", active: false },
];

const intelligenceLinks = [
  { label: "Alpha Signals", icon: "psychology", href: "#", active: false },
  { label: "News Terminal", icon: "newspaper", href: "#", active: false },
];

export default function SideNavBar() {
  const [activeMain, setActiveMain] = useState("Dashboard");

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-60 flex flex-col py-4 z-40 bg-[#000d1a] border-r border-white/10">
      <div className="px-4 mb-6">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
          <div className="w-8 h-8 rounded bg-primary-container/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-container text-[18px]">
              terminal
            </span>
          </div>
          <div>
            <p className="font-label-sm text-white">Main Engine</p>
            <p className="text-[9px] text-bull-green flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-bull-green animate-pulse"></span>{" "}
              SYSTEM_LIVE
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 px-2">
        <p className="px-4 py-2 text-[10px] font-bold text-outline uppercase tracking-widest">
          Main
        </p>
        {mainLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={() => setActiveMain(link.label)}
            className={
              activeMain === link.label
                ? "bg-primary-container/10 text-primary-container font-bold rounded flex items-center gap-3 px-4 py-2.5"
                : "text-outline hover:text-white hover:bg-white/5 flex items-center gap-3 px-4 py-2.5 transition-all rounded"
            }
          >
            <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
            {link.label}
          </a>
        ))}

        <p className="px-4 py-2 mt-4 text-[10px] font-bold text-outline uppercase tracking-widest">
          Intelligence
        </p>
        {intelligenceLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-outline hover:text-white hover:bg-white/5 flex items-center gap-3 px-4 py-2.5 transition-all rounded"
          >
            <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
            {link.label}
          </a>
        ))}
      </nav>

      <div className="px-4 mt-auto">
        <button className="w-full bg-primary-container text-white font-bold py-2.5 rounded flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all">
          <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
          Execute Trade
        </button>
      </div>
    </aside>
  );
}