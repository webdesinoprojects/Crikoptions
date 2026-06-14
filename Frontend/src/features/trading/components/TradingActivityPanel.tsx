"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Order } from "@/types";
import { Execution } from "../types/execution";
import { OpenPosition } from "../types/position";
import { cn } from "@/lib/utils";
import { useCancelOrder, useExecutions, useOpenPositions, useOrders } from "../hooks";

interface TradingActivityPanelProps {
  matchId: string;
  marketId: string;
  className?: string;
}

type ActivityTab = "ORDERS" | "POSITIONS" | "FILLS";

export function TradingActivityPanel({ className, matchId, marketId }: TradingActivityPanelProps) {
  const [tab, setTab] = useState<ActivityTab>("ORDERS");
  const { data: orders = [], isLoading: ordersLoading } = useOrders(matchId);
  const { data: executions = [], isLoading: executionsLoading } = useExecutions(matchId, marketId);
  const { data: positions = [], isLoading: positionsLoading } = useOpenPositions();
  const cancelOrderMutation = useCancelOrder(matchId);

  const marketOrders = useMemo(
    () => orders.filter((order) => order.marketId === marketId),
    [marketId, orders]
  );
  const workingOrders = useMemo(
    () => marketOrders.filter((order) => order.status === "PENDING" || order.status === "PARTIAL"),
    [marketOrders]
  );
  const marketPositions = useMemo(
    () => positions.filter((position) => position.marketId === marketId),
    [marketId, positions]
  );

  const handleCancel = (orderId: string) => {
    cancelOrderMutation.mutate(orderId, {
      onSuccess: () => toast.success("Order cancelled"),
      onError: (error: unknown) => toast.error(getErrorMessage(error, "Unable to cancel order")),
    });
  };

  return (
    <section
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest",
        className
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-outline-variant bg-surface px-2.5 py-1.5">
        <div className="min-w-0">
          <h3 className="truncate text-[12px] font-black text-on-surface">Orders & Positions</h3>
          <p className="truncate text-[10px] text-on-surface-variant">Live orders, fills, and open positions</p>
        </div>
        <span className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-black text-primary">
          LIVE
        </span>
      </div>

      <div className="grid shrink-0 grid-cols-3 gap-1 border-b border-outline-variant bg-surface p-1">
        <TabButton active={tab === "ORDERS"} count={workingOrders.length} onClick={() => setTab("ORDERS")}>
          Orders
        </TabButton>
        <TabButton active={tab === "POSITIONS"} count={marketPositions.length} onClick={() => setTab("POSITIONS")}>
          Positions
        </TabButton>
        <TabButton active={tab === "FILLS"} count={executions.length} onClick={() => setTab("FILLS")}>
          Fills
        </TabButton>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {tab === "ORDERS" && (
          <OrdersTab
            loading={ordersLoading}
            orders={marketOrders}
            cancelling={cancelOrderMutation.isPending}
            onCancel={handleCancel}
          />
        )}
        {tab === "POSITIONS" && (
          <PositionsTab loading={positionsLoading} positions={marketPositions} />
        )}
        {tab === "FILLS" && (
          <FillsTab loading={executionsLoading} executions={executions} />
        )}
      </div>
    </section>
  );
}

