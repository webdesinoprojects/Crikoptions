"use client";

import React from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Activity, BarChart3, ListOrdered, TicketCheck } from "lucide-react";
import {
  LiveMatchStatsPanel,
  MatchConditionBanner,
  MatchScheduleStrip,
  OptionChain,
  OrderEntryForm,
  TradingActivityPanel,
} from "@/features/trading/components";
import { useMarketDetail, useMarkets, useMatchScoreStream, useUserStream } from "@/features/trading/hooks";
import { useMatchDetails } from "@/features/dashboard/hooks";
import { isMarketRetired, selectPrimaryMarket } from "@/features/trading/utils/market-helpers";
import { useTerminalStore } from "@/stores/terminal.store";
import { useRouter } from "next/navigation";

interface PageProps {
  params: Promise<{ marketId: string }>;
}

type MobileTradingPanel = "match" | "chain" | "order" | "activity";

const mobilePanels: Array<{
  value: MobileTradingPanel;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: "match", label: "Match", icon: BarChart3 },
  { value: "chain", label: "Chain", icon: ListOrdered },
  { value: "order", label: "Order", icon: TicketCheck },
  { value: "activity", label: "Activity", icon: Activity },
];

export default function TradingTerminalPage({ params }: PageProps) {
  const terminalRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [mobilePanel, setMobilePanel] = React.useState<MobileTradingPanel>("chain");
  const { marketId } = React.use(params);
  const setActiveMarket = useTerminalStore((state) => state.setActiveMarket);
  const { data: market, isError: marketError, isLoading: marketLoading } = useMarketDetail(marketId);
  const matchId = market?.matchId ?? "";
  const { data: match } = useMatchDetails(matchId);
  // Backend WS topics use hex _id; cache key stays on market short matchId.
  useMatchScoreStream(matchId, match?.id);
  useUserStream(matchId);

  const { data: siblingMarkets = [] } = useMarkets(matchId);

  // Fallback: If marketId in URL is actually a match ID, resolve its primary market ID and redirect.
  const { data: directMarkets = [] } = useMarkets(marketError || (!marketLoading && !market) ? marketId : "");
  const directPrimaryMarketId = selectPrimaryMarket(directMarkets)?.id;

  React.useEffect(() => {
    if (directPrimaryMarketId && directPrimaryMarketId !== marketId) {
      router.replace(`/trading/${directPrimaryMarketId}`);
    }
  }, [directPrimaryMarketId, marketId, router]);

  const marketRetired = isMarketRetired(market);
  const rolloverMarketId = React.useMemo(() => {
    if (!marketRetired) return null;
    const next = selectPrimaryMarket(siblingMarkets);
    if (!next?.id || next.id === marketId || isMarketRetired(next)) return null;
    return next.id;
  }, [marketRetired, siblingMarkets, marketId]);

  React.useEffect(() => {
    if (rolloverMarketId) router.replace(`/trading/${rolloverMarketId}`);
  }, [rolloverMarketId, router]);

  React.useEffect(() => {
    if (marketId) setActiveMarket(marketId);
  }, [marketId, setActiveMarket]);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline();

      tl.fromTo(
        "[data-terminal-header]",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      ).fromTo(
        "[data-terminal-panel]",
        { opacity: 0, y: 20, filter: "blur(10px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
        },
        "-=0.4"
      );
    },
    { scope: terminalRef, dependencies: [marketId] }
  );

  if (marketLoading) {
    return <TerminalShell ref={terminalRef}><TerminalNotice title="Loading market" body="Opening the live trading terminal..." /></TerminalShell>;
  }

  if (marketError || !market || !market._id || !market.matchId) {
    return (
      <TerminalShell ref={terminalRef}>
        <TerminalNotice
          title="Market unavailable"
          body="This market is no longer available. Choose a live or upcoming match from the home feed."
          action={<Link className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-100 hover:bg-cyan-300/15" href="/trading">View matches</Link>}
        />
      </TerminalShell>
    );
  }

  if (marketRetired) {
    return (
      <TerminalShell ref={terminalRef}>
        <TerminalNotice
          title={rolloverMarketId ? "Opening the next innings" : "This innings has settled"}
          body={
            rolloverMarketId
              ? "This innings settled. Taking you to the open market for this match..."
              : "This innings settled and its market is closed. The next innings market opens shortly — positions here are settled automatically."
          }
          action={
            rolloverMarketId ? undefined : (
              <Link className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-100 hover:bg-cyan-300/15" href="/trading">View fixtures</Link>
            )
          }
        />
      </TerminalShell>
    );
  }

  return (
    <div
      ref={terminalRef}
      className="noise-overlay relative flex min-h-[calc(100dvh-3.5rem)] flex-grow flex-col overflow-x-hidden bg-[#01040a] text-on-surface lg:h-full lg:min-h-0 lg:overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.15),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.1),transparent_40%),radial-gradient(ellipse_at_center,rgba(245,158,11,0.05),transparent_50%)] animate-pulse"
        style={{ animationDuration: '12s' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(8,145,178,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.05)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20"
      />

      <div className="relative z-10" data-terminal-header>
        <MatchScheduleStrip selectedMatchId={match?.id ?? matchId} />
      </div>

      <MobileTradingTabs activePanel={mobilePanel} onChange={setMobilePanel} />

      <MatchConditionBanner match={match} className="relative z-10 mx-3 mt-3" />

      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
        <div className="grid gap-3 p-3 lg:hidden" data-terminal-panel>
          {mobilePanel === "match" && (
            <LiveMatchStatsPanel className="min-h-[520px]" match={match} market={market} />
          )}
          {mobilePanel === "chain" && (
            <OptionChain className="min-h-[620px]" marketId={marketId} market={market} match={match} />
          )}
          {mobilePanel === "order" && (
            <OrderEntryForm matchId={matchId} marketId={marketId} match={match} />
          )}
          {mobilePanel === "activity" && (
            <TradingActivityPanel className="min-h-[560px]" matchId={matchId} marketId={marketId} match={match} market={market} />
          )}
        </div>

        <div className="hidden min-h-full grid-cols-1 gap-3 p-3 lg:grid lg:h-full lg:min-h-0 lg:grid-cols-[320px_minmax(0,1fr)_370px] xl:grid-cols-[370px_minmax(0,1fr)_420px] 2xl:grid-cols-[410px_minmax(0,1fr)_440px]">
          <div className="min-h-0 lg:h-full" data-terminal-panel>
            <LiveMatchStatsPanel className="lg:h-full lg:min-h-0" match={match} market={market} />
          </div>
          <div className="min-h-0 lg:h-full" data-terminal-panel>
            <OptionChain className="lg:h-full lg:min-h-0" marketId={marketId} market={market} match={match} />
          </div>
          <section className="flex min-h-0 flex-col gap-2 overflow-y-auto pr-1 lg:h-full" data-terminal-panel>
            <OrderEntryForm matchId={matchId} marketId={marketId} match={match} />
            <TradingActivityPanel className="min-h-[500px] shrink-0 lg:flex-1" matchId={matchId} marketId={marketId} match={match} market={market} />
          </section>
        </div>
      </main>
    </div>
  );
}

const TerminalShell = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(function TerminalShell({ children }, ref) {
  return (
    <div
      ref={ref}
      className="noise-overlay relative flex min-h-[calc(100dvh-3.5rem)] flex-grow flex-col overflow-hidden bg-[#01040a] text-on-surface"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.15),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.1),transparent_40%)]"
      />
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center p-6">{children}</div>
    </div>
  );
});

