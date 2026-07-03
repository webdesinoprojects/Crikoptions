import React, { useCallback, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Loader2, RotateCcw, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/features/wallet/hooks";
import { useTerminalStore } from "@/stores/terminal.store";
import type { Match, Order } from "@/types";
import { terminalPollInterval } from "../hooks/query-keys";
import { useCreateOrder, useMarketDetail, useOptionChain, useOrderPreview } from "../hooks";
import { buildOptionRows, buildPricePayload, findAtmRow } from "../utils/terminal-context";
import { formatMoney, formatTime } from "@/utils/format";

interface OrderEntryFormProps {
  matchId: string;
  marketId: string;
  match?: Match;
}

type OrderMode = "LIMIT" | "MARKET";

const EXECUTION_PRICE_EPSILON = 0.005;



export function OrderEntryForm({ matchId, marketId, match }: OrderEntryFormProps) {
  const [type, setType] = useState<OrderMode>("LIMIT");
  const [priceOverride, setPriceOverride] = useState<{ key: string; value: string } | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [lastOrderTime, setLastOrderTime] = useState<Date | null>(null);

  const orderSize = useTerminalStore((state) => state.orderSize);
  const [qtyOverride, setQtyOverride] = useState<string | null>(null);
  const qty = qtyOverride ?? String(orderSize);

  const selectedPriceStore = useTerminalStore((state) => state.selectedPrice);
  const selectedSideStore = useTerminalStore((state) => state.selectedSide);
  const setSelectedSide = useTerminalStore((state) => state.setSelectedSide);
  const setOrderIntent = useTerminalStore((state) => state.setOrderIntent);
  const selectedStrike = useTerminalStore((state) => state.selectedStrike);

  const { data: market } = useMarketDetail(marketId);
  const { data: wallet } = useWallet(true, terminalPollInterval);
  const payload = useMemo(() => buildPricePayload(match, market), [match, market]);
  const { data: calculated } = useOptionChain(marketId, payload);
  const rows = useMemo(() => buildOptionRows(calculated, market), [calculated, market]);
  const rowMap = useMemo(() => new Map(rows.map(r => [r.strike, r])), [rows]);
  const atmRow = useMemo(() => findAtmRow(rows), [rows]);
  const selectedRow = useMemo(
    () => (selectedStrike == null ? atmRow : rowMap.get(selectedStrike)),
    [atmRow, rowMap, selectedStrike]
  );
  const { isPending: isCreatingOrder, mutate: createOrder } = useCreateOrder();

  const side = selectedSideStore ?? "BUY";
  const quoteBid = selectedRow?.bid ?? 0;
  const quoteAsk = selectedRow?.ask ?? 0;
  const routedPrice = side === "BUY" ? quoteAsk : quoteBid;
  const backendPrice = routedPrice || selectedPriceStore || market?.ltp || market?.buyerPrice || market?.sellerPrice || 0;
  const selectedStrikeValue = selectedRow?.strike ?? selectedStrike ?? null;
  const priceKey = `${marketId}:${selectedStrikeValue ?? "market"}:${side}`;
  const displayPrice = priceOverride?.key === priceKey ? priceOverride.value : backendPrice > 0 ? backendPrice.toFixed(2) : "";
  const priceValue = type === "MARKET" ? backendPrice : Number.parseFloat(displayPrice) || 0;
  const qtyValue = Number.parseInt(qty, 10) || 0;
  const hasExecutableQuote = Boolean(selectedRow && routedPrice > 0);
  const isMarketOrder = type === "MARKET";
  const isLimitWithQuote = type === "LIMIT" && hasExecutableQuote;
  const buyWithinSpread = side === "BUY" ? priceValue + EXECUTION_PRICE_EPSILON >= quoteAsk : priceValue - EXECUTION_PRICE_EPSILON <= quoteBid;
  const previewPayload = useMemo(() => {
    if (!matchId || !marketId || !selectedStrikeValue || qtyValue <= 0) return undefined;
    if (type === "LIMIT" && priceValue <= 0) return undefined;

    return {
      matchId,
      marketId,
      strike: selectedStrikeValue,
      side: side.toLowerCase() as "buy" | "sell",
      type,
      quantity: qtyValue,
      price: priceValue,
      pricingSnapshot: payload,
    };
  }, [marketId, matchId, payload, priceValue, qtyValue, selectedStrikeValue, side, type]);
  const { data: orderPreview } = useOrderPreview(previewPayload);
  const localNotional = roundMoney(priceValue * qtyValue);
  const notional = localNotional;
  const cashRequired = side === "BUY" ? localNotional : 0;
  const availableBalance = orderPreview?.availableBalance ?? wallet?.availableBalance ?? 0;
  const showBalanceWarning = side === "BUY" && cashRequired > availableBalance;
  const willExecuteNow = isMarketOrder || (isLimitWithQuote && buyWithinSpread);
  const submitDisabled =
    isCreatingOrder ||
    !matchId ||
    !marketId ||
    !selectedStrikeValue ||
    (type === "MARKET" && !hasExecutableQuote);

  React.useEffect(() => {
    if (selectedStrike != null || !atmRow) return;

    setOrderIntent({
      side,
      strike: atmRow.strike,
      price: side === "BUY" ? atmRow.ask : atmRow.bid,
      source: "auto",
    });
  }, [atmRow, selectedStrike, setOrderIntent, side]);

  const alignLimitToQuote = useCallback(() => {
    if (!hasExecutableQuote) return;
    setPriceOverride(null);
  }, [hasExecutableQuote]);

  const resetTicket = useCallback(() => {
    setPriceOverride(null);
    setQtyOverride(null);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!matchId || !marketId) {
      toast.error("No backend market context available");
      return;
    }
    if (!selectedStrikeValue) {
      toast.error("Select a strike from the option chain before placing an order");
      return;
    }
    if (qtyValue <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    if (type === "MARKET" && !hasExecutableQuote) {
      toast.error("No executable quote is available for this strike");
      return;
    }
    if (priceValue <= 0) {
      toast.error(type === "MARKET" ? "No executable quote is available" : "Please enter a valid price");
      return;
    }
    createOrder(
      {
        matchId,
        marketId,
        strike: selectedStrikeValue,
        side: side.toLowerCase() as "buy" | "sell",
        type,
        quantity: qtyValue,
        price: priceValue,
      },
      {
        onSuccess: (data) => {
          setLastOrder(data);
          setLastOrderTime(new Date());

          if (data.status === "FILLED") {
            toast.success(`Executed: ${side} ${qtyValue} @ strike ${selectedStrikeValue} - Rs ${formatMoney(data.averageFillPrice || data.price || 0)}`);
          } else if (data.status === "PARTIAL") {
            toast.success(`Partially executed: ${data.filledQuantity}/${data.quantity} lots - ${data.remainingQuantity} remaining`);
          } else {
            toast.success(
              side === "BUY"
                ? `Working order: limit Rs ${formatMoney(data.price ?? 0)} is below market ask.`
                : `Working order: limit Rs ${formatMoney(data.price ?? 0)} is above market bid.`
            );
          }
          setQtyOverride(null);
        },
        onError: (error: unknown) => {
          const errMsg = getErrorMessage(error, "Failed to place order");
          toast.error(`Order failed: ${errMsg}`);
        },
      }
    );
  }, [
    createOrder,
    hasExecutableQuote,
    marketId,
    matchId,
    priceValue,
    qtyValue,
    selectedStrikeValue,
    side,
    type,
  ]);

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex h-fit w-full min-w-0 shrink-0 flex-col gap-2.5 overflow-hidden rounded-xl border border-cyan-300/20 bg-[#040a17]/95 p-3 shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:gap-3 sm:rounded-2xl sm:p-4"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-400/70 to-transparent" />

      {/* Header Area */}
      <div className="flex shrink-0 items-start justify-between gap-2 pb-1">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-black tracking-wide text-white shadow-sm sm:text-lg">Order Ticket</h3>
            <StatusPill side={side} />
          </div>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-cyan-200/70 sm:text-xs">
            {selectedStrikeValue ? `Strike ${selectedStrikeValue.toFixed(0)} selected` : market?.title ?? "Select a strike"}
          </p>
        </div>
      </div>

      <QuoteFocusPanel
        activeSide={side}
        ask={quoteAsk}
        bid={quoteBid}
      />

      <div className="grid shrink-0 grid-cols-2 rounded-xl border border-white/10 bg-[#071327]/80 p-1 shadow-inner gap-1">
        {(["BUY", "SELL"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setSelectedSide(option);
              setPriceOverride(null);
            }}
            className={`h-7 rounded-md text-[11px] font-black transition-all ${side === option
                ? option === "BUY"
                  ? "bg-bull-green text-white shadow-[0_8px_22px_rgba(34,197,94,0.18)]"
                  : "bg-bear-red text-white shadow-[0_8px_22px_rgba(239,68,68,0.18)]"
                : "text-on-surface-variant hover:text-on-surface"
              }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-2 rounded-xl border border-white/10 bg-[#071327]/80 p-1 shadow-inner">
        {(["LIMIT", "MARKET"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setType(option)}
            className={`flex h-7 items-center justify-center gap-1 rounded-md text-[10px] font-black transition-all ${type === option
                ? "bg-primary/15 text-primary"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
          >
            {option === "MARKET" ? <Zap className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
            {option}
          </button>
        ))}
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-1.5">
        <div className="grid min-w-0 gap-1">
          <div className="flex items-center justify-between gap-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
              {type === "LIMIT" ? "Limit (Rs)" : "Expected price"}
            </label>
            {type === "LIMIT" && (
              <button
                type="button"
                onClick={alignLimitToQuote}
                disabled={!hasExecutableQuote}
                className="inline-flex h-5 items-center gap-1 rounded border border-primary/20 bg-primary/10 px-1.5 text-[9px] font-black text-primary disabled:opacity-40"
              >
                <Zap className="h-3 w-3" />
                {side === "BUY" ? "Ask" : "Bid"}
              </button>
            )}
          </div>
          {type === "LIMIT" ? (
            <div className="relative w-full">
              <input
                type="number"
                min="0"
                step="0.05"
                value={displayPrice}
                onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
                onChange={(e) => setPriceOverride({ key: priceKey, value: e.target.value })}
                className="h-10 w-full min-w-0 rounded-lg border border-white/5 bg-[#040a17] pl-6 pr-3 font-data-tabular text-[14px] font-black text-on-surface shadow-inner transition-colors focus:border-cyan-400/80 focus:bg-[#071327] focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
              />
              <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-1 h-3 border-l-[1.5px] border-cyan-500/50" />
            </div>
          ) : (
            <div className="flex h-10 min-w-0 items-center justify-center rounded-lg border border-bull-green/30 bg-bull-green/15 px-3 font-data-tabular text-[14px] font-black text-bull-green shadow-inner">
              Rs {formatMoney(priceValue)}
            </div>
          )}
        </div>

        <div className="grid min-w-0 gap-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
            Quantity
          </label>
          <div className="relative w-full">
            <input
              type="number"
              min="0"
              value={qty}
              onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }}
              onChange={(e) => setQtyOverride(e.target.value)}
              className="h-10 w-full min-w-0 rounded-lg border border-white/5 bg-[#040a17] pl-6 pr-3 font-data-tabular text-[14px] font-black text-on-surface shadow-inner transition-colors focus:border-cyan-400/80 focus:bg-[#071327] focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
            />
            <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-1 h-3 border-l-[1.5px] border-cyan-500/50" />
          </div>
        </div>

      </div>

      <OrderImpactPanel
        availableBalance={availableBalance}
        cashRequired={cashRequired}
        danger={showBalanceWarning}
        notional={notional}
        price={priceValue}
        side={side}
      />

      {lastOrder && <OrderReceipt order={lastOrder} submittedAt={lastOrderTime} />}

      <div className="grid grid-cols-[1fr_40px] gap-2 pt-1">
        <button
          type="submit"
          disabled={submitDisabled}
          className={`inline-flex h-11 min-w-0 shrink-0 items-center justify-center gap-2 rounded-xl px-2 text-[12px] font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(0,0,0,0.4)] transition-all hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_12px_25px_rgba(0,0,0,0.6)] hover:-translate-y-0.5 active:translate-y-0 sm:text-[14px] ${side === "BUY" ? "bg-bull-green hover:bg-bull-green/90 shadow-bull-green/20" : "bg-bear-red hover:bg-bear-red/90 shadow-bear-red/20"
            } disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none`}
        >
          {isCreatingOrder ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Routing...
            </>
          ) : (
            <>
              {willExecuteNow ? <Zap className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
              {side === "BUY" ? "Buy" : "Sell"} {type} @ Rs {formatMoney(priceValue)}
              {qtyValue > 1 ? ` · ${formatMoney(notional)}` : ""}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={resetTicket}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-[#071327] text-on-surface-variant hover:text-white hover:bg-white/5 transition-colors"
          title="Reset ticket"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

const QuoteFocusPanel = React.memo(function QuoteFocusPanel({
  activeSide,
  ask,
  bid,
}: {
  activeSide: "BUY" | "SELL";
  ask: number;
  bid: number;
}) {
  return (
    <div className="shrink-0 rounded-xl border border-white/10 bg-[#071327]/60 p-2 shadow-inner">
      <div className="grid grid-cols-2 gap-2">
        <QuoteBox active={activeSide === "SELL"} label="Bid" tone="bid" value={bid} />
        <QuoteBox active={activeSide === "BUY"} label="Ask" tone="ask" value={ask} />
      </div>
    </div>
  );
});

const QuoteBox = React.memo(function QuoteBox({
  active,
  label,
  tone,
  value,
}: {
  active: boolean;
  label: string;
  tone: "bid" | "ask";
  value: number;
}) {
  const activeClass =
    tone === "bid"
      ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-100"
      : "border-red-300/45 bg-red-400/10 text-red-200";

  return (
    <div className={`rounded-md border px-2.5 py-2 ${active ? activeClass : "border-white/8 bg-[#040a17] text-on-surface"}`}>
      <div className="text-[9px] font-black uppercase tracking-wider opacity-75">{label}</div>
      <div className="font-data-tabular text-base font-black leading-tight">Rs {formatMoney(value)}</div>
    </div>
  );
});

const OrderImpactPanel = React.memo(function OrderImpactPanel({
  availableBalance,
  cashRequired,
  danger,
  notional,
  price,
  side,
}: {
  availableBalance: number;
  cashRequired: number;
  danger: boolean;
  notional: number;
  price: number;
  side: "BUY" | "SELL";
}) {
  return (
    <div className="shrink-0 rounded-lg border border-white/8 bg-[#071327]/90 p-1.5">
      <div className="grid grid-cols-2 gap-1 font-data-tabular text-[10px] sm:grid-cols-4">
        <ImpactCell label="Price" value={`Rs ${formatMoney(price)}`} />
        <ImpactCell label="Notional" value={`Rs ${formatMoney(notional)}`} strong />
        <ImpactCell
          danger={danger}
          label="Margin"
          value={`Rs ${formatMoney(side === "BUY" ? cashRequired : 0)}`}
        />
        <ImpactCell danger={danger} label="Available" value={`Rs ${formatMoney(availableBalance)}`} align="right" />
      </div>
    </div>
  );
});

const ImpactCell = React.memo(function ImpactCell({
  align,
  danger,
  label,
  strong,
  value,
}: {
  align?: "right";
  danger?: boolean;
  label: string;
  strong?: boolean;
  value: string;
}) {
  return (
    <div className={`min-w-0 rounded border px-1.5 py-1 ${align === "right" ? "text-right" : ""} ${danger ? "border-bear-red/30 bg-bear-red/10 text-bear-red" : "border-white/8 bg-[#040a17] text-on-surface-variant"
      }`}>
      <div className="truncate">{label}</div>
      <div className={`truncate font-black ${strong || !danger ? "text-on-surface" : ""}`}>{value}</div>
    </div>
  );
});

const StatusPill = React.memo(function StatusPill({ side }: { side: "BUY" | "SELL" }) {
  return (
    <span
      className={`rounded-md border px-2 py-1 text-[10px] font-black ${side === "BUY"
          ? "border-bull-green/20 bg-bull-green/10 text-bull-green"
          : "border-bear-red/20 bg-bear-red/10 text-bear-red"
        }`}
    >
      {side}
    </span>
  );
});

const OrderReceipt = React.memo(function OrderReceipt({ order, submittedAt }: { order: Order; submittedAt: Date | null }) {
  const executed = order.status === "FILLED";
  const partial = order.status === "PARTIAL";
  const tone = executed
    ? "border-bull-green/25 bg-bull-green/10"
    : partial
      ? "border-primary/25 bg-primary/10"
      : "border-[#FFB300]/25 bg-[#FFB300]/10";

  return (
    <div className={`rounded-md border px-2 py-1.5 ${tone}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {executed ? <CheckCircle2 className="h-4 w-4 text-bull-green" /> : <Clock3 className="h-4 w-4 text-[#FFB300]" />}
          <span className="truncate text-[11px] font-black text-on-surface">
            {executed ? "Executed" : partial ? "Partially executed" : "Working"}
          </span>
        </div>
        <span className="font-data-tabular text-[10px] text-on-surface-variant">{submittedAt ? formatTime(submittedAt) : "--:--"}</span>
      </div>
      <div className="mt-1 grid grid-cols-3 gap-1 font-data-tabular text-[10px] text-on-surface-variant">
        <span>{order.side} {order.strike}</span>
        <span className="text-center">{order.filledQuantity}/{order.quantity} lots</span>
        <span className="text-right">Rs {formatMoney(order.averageFillPrice || order.price || 0)}</span>
      </div>
    </div>
  );
});



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

function roundMoney(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}
