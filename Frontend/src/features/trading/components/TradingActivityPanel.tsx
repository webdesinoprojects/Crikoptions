"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Order } from "@/types";
import { OpenPosition } from "../types/position";
import { cn } from "@/lib/utils";
import { useCancelOrder, useOpenPositions, useOrders } from "../hooks";

interface TradingActivityPanelProps {
  matchId: string;
  marketId: string;
  className?: string;
}

type ActivityTab = "ORDERS" | "POSITIONS";

export function TradingActivityPanel({ className, matchId, marketId }: TradingActivityPanelProps) {
  const [tab, setTab] = useState<ActivityTab>("ORDERS");
  const { data: orders = [], isFetching: ordersFetching, isLoading: ordersLoading } = useOrders(matchId);
  const { data: positions = [], isFetching: positionsFetching, isLoading: positionsLoading } = useOpenPositions();
  const cancelOrderMutation = useCancelOrder(matchId);

  const marketOrders = useMemo(
    () => orders.filter((order) => order.marketId === marketId && order.strike > 0 && order.quantity > 0),
    [marketId, orders]
  );
  const marketPositions = useMemo(
    () => positions.filter((position) => position.marketId === marketId && position.strike > 0 && position.lots !== 0),
    [marketId, positions]
  );
  const isSyncing = ordersFetching || positionsFetching || cancelOrderMutation.isPending;

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
          <p className="truncate text-[10px] text-on-surface-variant">Live order status and open positions</p>
        </div>
        <span className={`rounded border px-2 py-0.5 text-[9px] font-black ${
          isSyncing ? "border-[#FFB300]/25 bg-[#FFB300]/10 text-[#FFB300]" : "border-primary/20 bg-primary/10 text-primary"
        }`}>
          {isSyncing ? "SYNCING" : "LIVE"}
        </span>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-1 border-b border-outline-variant bg-surface p-1">
        <TabButton active={tab === "ORDERS"} count={marketOrders.length} onClick={() => setTab("ORDERS")}>
          Orders
        </TabButton>
        <TabButton active={tab === "POSITIONS"} count={marketPositions.length} onClick={() => setTab("POSITIONS")}>
          Positions
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

  const sortedOrders = [...orders].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-1.5">
      {sortedOrders.map((order) => (
        <div key={order.id} className={`rounded-md border px-2 py-1.5 ${order.status === "FILLED" ? "border-bull-green/20 bg-bull-green/5" : "border-outline-variant/60 bg-surface"}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SidePill side={order.side} />
              <span className="font-data-tabular text-[11px] font-black text-on-surface-variant">
                Strike {formatStrike(order.strike)}
              </span>
              <span className="font-data-tabular text-[12px] font-black text-on-surface">
                Rs {(order.price ?? 0).toFixed(2)}
              </span>
            </div>
            <span className="font-data-tabular text-[11px] font-black text-on-surface">{order.quantity} lots</span>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-x-2 font-data-tabular text-[10px] text-on-surface-variant">
            <span>Done {order.filledQuantity}</span>
            <span className="text-right">Remaining {order.remainingQuantity}</span>
            <span>Avg price {order.averageFillPrice > 0 ? order.averageFillPrice.toFixed(2) : "--"}</span>
            <span className={`text-right font-black ${statusColor(order.status)}`}>{displayStatus(order.status)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-on-surface-variant">
            <span>{formatTime(order.createdAt)}</span>
            {isWorkingOrder(order) && (
              <button
                type="button"
                onClick={() => onCancel(order.id)}
                disabled={cancelling}
                className="rounded border border-bear-red/20 bg-bear-red/10 px-2 py-0.5 font-black text-bear-red disabled:opacity-50"
              >
                {cancelling ? "Cancelling" : "Cancel"}
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
    return <PanelState label="No open position yet. Positions appear after an order executes." />;
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
  if (status === "REJECTED") return "text-bear-red";
  return "text-[#FFB300]";
}

function displayStatus(status: Order["status"]) {
  if (status === "FILLED") return "EXECUTED";
  if (status === "PARTIAL") return "PARTIAL";
  return status;
}

function isWorkingOrder(order: Order) {
  return (order.status === "PENDING" || order.status === "PARTIAL") && order.remainingQuantity > 0 && order.strike > 0;
}

function formatStrike(strike: number) {
  return strike > 0 ? strike.toFixed(0) : "--";
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
