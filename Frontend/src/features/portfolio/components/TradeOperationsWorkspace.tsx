"use client";

import React, { useState } from "react";
import { Clock, ListChecks, ShieldCheck } from "lucide-react";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/features/trading/hooks";
import { Order } from "@/types";
import { usePositions } from "../hooks";
import { PortfolioPosition } from "../types/portfolio";

type TradeOpsTab = "POSITIONS" | "ORDERS";

export function TradeOperationsWorkspace() {
  const [tab, setTab] = useState<TradeOpsTab>("POSITIONS");
  const { data: positions = [], isLoading: positionsLoading } = usePositions();
  const { data: orders = [], isLoading: ordersLoading } = useOrders(undefined, true);

  const positionRows = positions.length > 0 ? positions : samplePositions;
  const orderRows = orders.length > 0 ? orders : sampleOrders;
  const isSample =
    (tab === "POSITIONS" && positions.length === 0) ||
    (tab === "ORDERS" && orders.length === 0);

  const totalExposure = positionRows.reduce((sum, position) => sum + position.notional, 0);
  const workingOrders = orderRows.filter((order) => order.status === "PENDING" || order.status === "PARTIAL").length;
  const executedOrders = orderRows.filter((order) => order.status === "FILLED").length;

  return (
    <TerminalPanel
      density="dense"
      title="Trade Operations"
      subtitle="Active positions and order status"
      className="min-h-[420px]"
      headerActions={
        <span className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase text-primary">
          {isSample ? "Sample" : "Live"}
        </span>
      }
      bodyClass="gap-3"
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <OpsMetric icon={<ShieldCheck className="h-4 w-4" />} label="Gross exposure" value={`Rs ${formatMoney(totalExposure)}`} />
        <OpsMetric icon={<Clock className="h-4 w-4" />} label="Working orders" value={String(workingOrders)} />
        <OpsMetric icon={<ListChecks className="h-4 w-4" />} label="Executed orders" value={executedOrders.toLocaleString("en-IN")} />
      </div>

      <div className="flex flex-wrap gap-1 rounded-md border border-outline/10 bg-surface-dim p-1">
        <TabButton active={tab === "POSITIONS"} onClick={() => setTab("POSITIONS")}>
          Open Positions
        </TabButton>
        <TabButton active={tab === "ORDERS"} onClick={() => setTab("ORDERS")}>
          Orders
        </TabButton>
      </div>

      <div className="h-[350px] overflow-hidden rounded-md border border-outline/10 bg-background/45">
        {tab === "POSITIONS" && (
          <PositionsScreen rows={positionRows} loading={positionsLoading && positions.length === 0} sample={positions.length === 0} />
        )}
        {tab === "ORDERS" && (
          <OrdersScreen rows={orderRows} loading={ordersLoading && orders.length === 0} sample={orders.length === 0} />
        )}
      </div>
    </TerminalPanel>
  );
}

function OpsMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-h-16 items-center gap-3 rounded-md border border-outline/10 bg-surface-dim px-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">{icon}</div>
      <div className="min-w-0">
        <div className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant">{label}</div>
        <div className="truncate font-data-tabular text-base font-black text-on-surface">{value}</div>
      </div>
    </div>
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
      className={`h-8 rounded px-3 text-[11px] font-black transition-colors ${
        active ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-bright hover:text-on-surface"
      }`}
    >
      {children}
    </button>
  );
}