function TabButton({
  active,
  children,
  count,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-7 items-center justify-center gap-1 rounded text-[10px] font-black transition-colors ${
        active
          ? "bg-primary/15 text-primary"
          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
      }`}
    >
      <span>{children}</span>
      <span className="font-data-tabular opacity-80">({count})</span>
    </button>
  );
}

function OrdersTab({
  cancelling,
  loading,
  onCancel,
  orders,
}: {
  cancelling: boolean;
  loading: boolean;
  onCancel: (orderId: string) => void;
  orders: Order[];
}) {
  if (loading) return <PanelState label="Loading orders..." />;
  if (orders.length === 0) return <PanelState label="No orders for this market yet" />;

  return (
    <div className="space-y-1.5">
      {orders.map((order) => (
        <div key={order.id} className="rounded-md border border-outline-variant/60 bg-surface px-2 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SidePill side={order.side} />
              <span className="font-data-tabular text-[11px] font-black text-on-surface-variant">
                Strike {order.strike}
              </span>
              <span className="font-data-tabular text-[12px] font-black text-on-surface">
                Rs {(order.price ?? 0).toFixed(2)}
              </span>
            </div>
            <span className="font-data-tabular text-[11px] font-black text-on-surface">{order.quantity} lots</span>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-x-2 font-data-tabular text-[10px] text-on-surface-variant">
            <span>Filled {order.filledQuantity}</span>
            <span className="text-right">Remaining {order.remainingQuantity}</span>
            <span>Avg {order.averageFillPrice > 0 ? order.averageFillPrice.toFixed(2) : "--"}</span>
            <span className={`text-right font-black ${statusColor(order.status)}`}>{order.status}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-on-surface-variant">
            <span>{formatTime(order.createdAt)}</span>
            {(order.status === "PENDING" || order.status === "PARTIAL") && (
              <button
                type="button"
                onClick={() => onCancel(order.id)}
                disabled={cancelling}
                className="rounded border border-bear-red/20 bg-bear-red/10 px-2 py-0.5 font-black text-bear-red disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function PositionsTab({ loading, positions }: { loading: boolean; positions: OpenPosition[] }) {
  if (loading) return <PanelState label="Loading positions..." />;
  if (positions.length === 0) {
    return <PanelState label="No open position yet. Positions appear after the first fill." />;
  }

  return (
    <div className="space-y-1.5">
      {positions.map((position) => {
        const positive = position.pnl >= 0;
        return (
          <div key={position._id} className="rounded-md border border-outline-variant/60 bg-surface px-2 py-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="font-data-tabular text-[11px] font-black text-on-surface">
                  Strike {position.strike}
                </span>
                <span className="text-[10px] text-on-surface-variant">{position.lots} lots</span>
              </div>
              <span className={`font-data-tabular text-[12px] font-black ${positive ? "text-bull-green" : "text-bear-red"}`}>
                {positive ? "+" : "-"}Rs {Math.abs(position.pnl).toFixed(2)}
              </span>
            </div>
            <div className="mt-1 grid grid-cols-3 gap-2 font-data-tabular text-[10px] text-on-surface-variant">
              <span>Buy {position.buyPrice.toFixed(2)}</span>
              <span>LTP {position.ltp.toFixed(2)}</span>
              <span className="text-right">PnL {position.pnl.toFixed(2)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FillsTab({ loading, executions }: { loading: boolean; executions: Execution[] }) {
  if (loading) return <PanelState label="Loading fills..." />;
  if (executions.length === 0) {
    return <PanelState label="No executions yet. Fills appear when orders execute." />;
  }

  return (
    <div className="space-y-1">
      {executions.map((execution) => (
        <div
          key={execution._id}
          className="grid grid-cols-[46px_1fr_52px] rounded bg-surface px-2 py-1 font-data-tabular text-[11px]"
        >
          <span className="text-on-surface-variant">{formatTime(execution.createdAt)}</span>
          <span className={execution.side === "sell" ? "font-black text-bear-red" : "font-black text-bull-green"}>
            {execution.side.toUpperCase()} {execution.strike} @ {execution.price.toFixed(2)}
          </span>
          <span className="text-right text-on-surface">{execution.quantity}</span>
        </div>
      ))}
    </div>
  );
}

function PanelState({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[100px] items-center justify-center rounded-md border border-dashed border-outline-variant text-center text-[11px] font-semibold text-on-surface-variant">
      {label}
    </div>
  );
}

function SidePill({ side }: { side: "BUY" | "SELL" }) {
  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[9px] font-black ${
        side === "BUY"
          ? "border-bull-green/25 bg-bull-green/10 text-bull-green"
          : "border-bear-red/25 bg-bear-red/10 text-bear-red"
      }`}
    >
      {side}
    </span>
  );
}

function statusColor(status: Order["status"]) {
  if (status === "FILLED") return "text-bull-green";
  if (status === "PARTIAL") return "text-primary";
  if (status === "CANCELLED") return "text-on-surface-variant";
  return "text-[#FFB300]";
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getErrorMessage(error: unknown, defaultMessage: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }
  return defaultMessage;
}
