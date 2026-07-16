"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, Loader2, RadioTower, ShieldAlert } from "lucide-react";
import { useLiveTicker } from "@/features/dashboard/hooks";

export default function TradingIndexPage() {
  const router = useRouter();
  const { data: tickers = [], isLoading } = useLiveTicker();
  const firstMarketId = tickers[0]?.id;

  React.useEffect(() => {
    if (firstMarketId) {
      router.replace(`/trading/${firstMarketId}`);
    }
  }, [firstMarketId, router]);

  return (
    <main className="noise-overlay relative flex min-h-[calc(100dvh-3.5rem)] flex-grow items-center justify-center overflow-hidden bg-[#01040a] p-6 text-on-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.18),transparent_38%),radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.12),transparent_42%)]"
      />

      <section className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-[#071327]/95 p-6 text-center shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <RadioTower className="h-6 w-6" />}
        </div>

        <h1 className="mt-5 font-display text-2xl font-black text-white">
          {isLoading ? "Finding live markets" : "No live trading market right now"}
        </h1>

        <p className="mt-3 text-sm font-semibold leading-6 text-on-surface-variant">
          {isLoading
            ? "Checking Sportmonks provider markets..."
            : "The terminal opens automatically when an eligible Sportmonks fixture has an open market. This database is live-only, so sample markets are intentionally hidden."}
        </p>

        {!isLoading && (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-4 text-sm font-black text-cyan-100 hover:bg-cyan-300/15"
            >
              <Activity className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/admin"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-amber-300/25 bg-amber-300/10 px-4 text-sm font-black text-amber-100 hover:bg-amber-300/15"
            >
              <ShieldAlert className="h-4 w-4" />
              Admin status
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
