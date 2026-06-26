"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Order } from "@/types";
import { OpenPosition } from "../types/position";
import { cn } from "@/lib/utils";
import { useCancelOrder, useOpenPositions, useOrders, useOptionChain, useCreateOrder } from "../hooks";
import { useClosedTrades } from "@/features/portfolio/hooks";
import { buildPricePayload, buildOptionRows } from "../utils/terminal-context";
import { BackendMarket } from "@/lib/adapters/market.adapter";
import { Match } from "@/types";
import { useTerminalStore } from "@/stores/terminal.store";

interface TradingActivityPanelProps {
  matchId: string;
  marketId: string;
  market?: BackendMarket;
  match?: Match;
  className?: string;
}

type ActivityTab = "ORDERS" | "POSITIONS";

export function TradingActivityPanel({ className, matchId, marketId, market, match }: TradingActivityPanelProps) {
  const [tab, setTab] = useState<ActivityTab>("ORDERS");
  const { data: orders = [], isFetching: ordersFetching, isLoading: ordersLoading } = useOrders(matchId);
  const { data: positions = [], isFetching: positionsFetching, isLoading: positionsLoading } = useOpenPositions();
  const cancelOrderMutation = useCancelOrder(matchId);

  // Live option chain for real-time PnL computation
  const payload = useMemo(() => buildPricePayload(match, market), [match, market]);
  const { data: calculated } = useOptionChain(marketId, payload);
  const chainRows = useMemo(() => buildOptionRows(calculated, market), [calculated, market]);

  const marketOrders = useMemo(
    () => orders.filter((order) => order.marketId === marketId && order.strike > 0 && order.quantity > 0),
    [marketId, orders]
  );
  const marketPositions = useMemo(
    () => positions.filter((position) => position.marketId === marketId && position.strike > 0 && position.lots !== 0),
    [marketId, positions]
  );
  
  const { data: allClosedTrades = [] } = useClosedTrades();
  const marketClosedTrades = useMemo(
    () => allClosedTrades.filter(t => t.marketId === marketId),
    [allClosedTrades, marketId]
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
        "relative flex min-h-0 flex-col overflow-hidden rounded-xl border border-cyan-300/12 bg-[#040a17]/94 shadow-[0_22px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl",
        className
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-300/55 to-transparent" />
      <div className="relative flex shrink-0 items-center justify-between border-b border-white/8 bg-[#071124]/92 px-2.5 py-2">
        <div className="min-w-0">
          <h3 className="truncate text-[12px] font-black text-on-surface">Orders & Positions</h3>
          <p className="truncate text-[10px] text-cyan-100/62">Live order status and open positions</p>
        </div>
        <span className={`rounded border px-2 py-0.5 text-[9px] font-black ${
          isSyncing ? "border-[#FFB300]/25 bg-[#FFB300]/10 text-[#FFB300]" : "border-primary/20 bg-primary/10 text-primary"
        }`}>
          {isSyncing ? "SYNCING" : "LIVE"}
        </span>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-1 border-b border-white/8 bg-[#071327] p-1">
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
          <PositionsTab loading={positionsLoading} positions={marketPositions} closedTrades={marketClosedTrades} chainRows={chainRows} />
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
          ? "bg-primary/15 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
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
  const router = import("next/navigation").then(m => m.useRouter);
  const { useRouter } = require("next/navigation");
  const nextRouter = useRouter();

  if (loading) return <PanelState label="Loading orders..." />;
  if (orders.length === 0) return <PanelState label="No orders for this market yet" />;

  const sortedOrders = [...orders].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const displayedOrders = sortedOrders.slice(0, 10);
  const hasMore = sortedOrders.length > 10;

  return (
    <div className="space-y-1.5 flex flex-col h-full">
      <div className="space-y-1.5">
        {displayedOrders.map((order) => (
          <div key={order.id} className={`rounded-lg border px-2.5 py-2 ${order.status === "FILLED" ? "border-bull-green/20 bg-bull-green/8" : "border-white/8 bg-[#071327]/72"}`}>
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
      <button
        type="button"
        onClick={() => nextRouter.push("/portfolio")}
        className="mt-2 w-full rounded border border-white/10 bg-white/5 py-2 text-[10px] font-black text-on-surface transition-colors hover:bg-white/10"
      >
        View All Orders →
      </button>
    </div>
  );
}

import { Search, ChevronUp, ChevronDown } from "lucide-react";

function PositionsTab({ loading, positions, closedTrades, chainRows }: { loading: boolean; positions: OpenPosition[]; closedTrades: any[]; chainRows: ReturnType<typeof buildOptionRows> }) {
  const setOrderIntent = useTerminalStore((state) => state.setOrderIntent);
  const setOrderSize = useTerminalStore((state) => state.setOrderSize);
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [openExpanded, setOpenExpanded] = useState(true);
  const [closedExpanded, setClosedExpanded] = useState(true);

  if (loading) return <PanelState label="Loading positions..." />;

  // Calculate live open PnL
  let openPnL = 0;
  const enrichedPositions = positions.map(position => {
    const chainRow = chainRows.find((row) => row.strike === position.strike);
    const liveLtp = chainRow ? (position.lots > 0 ? chainRow.bid : chainRow.ask) : position.ltp;
    const livePnl = chainRow ? Math.round((liveLtp - position.buyPrice) * position.lots * 100) / 100 : position.pnl;
    openPnL += livePnl;
    return { ...position, liveLtp, livePnl, chainRow };
  });

  const closedPnL = closedTrades.reduce((acc, t) => acc + t.realizedPnL, 0);
  const totalPnL = openPnL + closedPnL;

  const filteredOpen = enrichedPositions.filter(p => !search || p.strike.toString().includes(search));
  const filteredClosed = closedTrades.filter(t => !search || t.symbol.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-3 h-full overflow-y-auto scrollbar-hide pb-4">
      {/* Open Positions Accordion */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase text-on-surface">Open Position</span>
          </div>
          <button onClick={() => setOpenExpanded(!openExpanded)} className="text-on-surface-variant hover:text-white">
            {openExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {openExpanded && (
          <div className="space-y-1.5">
            {filteredOpen.length === 0 ? (
              <PanelState label="No open positions found" />
            ) : (
              filteredOpen.map((position) => {
                const positive = position.livePnl >= 0;
                return (
                  <div key={position._id} className="rounded-lg border border-white/8 bg-[#040a17]/50 px-2.5 py-2 hover:bg-[#040a17] transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="font-data-tabular text-[11px] font-black text-on-surface">
                          Strike {position.strike}
                        </span>
                        <span className="text-[10px] font-semibold text-on-surface-variant px-1 rounded bg-white/5 border border-white/5">{Math.abs(position.lots)} lots</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-data-tabular text-[12px] font-black ${positive ? "text-bull-green" : "text-bear-red"}`}>
                          {positive ? "+" : "-"}Rs {Math.abs(position.livePnl).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (closingPositionId === position._id) {
                              setClosingPositionId(null);
                            } else {
                              setClosingPositionId(position._id);
                              setOrderIntent({
                                side: position.lots > 0 ? "SELL" : "BUY",
                                strike: position.strike,
                                price: position.liveLtp,
                              });
                              setOrderSize(Math.abs(position.lots));
                            }
                          }}
                          className="rounded border border-white/20 bg-white/5 px-2 py-0.5 text-[9px] font-black text-on-surface hover:bg-white/10 active:scale-95 transition-all"
                        >
                          {closingPositionId === position._id ? "Cancel" : "Close"}
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 font-data-tabular text-[10px] text-center">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] text-on-surface-variant uppercase font-black">Lots</span>
                        <span className="text-on-surface font-bold">{Math.abs(position.lots)}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] text-on-surface-variant uppercase font-black">LTP</span>
                        <span className={`font-bold ${position.chainRow ? "text-teal-300" : "text-on-surface"}`}>{position.liveLtp.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] text-on-surface-variant uppercase font-black">Buy price</span>
                        <span className="text-on-surface font-bold">₹{position.lots > 0 ? position.buyPrice.toFixed(2) : '--'}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] text-on-surface-variant uppercase font-black">Sell price</span>
                        <span className="text-on-surface font-bold">₹{position.lots < 0 ? position.buyPrice.toFixed(2) : '--'}</span>
                      </div>
                    </div>
                    
                    {closingPositionId === position._id && (
                      <InlinePositionCloseForm 
                        position={position} 
                        liveLtp={position.liveLtp} 
                        chainRow={position.chainRow} 
                        onCancel={() => setClosingPositionId(null)} 
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Closed Positions Accordion */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase text-on-surface">Closed Position</span>
          <button onClick={() => setClosedExpanded(!closedExpanded)} className="text-on-surface-variant hover:text-white">
            {closedExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {closedExpanded && (
          <div className="space-y-1.5">
            {filteredClosed.length === 0 ? (
              <PanelState label="No closed positions" />
            ) : (
              filteredClosed.map((trade) => {
                const positive = trade.realizedPnL >= 0;
                return (
                  <div key={trade.orderId} className="rounded-lg border border-white/8 bg-[#040a17]/30 px-2.5 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-data-tabular text-[11px] font-black text-on-surface">
                          {trade.symbol}
                        </span>
                        <span className="text-[9px] text-on-surface-variant mt-0.5">
                          {new Date(trade.openedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <span className={`font-data-tabular text-[12px] font-black ${positive ? "text-bull-green" : "text-bear-red"}`}>
                        {positive ? "+" : "-"}Rs {Math.abs(trade.realizedPnL).toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-2 font-data-tabular text-[10px] text-center opacity-80">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] text-on-surface-variant uppercase font-black">Lots</span>
                        <span className="text-on-surface font-bold">{Math.abs(trade.quantity)}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] text-on-surface-variant uppercase font-black">LTP</span>
                        <span className="text-on-surface font-bold">{trade.exitPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] text-on-surface-variant uppercase font-black">Buy price</span>
                        <span className="text-on-surface font-bold">₹{trade.entryPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] text-on-surface-variant uppercase font-black">Sell price</span>
                        <span className="text-on-surface font-bold">₹{trade.exitPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InlinePositionCloseForm({
  position,
  liveLtp,
  chainRow,
  onCancel,
}: {
  position: OpenPosition;
  liveLtp: number;
  chainRow: any;
  onCancel: () => void;
}) {
  const [type, setType] = useState<"MARKET" | "LIMIT">("MARKET");
  const maxQty = Math.abs(position.lots);
  const [qty, setQty] = useState<number>(maxQty);
  const [price, setPrice] = useState<number>(liveLtp);
  
  const isLong = position.lots > 0;
  const side = isLong ? "sell" : "buy";
  const actionText = side === "sell" ? "Sell" : "Buy";
  const { mutate: createOrder, isPending } = useCreateOrder();
  
  const handleSubmit = () => {
    createOrder(
      {
        matchId: position.matchId,
        marketId: position.marketId,
        strike: position.strike,
        side,
        type,
        quantity: qty,
        price: type === "MARKET" ? 0 : price,
      },
      {
        onSuccess: () => {
          toast.success(`Successfully placed ${side} order to close position`);
          onCancel();
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, "Failed to place order"));
        }
      }
    );
  };

  return (
    <div className="mt-3 rounded-lg border border-white/10 bg-[#040a17] p-3 shadow-inner space-y-3">
      <div className="flex rounded border border-white/10 bg-[#071327] p-0.5">
        <button
          onClick={() => setType("MARKET")}
          className={`flex-1 rounded-sm py-1.5 text-[10px] font-black uppercase transition-colors ${type === "MARKET" ? (side === "sell" ? "bg-bear-red text-white" : "bg-bull-green text-white") : "text-on-surface-variant hover:text-white"}`}
        >
          MARKET
        </button>
        <button
          onClick={() => setType("LIMIT")}
          className={`flex-1 rounded-sm py-1.5 text-[10px] font-black uppercase transition-colors ${type === "LIMIT" ? "bg-white/10 text-white" : "text-on-surface-variant hover:text-white"}`}
        >
          LIMIT
        </button>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 space-y-1.5">
          <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider">QTY (MAX {maxQty})</label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 0)))}
            className="w-full rounded border border-white/10 bg-[#071327] px-2 py-2 text-[12px] font-data-tabular font-bold text-white outline-none focus:border-cyan-500/50"
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider">{side === "sell" ? "BID" : "ASK"} (APPROX)</label>
          <input
            type="number"
            value={type === "MARKET" ? liveLtp : price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            disabled={type === "MARKET"}
            className="w-full rounded border border-white/10 bg-[#071327] px-2 py-2 text-[12px] font-data-tabular font-bold text-white outline-none focus:border-cyan-500/50 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSubmit}
          disabled={isPending || qty <= 0}
          className={`flex-[2] rounded py-2 text-[11px] font-black text-white transition-colors disabled:opacity-50 ${side === "sell" ? "bg-bear-red hover:bg-bear-red/80" : "bg-bull-green hover:bg-bull-green/80"}`}
        >
          {isPending ? "Executing..." : actionText}
        </button>
        <button
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 rounded border border-white/10 bg-[#071327] px-3 py-2 text-[11px] font-black text-white transition-colors hover:bg-white/10 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function PanelState({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[100px] items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/2.5 text-center text-[11px] font-semibold text-on-surface-variant">
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