function PositionsScreen({
  loading,
  rows,
  sample,
}: {
  loading: boolean;
  rows: PortfolioPosition[];
  sample: boolean;
}) {
  return (
    <div className="h-full overflow-auto bg-surface-dim/20">
      <table className="w-full min-w-[800px] border-collapse font-data-tabular text-[12px]">
        <thead className="sticky top-0 z-10 bg-surface-dim/95 backdrop-blur-md shadow-sm border-b border-outline/10 text-[10px] uppercase tracking-widest text-on-surface-variant font-black">
          <tr>
            <th className="px-4 py-3 text-left">Market</th>
            <th className="px-4 py-3 text-left">Match</th>
            <th className="px-4 py-3 text-center">Side</th>
            <th className="px-4 py-3 text-right">Qty</th>
            <th className="px-4 py-3 text-right">Entry</th>
            <th className="px-4 py-3 text-right">LTP</th>
            <th className="px-4 py-3 text-right">Unrealized</th>
            <th className="px-4 py-3 text-right">Risk</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline/5">
          {loading ? <LoadingRows columns={8} /> : null}
          {!loading &&
            rows.map((position, index) => {
              const positive = position.unrealizedPnL >= 0;
              return (
                <tr key={position.id || `${position.marketId}-${position.side}-${index}`} className="group hover:bg-white/[0.04] transition-all duration-200 cursor-default">
                  <td className="px-4 py-3 font-bold text-on-surface group-hover:text-primary transition-colors">
                    {position.symbol}
                    {sample && <span className="ml-2 inline-block px-1.5 py-0.5 bg-primary/10 text-primary text-[8px] rounded uppercase font-black tracking-widest border border-primary/20">SAMPLE</span>}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant font-medium">{position.matchName}</td>
                  <td className="px-4 py-3 text-center">
                    <SideBadge side={position.side} />
                  </td>
                  <td className="px-4 py-3 text-right text-on-surface font-semibold">{position.quantity.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-on-surface-variant font-medium">Rs {position.averageEntryPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-on-surface font-medium">Rs {position.currentPrice.toFixed(2)}</td>
                  <td className={`px-4 py-3 text-right font-black ${positive ? "text-bull-green drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "text-bear-red drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]"}`}>
                    {positive ? "+" : "-"}Rs {Math.abs(position.unrealizedPnL).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RiskBar value={position.allocation} />
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

function OrdersScreen({ loading, rows, sample }: { loading: boolean; rows: Order[]; sample: boolean }) {
  return (
    <div className="h-full overflow-auto bg-surface-dim/20">
      <table className="w-full min-w-[800px] border-collapse font-data-tabular text-[12px]">
        <thead className="sticky top-0 z-10 bg-surface-dim/95 backdrop-blur-md shadow-sm border-b border-outline/10 text-[10px] uppercase tracking-widest text-on-surface-variant font-black">
          <tr>
            <th className="px-4 py-3 text-left">Order ID / Time</th>
            <th className="px-4 py-3 text-left">Market</th>
            <th className="px-4 py-3 text-center">Action</th>
            <th className="px-4 py-3 text-center">Type</th>
            <th className="px-4 py-3 text-right">Limit Price</th>
            <th className="px-4 py-3 text-right">Quantity</th>
            <th className="px-4 py-3 text-right">Filled</th>
            <th className="px-4 py-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline/5">
          {loading ? <LoadingRows columns={8} /> : null}
          {!loading &&
            rows.map((order) => (
              <tr key={order.id} className="group hover:bg-white/[0.04] transition-all duration-200 cursor-default">
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-on-surface group-hover:text-primary transition-colors">{shortId(order.id)}</span>
                    <span className="text-[10px] text-on-surface-variant font-medium flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTime(order.createdAt)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-on-surface-variant">
                  <div className="font-semibold">{shortId(order.marketId)}</div>
                  {sample && <span className="inline-block mt-1 px-1.5 py-0.5 bg-primary/10 text-primary text-[8px] rounded uppercase font-black tracking-widest border border-primary/20">SAMPLE</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  <SideBadge side={order.side} />
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-surface border border-outline/10 text-[10px] text-on-surface-variant font-bold shadow-sm">{order.type}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="font-medium text-on-surface">Rs {(order.price ?? 0).toFixed(2)}</div>
                </td>
                <td className="px-4 py-3 text-right text-on-surface font-semibold">{order.quantity.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-on-surface-variant font-semibold">{order.filledQuantity.toLocaleString("en-IN")}</span>
                    {order.quantity > 0 && (
                      <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(order.filledQuantity / order.quantity) * 100}%` }} />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function LoadingRows({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <td key={columnIndex} className="px-4 py-3">
              <Skeleton className="h-4 w-full bg-white/5" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function SideBadge({ side }: { side: "BUY" | "SELL" }) {
  return (
    <span
      className={`inline-flex min-w-[56px] items-center justify-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-black shadow-sm transition-all ${
        side === "BUY"
          ? "border-bull-green/30 bg-[linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))] text-bull-green shadow-[0_0_10px_rgba(16,185,129,0.1)]"
          : "border-bear-red/30 bg-[linear-gradient(135deg,rgba(239,68,68,0.15),rgba(239,68,68,0.05))] text-bear-red shadow-[0_0_10px_rgba(239,68,68,0.1)]"
      }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${side === "BUY" ? "bg-bull-green shadow-[0_0_5px_rgba(16,185,129,0.8)]" : "bg-bear-red shadow-[0_0_5px_rgba(239,68,68,0.8)]"}`} />
      {side}
    </span>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const isFilled = status === "FILLED";
  const isCancelled = status === "CANCELLED";
  const isPartial = status === "PARTIAL";
  
  const className = isFilled
    ? "border-bull-green/30 bg-bull-green/10 text-bull-green shadow-[0_0_8px_rgba(16,185,129,0.15)]"
    : isCancelled
    ? "border-on-surface-variant/20 bg-surface text-on-surface-variant shadow-sm"
    : isPartial
    ? "border-primary/30 bg-primary/10 text-primary shadow-[0_0_8px_rgba(14,165,233,0.15)]"
    : "border-amber-400/30 bg-amber-400/10 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.15)]";

  return (
    <span className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 min-w-[70px] text-[10px] font-black tracking-wide ${className}`}>
      {isFilled && <div className="w-1 h-1 rounded-full bg-bull-green shadow-[0_0_5px_currentColor]" />}
      {!isFilled && !isCancelled && <div className="w-1 h-1 rounded-full animate-pulse bg-current shadow-[0_0_5px_currentColor]" />}
      {displayStatus(status)}
    </span>
  );
}

function displayStatus(status: Order["status"]) {
  if (status === "FILLED") return "EXECUTED";
  if (status === "PARTIAL") return "PARTIAL";
  return status;
}

function RiskBar({ value }: { value: number }) {
  const bounded = Math.min(100, Math.max(0, value));
  
  // Dynamic color based on concentration
  const isHighRisk = bounded > 40;
  const isMedRisk = bounded > 20;
  const colorClass = isHighRisk ? "bg-bear-red" : isMedRisk ? "bg-fuchsia-500" : "bg-primary";
  const glowClass = isHighRisk ? "shadow-[0_0_8px_rgba(239,68,68,0.6)]" : isMedRisk ? "shadow-[0_0_8px_rgba(217,70,239,0.6)]" : "shadow-[0_0_8px_rgba(14,165,233,0.6)]";
  
  return (
    <div className="inline-flex items-center justify-end gap-2.5 w-full">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/5 border border-white/5">
        <div className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass} ${glowClass}`} style={{ width: `${bounded}%` }} />
      </div>
      <span className={`w-10 text-right text-[10px] font-black ${isHighRisk ? "text-bear-red drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]" : "text-on-surface"}`}>{bounded.toFixed(1)}%</span>
    </div>
  );
}

function shortId(value: string) {
  if (!value) return "--";
  return value.length > 10 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatMoney(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

const now = new Date().toISOString();

const samplePositions: PortfolioPosition[] = [
  {
    id: "sample-position-csk-130-buy",
    marketId: "sample-csk-130",
    symbol: "CSK130",
    matchName: "CSK vs MI",
    side: "BUY",
    quantity: 40,
    averageEntryPrice: 18.4,
    currentPrice: 19.87,
    unrealizedPnL: 58.8,
    unrealizedPnLPct: 7.99,
    notional: 794.8,
    allocation: 42,
    openedAt: now,
  },
  {
    id: "sample-position-csk-150-sell",
    marketId: "sample-csk-150",
    symbol: "CSK150",
    matchName: "CSK vs MI",
    side: "SELL",
    quantity: 25,
    averageEntryPrice: 9.2,
    currentPrice: 8.7,
    unrealizedPnL: 12.5,
    unrealizedPnLPct: 5.43,
    notional: 217.5,
    allocation: 18,
    openedAt: now,
  },
  {
    id: "sample-position-dc-170-buy",
    marketId: "sample-dc-170",
    symbol: "DC170",
    matchName: "DC vs SRH",
    side: "BUY",
    quantity: 20,
    averageEntryPrice: 13.1,
    currentPrice: 12.2,
    unrealizedPnL: -18,
    unrealizedPnLPct: -6.87,
    notional: 244,
    allocation: 13,
    openedAt: now,
  },
];

const sampleOrders: Order[] = [
  {
    id: "ord-sample-001",
    matchId: "match-csk-mi",
    marketId: "CSK130",
    strike: 130,
    side: "BUY",
    type: "LIMIT",
    status: "PENDING",
    backendStatus: "open",
    price: 19.6,
    quantity: 20,
    filledQuantity: 0,
    remainingQuantity: 20,
    averageFillPrice: 0,
    createdAt: now,
  },
  {
    id: "ord-sample-002",
    matchId: "match-csk-mi",
    marketId: "CSK150",
    strike: 150,
    side: "SELL",
    type: "LIMIT",
    status: "PARTIAL",
    backendStatus: "partially_filled",
    price: 8.9,
    quantity: 30,
    filledQuantity: 12,
    remainingQuantity: 18,
    averageFillPrice: 8.9,
    createdAt: now,
  },
  {
    id: "ord-sample-003",
    matchId: "match-dc-srh",
    marketId: "DC170",
    strike: 170,
    side: "BUY",
    type: "LIMIT",
    status: "CANCELLED",
    backendStatus: "cancelled",
    price: 12.1,
    quantity: 15,
    filledQuantity: 0,
    remainingQuantity: 0,
    averageFillPrice: 0,
    createdAt: now,
  },
];