function TerminalNotice({
  action,
  body,
  title,
}: {
  action?: React.ReactNode;
  body: string;
  title: string;
}) {
  return (
    <section className="max-w-md rounded-2xl border border-white/10 bg-[#071327]/95 p-6 text-center shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
      <h1 className="font-display text-2xl font-black text-white">{title}</h1>
      <p className="mt-2 text-sm font-semibold leading-6 text-on-surface-variant">{body}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </section>
  );
}

function MobileTradingTabs({
  activePanel,
  onChange,
}: {
  activePanel: MobileTradingPanel;
  onChange: (panel: MobileTradingPanel) => void;
}) {
  return (
    <div className="relative z-10 border-b border-white/10 bg-[#020817]/92 px-2 py-2 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-4 gap-1 rounded-lg border border-white/10 bg-[#061124]/85 p-1">
        {mobilePanels.map((panel) => {
          const Icon = panel.icon;
          const selected = activePanel === panel.value;

          return (
            <button
              key={panel.value}
              type="button"
              onClick={() => onChange(panel.value)}
              className={`flex h-10 min-w-0 items-center justify-center gap-1 rounded-md px-1 text-[10px] font-black uppercase tracking-tight transition-all active:scale-[0.98] ${
                selected
                  ? "bg-primary/15 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">{panel.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
