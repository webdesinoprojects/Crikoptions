"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHomeMatches, useLiveTicker } from "@/features/dashboard/hooks";

export default function SideNavBar() {
  const pathname = usePathname();
  const { data: tickers } = useLiveTicker();
  const { data: matches } = useHomeMatches();
  const primaryMarketHref = tickers?.[0]?.id ? `/trading/${tickers[0].id}` : "/dashboard";
  const primaryInsightHref = matches?.[0]?.id ? `/insights/${matches[0].id}` : "/dashboard";

  const mainLinks = [
    { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
    { label: "Trading Terminal", icon: "candlestick_chart", href: primaryMarketHref },
    { label: "Portfolio Hub", icon: "account_balance_wallet", href: "/portfolio" },
    { label: "Market Scanner", icon: "query_stats", href: "/dashboard" },
    { label: "Match Analysis", icon: "analytics", href: primaryInsightHref },
  ];

  const intelligenceLinks = [
    { label: "Intelligence HQ", icon: "psychology", href: primaryInsightHref },
    { label: "DNA Engine", icon: "biotech", href: primaryInsightHref },
    { label: "News Terminal", icon: "newspaper", href: "/dashboard" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-[200px] flex flex-col py-2 z-40 bg-surface border-r border-outline/10 select-none">
      <div className="px-2 mb-4">
        <div className="flex items-center gap-2 p-1.5 rounded border border-outline/5 bg-surface-dim">
          <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[14px]">terminal</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface leading-tight">Pro Engine</p>
            <p className="text-[8px] text-bull-green flex items-center gap-1 font-bold leading-none">
              <span className="w-1 h-1 rounded-full bg-bull-green animate-pulse"></span> API_SYNC
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 px-1 overflow-y-auto">
        <p className="px-3 py-1 text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">
          Main Workspace
        </p>
        {mainLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={
              isActive(link.href)
                ? "bg-primary/15 text-primary font-bold rounded flex items-center gap-2 px-3 py-1.5 text-[11px]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-bright flex items-center gap-2 px-3 py-1.5 transition-all rounded text-[11px]"
            }
          >
            <span className="material-symbols-outlined text-[16px]">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}

        <p className="px-3 py-1 mt-3 text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">
          Intelligence HQ
        </p>
        {intelligenceLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={
              isActive(link.href)
                ? "bg-primary/15 text-primary font-bold rounded flex items-center gap-2 px-3 py-1.5 text-[11px]"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-bright flex items-center gap-2 px-3 py-1.5 transition-all rounded text-[11px]"
            }
          >
            <span className="material-symbols-outlined text-[16px]">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}

        <p className="px-3 py-1 mt-3 text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">
          Account Settings
        </p>
        <Link
          href="/profile"
          className={
            isActive("/profile")
              ? "bg-primary/15 text-primary font-bold rounded flex items-center gap-2 px-3 py-1.5 text-[11px]"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-bright flex items-center gap-2 px-3 py-1.5 transition-all rounded text-[11px]"
          }
        >
          <span className="material-symbols-outlined text-[16px]">account_circle</span>
          <span>My Profile</span>
        </Link>
      </nav>

      <div className="px-2 mt-auto pt-2">
        <Link
          href={primaryMarketHref}
          className="w-full bg-primary text-on-primary font-bold py-1.5 rounded flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-[0.98] transition-all text-[11px] uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-[14px]">rocket_launch</span>
          Execute Trade
        </Link>
      </div>
    </aside>
  );
}
