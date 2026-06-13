"use client";

import React, { useMemo, useState } from "react";
import { usePositions } from "@/features/portfolio/hooks";
import { cn } from "@/lib/utils";
import { useMarketDepth, useOrders, useTradeHistory } from "../hooks";

interface TradingActivityPanelProps {
  matchId: string;
  marketId: string;
  className?: string;
}

type ActivityTab = "TRADES" | "EXPOSURE" | "ORDERS" | "DEPTH";

export function TradingActivityPanel({ className, matchId, marketId }: TradingActivityPanelProps) {
  const [tab, setTab] = useState<ActivityTab>("ORDERS");
  const { data: trades = [] } = useTradeHistory(marketId);
  const { data: orders = [] } = useOrders(matchId);
  const { data: depth } = useMarketDepth(marketId);
  const { data: positions = [] } = usePositions();

  const filteredOrders = useMemo(() => orders.filter((order) => order.marketId === marketId), [marketId, orders]);
  const filteredPositions = useMemo(
    () => positions.filter((position) => position.marketId === marketId),
    [marketId, positions]
  );

  return (
    <section
      className={cn(
        "flex h-[240px] flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest",
        className
      )}
    >
      <div className="flex border-b border-outline-variant bg-surface px-3">
        <TabButton active={tab === "TRADES"} onClick={() => setTab("TRADES")}>Trade History</TabButton>
        <TabButton active={tab === "EXPOSURE"} onClick={() => setTab("EXPOSURE")}>Exposure</TabButton>
        <TabButton active={tab === "ORDERS"} onClick={() => setTab("ORDERS")}>Open Orders</TabButton>
        <TabButton active={tab === "DEPTH"} onClick={() => setTab("DEPTH")}>Market Depth</TabButton>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {tab === "ORDERS" && <OrdersTable orders={filteredOrders} />}
        {tab === "TRADES" && <TradesTable trades={trades} />}
        {tab === "EXPOSURE" && <ExposureTable positions={filteredPositions} />}
        {tab === "DEPTH" && <DepthTable bids={depth?.bids ?? []} asks={depth?.asks ?? []} />}
      </div>
    </section>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
        active ? "border-cyan-400 text-cyan-200" : "border-transparent text-on-surface-variant hover:text-on-surface"
      }`}
    >
      {children}
    </button>
  );
}

function OrdersTable({
  orders,
}: {
  orders: Array<{ id: string; createdAt: string; side: "BUY" | "SELL"; price?: number; quantity: number; status: string }>;
}) {
  if (orders.length === 0) return <EmptyState label="No open orders" />;

  return (
    <table className="w-full text-left font-data-tabular text-[12px]">
      <thead className="text-[11px] uppercase text-on-surface-variant">
        <tr>
          <th className="pb-2">Time</th>
          <th className="pb-2">Side</th>
          <th className="pb-2 text-right">Price</th>
          <th className="pb-2 text-right">Qty</th>
          <th className="pb-2 text-right">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/60">
        {orders.map((order) => (
          <tr key={order.id}>
            <td className="py-2 text-on-surface-variant">{formatTime(order.createdAt)}</td>
            <td className={`py-2 font-black ${order.side === "BUY" ? "text-teal-300" : "text-red-400"}`}>{order.side}</td>
            <td className="py-2 text-right">{order.price?.toFixed(2) ?? "-"}</td>
            <td className="py-2 text-right">{order.quantity.toLocaleString()}</td>
            <td className="py-2 text-right text-cyan-300">{order.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TradesTable({
  trades,
}: {
  trades: Array<{ id: string; timestamp: string; makerSide?: "BUY" | "SELL"; price: number; quantity: number }>;
}) {
  if (trades.length === 0) return <EmptyState label="No trades yet" />;

  return (
    <table className="w-full text-left font-data-tabular text-[12px]">
      <thead className="text-[11px] uppercase text-on-surface-variant">
        <tr>
          <th className="pb-2">Time</th>
          <th className="pb-2">Side</th>
          <th className="pb-2 text-right">Price</th>
          <th className="pb-2 text-right">Qty</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/60">
        {trades.map((trade) => (
          <tr key={trade.id}>
            <td className="py-2 text-on-surface-variant">{formatTime(trade.timestamp)}</td>
            <td className={`py-2 font-black ${trade.makerSide === "SELL" ? "text-red-400" : "text-teal-300"}`}>
              {trade.makerSide ?? "BUY"}
            </td>
            <td className="py-2 text-right">{trade.price.toFixed(2)}</td>
            <td className="py-2 text-right">{trade.quantity.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ExposureTable({
  positions,
}: {
  positions: Array<{ marketId: string; symbol: string; side: "BUY" | "SELL"; quantity: number; averageEntryPrice: number; unrealizedPnL: number }>;
}) {
  if (positions.length === 0) return <EmptyState label="No active exposure" />;

  return (
    <table className="w-full text-left font-data-tabular text-[12px]">
      <thead className="text-[11px] uppercase text-on-surface-variant">
        <tr>
          <th className="pb-2">Asset</th>
          <th className="pb-2">Side</th>
          <th className="pb-2 text-right">Avg</th>
          <th className="pb-2 text-right">Qty</th>
          <th className="pb-2 text-right">PnL</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/60">
        {positions.map((position) => (
          <tr key={position.marketId}>
            <td className="py-2 font-black">{position.symbol}</td>
            <td className={`py-2 font-black ${position.side === "BUY" ? "text-teal-300" : "text-red-400"}`}>{position.side}</td>
            <td className="py-2 text-right">{position.averageEntryPrice.toFixed(2)}</td>
            <td className="py-2 text-right">{position.quantity.toLocaleString()}</td>
            <td className={`py-2 text-right font-black ${position.unrealizedPnL >= 0 ? "text-teal-300" : "text-red-400"}`}>
              {position.unrealizedPnL.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DepthTable({
  asks,
  bids,
}: {
  asks: Array<{ price: number; quantity: number }>;
  bids: Array<{ price: number; quantity: number }>;
}) {
  if (asks.length === 0 && bids.length === 0) return <EmptyState label="No market depth" />;

  return (
    <div className="grid grid-cols-2 gap-4 font-data-tabular text-[12px]">
      <DepthSide label="Bids" rows={bids.slice(0, 5)} tone="bid" />
      <DepthSide label="Asks" rows={asks.slice(0, 5)} tone="ask" />
    </div>
  );
}

function DepthSide({
  label,
  rows,
  tone,
}: {
  label: string;
  rows: Array<{ price: number; quantity: number }>;
  tone: "bid" | "ask";
}) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-black uppercase text-on-surface-variant">{label}</div>
      <div className="space-y-1">
        {rows.map((row, index) => (
          <div key={`${tone}-${index}`} className="flex justify-between rounded bg-surface px-2 py-1">
            <span className={tone === "bid" ? "text-teal-300" : "text-red-400"}>{row.price.toFixed(2)}</span>
            <span className="text-on-surface-variant">{row.quantity.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[120px] items-center justify-center rounded border border-dashed border-outline-variant text-sm font-semibold text-on-surface-variant">
      {label}
    </div>
  );
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--:--";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
