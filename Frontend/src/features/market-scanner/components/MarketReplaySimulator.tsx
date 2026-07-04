"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldCheck,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataSourceBadge } from "@/components/shared/DataSourceBadge";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { useWallet } from "@/features/wallet/hooks";
import type { BackendMarket } from "@/lib/adapters/market.adapter";
import { getErrorMessage } from "@/lib/error-message";
import { cn } from "@/lib/utils";
import type { Order } from "@/types";
import { useCancelOrder, useCreateOrder, useOpenPositions, useOrderPreview, useOrders, terminalPollInterval } from "@/features/trading/hooks";
import type { OpenPosition } from "@/features/trading/types/position";
import type { CalculatedPrice, CalculatePricePayload } from "@/features/trading/services/trading.service";
import { tradingService } from "@/features/trading/services/trading.service";
import { buildOptionRows, findAtmRow, type ChainRow } from "@/features/trading/utils/terminal-context";
import type { ReplayDataset, ReplayEvent, ReplayMatchKey } from "../types";
import { parseReplayCsv } from "../utils/replay-csv";

type TradeSide = "BUY" | "SELL";
type OrderMode = "MARKET" | "LIMIT";

const REPLAY_MATCHES: Array<{
  key: ReplayMatchKey;
  label: string;
  csvPath?: string;
  marketId: string;
  badge: string;
  matchIdFallback?: string;
  disabled?: boolean;
}> = [
  {
    key: "csk-mi",
    label: "CSK vs MI",
    csvPath: "/simulator/CSK_MI_ballbyball_data.csv",
    marketId: "0000000000000000000000d1",
    matchIdFallback: "1",
    badge: "CSV LIVE",
  },
  {
    key: "rcb-kkr",
    label: "RCB vs KKR",
    marketId: "0000000000000000000000d4",
    matchIdFallback: "4",
    badge: "CSV PENDING",
    disabled: true,
  },
];
const FIRST_INNINGS_MODEL_SCORE_CAP = 260;

export function MarketReplaySimulator() {
  const [matchKey, setMatchKey] = useState<ReplayMatchKey>("csk-mi");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedStrike, setSelectedStrike] = useState<number | null>(null);
  const [lotsInput, setLotsInput] = useState("10");
  const [tradeSide, setTradeSide] = useState<TradeSide>("BUY");
  const [orderType, setOrderType] = useState<OrderMode>("MARKET");
  const [priceOverride, setPriceOverride] = useState<{ key: string; value: string } | null>(null);

  const matchConfig = REPLAY_MATCHES.find((match) => match.key === matchKey) ?? REPLAY_MATCHES[0];

  const replayQuery = useQuery<ReplayDataset, Error>({
    queryKey: ["market-scanner", "replay-csv", matchConfig.key, matchConfig.csvPath],
    queryFn: async () => {
      if (!matchConfig.csvPath) throw new Error("CSV data unavailable for this match");
      const response = await fetch(matchConfig.csvPath, { cache: "no-store" });
      if (!response.ok) throw new Error("CSV data unavailable for this match");
      return parseReplayCsv(await response.text(), matchConfig.key);
    },
    enabled: Boolean(matchConfig.csvPath),
    staleTime: Infinity,
  });

  const marketQuery = useQuery<BackendMarket, Error>({
    queryKey: ["market-scanner", "market", matchConfig.marketId],
    queryFn: () => tradingService.fetchMarketDetail(matchConfig.marketId),
    enabled: Boolean(matchConfig.marketId),
  });

  const orderMatchId = marketQuery.data?.matchId || matchConfig.matchIdFallback;
  const ordersQuery = useOrders(orderMatchId);
  const positionsQuery = useOpenPositions();
  const walletQuery = useWallet(true, terminalPollInterval);
  const createOrderMutation = useCreateOrder();
  const cancelOrderMutation = useCancelOrder(orderMatchId);

  const replay = replayQuery.data;
  const selectedEvent = useMemo(() => {
    if (!replay?.events.length) return null;
    return replay.events.find((event) => event.id === selectedEventId) ?? replay.events[0];
  }, [replay, selectedEventId]);

  const pricingPayload = useMemo(() => {
    if (!selectedEvent || !replay) return null;
    return buildReplayPricingPayload(selectedEvent, replay);
  }, [replay, selectedEvent]);

  const pricingQuery = useQuery<CalculatedPrice, Error>({
    queryKey: ["market-scanner", "pricing", matchConfig.marketId, pricingPayload],
    queryFn: () => tradingService.calculateMarketPrice(matchConfig.marketId, pricingPayload as CalculatePricePayload),
    enabled: Boolean(pricingPayload && matchConfig.marketId),
    refetchOnWindowFocus: false,
  });

  const optionRows = useMemo(
    () => buildOptionRows(pricingQuery.data, marketQuery.data),
    [marketQuery.data, pricingQuery.data]
  );

  const defaultStrike = findAtmRow(optionRows)?.strike ?? optionRows[0]?.strike ?? null;
  const effectiveSelectedStrike =
    selectedStrike !== null && optionRows.some((row) => sameStrike(row.strike, selectedStrike)) ? selectedStrike : defaultStrike;
  const selectedRow = optionRows.find((row) => sameStrike(row.strike, effectiveSelectedStrike ?? -1)) ?? findAtmRow(optionRows);
  const lots = Math.max(1, Number.parseInt(lotsInput, 10) || 1);

  const marketOrders = useMemo(() => {
    const orders = ordersQuery.data ?? [];
    return orders
      .filter((order) => order.marketId === matchConfig.marketId && order.strike > 0)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [matchConfig.marketId, ordersQuery.data]);

  const marketPositions = useMemo(() => {
    const positions = positionsQuery.data ?? [];
    return positions.filter(
      (position) => position.marketId === matchConfig.marketId && position.strike > 0 && position.lots !== 0
    );
  }, [matchConfig.marketId, positionsQuery.data]);

  const positionMarks = useMemo(() => buildReplayPositionMarks(marketPositions, optionRows), [marketPositions, optionRows]);
  const selectedPositionMark = selectedRow
    ? positionMarks.find((mark) => sameStrike(mark.position.strike, selectedRow.strike))
    : undefined;

  const quoteForSide = (side: TradeSide) => {
    if (!selectedRow) return 0;
    return side === "BUY" ? selectedRow.ask : selectedRow.bid;
  };

  const routedPrice = quoteForSide(tradeSide);
  const priceKey = `${tradeSide}:${selectedRow?.strike ?? "none"}:${routedPrice.toFixed(2)}`;
  const displayLimitPrice = priceOverride?.key === priceKey ? priceOverride.value : routedPrice > 0 ? routedPrice.toFixed(2) : "";
  const limitPrice = Number.parseFloat(displayLimitPrice) || 0;
  const orderPriceForSide = (side: TradeSide) => {
    if (orderType === "MARKET") return quoteForSide(side);
    if (side === tradeSide) return limitPrice;
    return quoteForSide(side);
  };

  const expectedPrice = orderPriceForSide(tradeSide);
  const orderPreviewPayload =
    selectedRow && pricingPayload && orderMatchId && expectedPrice > 0 && (orderType !== "LIMIT" || limitPrice > 0)
      ? {
          matchId: orderMatchId,
          marketId: matchConfig.marketId,
          strike: selectedRow.strike,
          side: tradeSide.toLowerCase() as "buy" | "sell",
          type: orderType,
          quantity: lots,
          price: expectedPrice,
          pricingSnapshot: pricingPayload,
        }
      : undefined;
  const orderPreviewQuery = useOrderPreview(orderPreviewPayload);
  const availableBalance = walletQuery.data?.availableBalance;
  const netLotsForStrike = selectedPositionMark?.position.lots ?? 0;
  const openLotsForStrike = Math.abs(netLotsForStrike);
  const baseRisk = buildRiskSnapshot({
    event: selectedEvent,
    lots,
    maxModelScore: maxModeledSettlementScore(selectedEvent, pricingPayload),
    orderPrice: expectedPrice,
    positionMark: selectedPositionMark,
    row: selectedRow,
    side: tradeSide,
  });
  const risk = {
    ...baseRisk,
    marginRequired:
      orderPreviewQuery.data && orderPreviewQuery.data.marginRequired >= 0
        ? `Rs ${formatMoney(orderPreviewQuery.data.marginRequired)}`
        : baseRisk.marginRequired,
  };

  const getDisabledReason = (side: TradeSide, quantity = lots) =>
    getTradeDisabledReason({
      expectedPrice: orderPriceForSide(side),
      lots: quantity,
      orderMatchId,
      pricingError: pricingQuery.isError,
      pricingLoading: pricingQuery.isLoading,
      row: selectedRow,
    });

  const previewDisabledReason =
    orderPreviewQuery.data && !orderPreviewQuery.data.sufficientBalance
      ? orderPreviewQuery.data.message || "Insufficient available wallet balance."
      : "";
  const activeDisabledReason = previewDisabledReason || getDisabledReason(tradeSide);
  const canSubmitBuy =
    (tradeSide === "BUY" ? activeDisabledReason : getDisabledReason("BUY")) === "" && !createOrderMutation.isPending;
  const canSubmitSell =
    (tradeSide === "SELL" ? activeDisabledReason : getDisabledReason("SELL")) === "" && !createOrderMutation.isPending;

  const selectEvent = (event: ReplayEvent) => setSelectedEventId(event.id);

  const moveEvent = (offset: number) => {
    if (!replay || !selectedEvent) return;
    const index = replay.events.findIndex((event) => event.id === selectedEvent.id);
    const next = replay.events[Math.max(0, Math.min(replay.events.length - 1, index + offset))];
    if (next) selectEvent(next);
  };

  const jumpWithinInnings = (offset: number) => {
    if (!replay || !selectedEvent) return;
    const inningsEvents = replay.events.filter((event) => event.innings === selectedEvent.innings);
    const index = inningsEvents.findIndex((event) => event.id === selectedEvent.id);
    const next = inningsEvents[Math.max(0, Math.min(inningsEvents.length - 1, index + offset))];
    if (next) selectEvent(next);
  };

  const jumpToBall = (ballNumber: number) => {
    if (!replay || !selectedEvent) return;
    const inningsEvents = replay.events.filter((event) => event.innings === selectedEvent.innings);
    const target = Math.max(1, Math.min(120, Math.round(ballNumber)));
    const closest = inningsEvents.reduce((best, event) => {
      return Math.abs(event.legalBallNumber - target) < Math.abs(best.legalBallNumber - target) ? event : best;
    }, inningsEvents[0]);
    if (closest) selectEvent(closest);
  };

  const selectInnings = (innings: 1 | 2) => {
    const next = replay?.events.find((event) => event.innings === innings);
    if (next) selectEvent(next);
  };

  const submitOrder = (side: TradeSide, quantity = lots) => {
    setTradeSide(side);
    const price = orderPriceForSide(side);
    const reason = getDisabledReason(side, quantity);
    if (reason) {
      toast.error(reason);
      return;
    }
    if (side === tradeSide && orderPreviewQuery.data && !orderPreviewQuery.data.sufficientBalance) {
      toast.error(orderPreviewQuery.data.message || "Insufficient available wallet balance.");
      return;
    }
    if (!selectedRow || !pricingPayload || !orderMatchId || !selectedEvent) return;

    const orderStrike = selectedRow.strike;
    setSelectedStrike(orderStrike);

    createOrderMutation.mutate(
      {
        clientOrderId: `scanner-${matchConfig.key}-${selectedEvent.id}-${orderStrike}-${side}-${Date.now()}`,
        matchId: orderMatchId,
        marketId: matchConfig.marketId,
        strike: orderStrike,
        side: side.toLowerCase() as "buy" | "sell",
        type: orderType,
        quantity,
        price: orderType === "MARKET" ? 0 : price,
        pricingSnapshot: pricingPayload,
      },
      {
        onSuccess: (order) => {
          setSelectedStrike(order.strike || orderStrike);
          if (order.status === "FILLED") {
            toast.success(
              `Executed ${side} ${order.filledQuantity} lots @ Rs ${formatMoney(order.averageFillPrice || order.price || price)}`
            );
          } else if (order.status === "PARTIAL") {
            toast.success(`Partially filled ${order.filledQuantity}/${order.quantity} lots`);
          } else {
            toast.success(`${side} order placed`);
          }
        },
        onError: (error: unknown) => toast.error(getErrorMessage(error, "Failed to place order")),
      }
    );
  };

  const exitPosition = (mark: PositionMark) => {
    const row = optionRows.find((item) => sameStrike(item.strike, mark.position.strike));
    if (!row || !pricingPayload || !orderMatchId || !selectedEvent) {
      toast.error("No executable quote is available for this strike");
      return;
    }

    setSelectedStrike(mark.position.strike);
    const exitSide: TradeSide = mark.position.lots < 0 ? "BUY" : "SELL";
    const exitPrice = exitSide === "BUY" ? row.ask : row.bid;
    const exitQuantity = Math.abs(mark.position.lots);
    setTradeSide(exitSide);
    createOrderMutation.mutate(
      {
        clientOrderId: `scanner-exit-${matchConfig.key}-${selectedEvent.id}-${row.strike}-${Date.now()}`,
        matchId: orderMatchId,
        marketId: matchConfig.marketId,
        strike: row.strike,
        side: exitSide.toLowerCase() as "buy" | "sell",
        type: "MARKET",
        positionEffect: "CLOSE",
        quantity: exitQuantity,
        price: 0,
        pricingSnapshot: pricingPayload,
      },
      {
        onSuccess: (order) => {
          toast.success(`Exit submitted: ${order.filledQuantity || exitQuantity} lots @ Rs ${formatMoney(order.averageFillPrice || exitPrice)}`);
        },
        onError: (error: unknown) => toast.error(getErrorMessage(error, "Failed to exit trade")),
      }
    );
  };

  const cancelOrder = (orderId: string) => {
    cancelOrderMutation.mutate(orderId, {
      onSuccess: () => toast.success("Order cancelled"),
      onError: (error: unknown) => toast.error(getErrorMessage(error, "Unable to cancel order")),
    });
  };

  const unavailableError =
    replayQuery.error?.message ||
    marketQuery.error?.message ||
    (!matchConfig.csvPath ? "CSV data unavailable for this match" : "");

  if (replayQuery.isLoading || marketQuery.isLoading) {
    return <SimulatorShell title="Market Scanner Replay" status="Loading real match data..." />;
  }

  if (unavailableError || !replay || !selectedEvent || !marketQuery.data) {
    return (
      <SimulatorShell title="Market Scanner Replay" status="CSV data unavailable/invalid">
        <div className="rounded-md border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100">
          {unavailableError || "Required real match data is not available."}
        </div>
      </SimulatorShell>
    );
  }

  return (
    <div className="flex min-h-full flex-col overflow-x-hidden bg-[#020511] text-on-surface xl:h-full xl:min-h-0 xl:overflow-hidden">
      <div className="border-b border-white/8 bg-[#071124]/95 px-3 py-3 sm:px-4">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">{matchConfig.label}</h1>
              <DataSourceBadge source="api" />
              <span className="rounded border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[10px] font-black text-cyan-100">
                REPLAY TRADING
              </span>
            </div>
            <p className="mt-1 text-xs text-cyan-100/62">Market scanner with real CSV events and backend option pricing.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {REPLAY_MATCHES.map((match) => (
              <button
                key={match.key}
                type="button"
                disabled={match.disabled}
                onClick={() => {
                  setMatchKey(match.key);
                  setSelectedEventId(null);
                  setSelectedStrike(null);
                  setPriceOverride(null);
                }}
                className={cn(
                  "h-9 rounded-md border px-3 text-xs font-black transition-colors",
                  matchKey === match.key
                    ? "border-cyan-300/45 bg-cyan-300/14 text-cyan-100"
                    : "border-white/10 bg-white/[0.03] text-on-surface-variant hover:text-on-surface",
                  match.disabled && "cursor-not-allowed opacity-45"
                )}
                title={match.badge}
              >
                {match.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2.5 sm:p-4">
        <div className="mx-auto max-w-[1180px] space-y-3">
          <TradeConsole
            availableBalance={availableBalance}
            canSubmitBuy={canSubmitBuy}
            canSubmitSell={canSubmitSell}
            dataset={replay}
            disabledReason={activeDisabledReason}
            displayLimitPrice={displayLimitPrice}
            event={selectedEvent}
            expectedPrice={expectedPrice}
            isPending={createOrderMutation.isPending}
            lotsInput={lotsInput}
            onInningsChange={selectInnings}
            onJumpBall={jumpToBall}
            onLimitPriceChange={(value) => setPriceOverride({ key: priceKey, value })}
            onLotsChange={setLotsInput}
            onOrderTypeChange={setOrderType}
            onSideChange={setTradeSide}
            onStrikeChange={setSelectedStrike}
            onSubmit={submitOrder}
            openLotsForStrike={openLotsForStrike}
            orderType={orderType}
            rows={optionRows}
            selectedRow={selectedRow}
            side={tradeSide}
          />

          <RiskStrip risk={risk} />

          <ReplayStepper
            onMoveBall={(offset) => jumpWithinInnings(offset)}
            onMoveEvent={moveEvent}
          />

          <OptionChainPanel
            currentEvent={selectedEvent}
            exiting={createOrderMutation.isPending}
            isError={pricingQuery.isError}
            isLoading={pricingQuery.isLoading}
            lots={lots}
            onExitPosition={exitPosition}
            onSelectSide={setTradeSide}
            onSelectStrike={setSelectedStrike}
            positionMarks={positionMarks}
            rows={optionRows}
            selectedStrike={effectiveSelectedStrike}
          />

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_390px]">
            <EventTable events={replay.events} onSelect={selectEvent} selectedEvent={selectedEvent} />
            <OrdersPositionsPanel
              cancelling={cancelOrderMutation.isPending}
              loadingOrders={ordersQuery.isLoading}
              loadingPositions={positionsQuery.isLoading}
              onCancelOrder={cancelOrder}
              orders={marketOrders}
              positions={positionMarks}
              selectedStrike={effectiveSelectedStrike}
              syncing={ordersQuery.isFetching || positionsQuery.isFetching || cancelOrderMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SimulatorShell({
  children,
  status,
  title,
}: {
  children?: React.ReactNode;
  status: string;
  title: string;
}) {
  return (
    <div className="flex min-h-full flex-col overflow-x-hidden bg-[#020511] p-3 text-on-surface sm:p-4 lg:h-full lg:min-h-0 lg:overflow-hidden">
      <TerminalPanel title={title} subtitle={status} className="min-h-[240px]">
        {children ?? (
          <div className="flex flex-1 items-center justify-center text-sm font-black uppercase tracking-wider text-cyan-100/70">
            {status}
          </div>
        )}
      </TerminalPanel>
    </div>
  );
}

function TradeConsole({
  availableBalance,
  canSubmitBuy,
  canSubmitSell,
  dataset,
  disabledReason,
  displayLimitPrice,
  event,
  expectedPrice,
  isPending,
  lotsInput,
  onInningsChange,
  onJumpBall,
  onLimitPriceChange,
  onLotsChange,
  onOrderTypeChange,
  onSideChange,
  onStrikeChange,
  onSubmit,
  openLotsForStrike,
  orderType,
  rows,
  selectedRow,
  side,
}: {
  availableBalance?: number;
  canSubmitBuy: boolean;
  canSubmitSell: boolean;
  dataset: ReplayDataset;
  disabledReason: string;
  displayLimitPrice: string;
  event: ReplayEvent;
  expectedPrice: number;
  isPending: boolean;
  lotsInput: string;
  onInningsChange: (innings: 1 | 2) => void;
  onJumpBall: (ballNumber: number) => void;
  onLimitPriceChange: (value: string) => void;
  onLotsChange: (value: string) => void;
  onOrderTypeChange: (type: OrderMode) => void;
  onSideChange: (side: TradeSide) => void;
  onStrikeChange: (strike: number) => void;
  onSubmit: (side: TradeSide) => void;
  openLotsForStrike: number;
  orderType: OrderMode;
  rows: ChainRow[];
  selectedRow?: ChainRow;
  side: TradeSide;
}) {
  return (
    <form
      className="rounded-md border border-cyan-300/15 bg-[#071327]/95 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.28)]"
      onSubmit={(submitEvent) => {
        submitEvent.preventDefault();
        onSubmit(side);
      }}
    >
      <div className="grid items-end gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-[1.15fr_1fr_1fr_1fr_1fr_auto]">
        <ConsoleField label="Select Inning">
          <div className="grid grid-cols-2 gap-1 rounded-md border border-white/8 bg-[#040a17] p-1">
            {([1, 2] as const).map((innings) => (
              <button
                key={innings}
                type="button"
                disabled={!dataset.innings.includes(innings)}
                onClick={() => onInningsChange(innings)}
                className={cn(
                  "h-9 rounded text-xs font-black transition-colors",
                  event.innings === innings ? "bg-primary/18 text-primary" : "text-on-surface-variant hover:text-on-surface",
                  !dataset.innings.includes(innings) && "cursor-not-allowed opacity-40"
                )}
              >
                {innings === 1 ? "1st Inn" : "2nd Inn"}
              </button>
            ))}
          </div>
        </ConsoleField>

        <ConsoleField label="Ball Number">
          <input
            type="number"
            min={1}
            max={120}
            value={event.legalBallNumber}
            onChange={(inputEvent) => onJumpBall(Number(inputEvent.target.value))}
            className={inputClassName}
          />
        </ConsoleField>

        <ConsoleField label="Number Of Lots" hint="1 Lot = 10">
          <input
            type="number"
            min={1}
            value={lotsInput}
            onChange={(inputEvent) => onLotsChange(inputEvent.target.value)}
            className={inputClassName}
          />
        </ConsoleField>

        <ConsoleField label="Score Strike">
          <select
            value={selectedRow?.strike ?? ""}
            onChange={(selectEvent) => onStrikeChange(Number(selectEvent.target.value))}
            className={inputClassName}
          >
            {rows.map((row) => (
              <option key={row.strike} value={row.strike}>
                {row.strike.toFixed(0)}
              </option>
            ))}
          </select>
        </ConsoleField>

        <div className="col-span-2 sm:col-span-1 lg:col-span-1 min-w-0">
          <ConsoleField label="Option Price">
            {orderType === "LIMIT" ? (
              <input
                type="number"
                min={0}
                step="0.05"
                value={displayLimitPrice}
                onChange={(inputEvent) => onLimitPriceChange(inputEvent.target.value)}
                className={inputClassName}
              />
            ) : (
              <div className="flex h-10 items-center rounded-md border border-white/10 bg-[#040a17] px-3 font-data-tabular text-sm font-black text-on-surface">
                Rs {formatMoney(expectedPrice)}
              </div>
            )}
          </ConsoleField>
        </div>

        <div className="grid grid-cols-2 gap-2 col-span-2 sm:col-span-3 lg:col-span-1">
          <Button
            type="button"
            disabled={!canSubmitBuy}
            onClick={() => onSubmit("BUY")}
            className="h-10 bg-bull-green px-5 font-black text-white hover:bg-bull-green/90"
          >
            {isPending && side === "BUY" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowUp className="mr-2 h-4 w-4" />}
            Buy
          </Button>
          <Button
            type="button"
            disabled={!canSubmitSell}
            onClick={() => onSubmit("SELL")}
            className="h-10 bg-bear-red px-5 font-black text-white hover:bg-bear-red/90"
          >
            {isPending && side === "SELL" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowDown className="mr-2 h-4 w-4" />}
            Sell
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {(["MARKET", "LIMIT"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onOrderTypeChange(type)}
              className={cn(
                "inline-flex h-8 items-center gap-1 rounded-md border px-3 text-[10px] font-black transition-colors",
                orderType === type
                  ? "border-primary/30 bg-primary/15 text-primary"
                  : "border-white/10 bg-white/[0.03] text-on-surface-variant hover:text-on-surface"
              )}
            >
              {type === "MARKET" ? <Zap className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              {type}
            </button>
          ))}
          <SideToggle activeSide={side} onChange={onSideChange} />
        </div>
        <div className="flex flex-wrap items-center gap-3 font-data-tabular text-[11px] text-on-surface-variant">
          <span>Available: {availableBalance === undefined ? "Loading" : `Rs ${formatMoney(availableBalance)}`}</span>
          <span>Open lots: {openLotsForStrike}</span>
          {disabledReason && <span className="font-bold text-[#FFD27A]">{disabledReason}</span>}
        </div>
      </div>
    </form>
  );
}

function ConsoleField({ children, hint, label }: { children: React.ReactNode; hint?: string; label: string }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
        {label}
        {hint && <span className="font-data-tabular text-[9px] text-cyan-100/55">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function SideToggle({ activeSide, onChange }: { activeSide: TradeSide; onChange: (side: TradeSide) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-md border border-white/8 bg-[#040a17] p-1">
      {(["BUY", "SELL"] as const).map((side) => (
        <button
          key={side}
          type="button"
          onClick={() => onChange(side)}
          className={cn(
            "h-7 rounded px-3 text-[10px] font-black transition-colors",
            activeSide === side
              ? side === "BUY"
                ? "bg-bull-green text-white"
                : "bg-bear-red text-white"
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          {side}
        </button>
      ))}
    </div>
  );
}

function RiskStrip({ risk }: { risk: RiskSnapshot }) {
  return (
    <div className="rounded-md border border-white/8 bg-[#071327]/95 p-3">
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_0.7fr_0.8fr]">
        <div className="col-span-2 sm:col-span-1 min-w-0">
          <RiskCell
            label="P&L"
            value={`Rs ${formatMoney(risk.pnl)}`}
            valueClassName={risk.pnl >= 0 ? "text-bull-green" : "text-bear-red"}
            large
          />
        </div>
        <RiskCell label="Max Profit" value={risk.maxProfit} />
        <RiskCell label="Max Loss" value={risk.maxLoss} />
        <RiskCell label="Margin Required" value={risk.marginRequired} />
        <RiskCell label="Break Even" value={risk.breakEven} />
        <RiskCell label="Over" value={risk.over} />
        <RiskCell label="Score" value={risk.score} />
      </div>
    </div>
  );
}

function RiskCell({
  label,
  large,
  value,
  valueClassName,
}: {
  label: string;
  large?: boolean;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">{label}</div>
      <div className={cn("mt-1 truncate font-data-tabular font-black text-on-surface", large ? "text-2xl" : "text-sm", valueClassName)}>
        {value}
      </div>
    </div>
  );
}

function ReplayStepper({
  onMoveBall,
  onMoveEvent,
}: {
  onMoveBall: (offset: number) => void;
  onMoveEvent: (offset: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      <StepButton label="-1 Ball" onClick={() => onMoveBall(-1)}>
        <ChevronLeft className="h-4 w-4" />
      </StepButton>
      <StepButton label="+1 Ball" onClick={() => onMoveBall(1)}>
        <ChevronRight className="h-4 w-4" />
      </StepButton>
      <StepButton label="-1 Over" onClick={() => onMoveEvent(-6)}>
        <ChevronsLeft className="h-4 w-4" />
      </StepButton>
      <StepButton label="+1 Over" onClick={() => onMoveEvent(6)}>
        <ChevronsRight className="h-4 w-4" />
      </StepButton>
    </div>
  );
}

function StepButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-[#071327] text-xs font-black text-on-surface-variant transition-colors hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100"
    >
      {children}
      {label}
    </button>
  );
}

function OptionChainPanel({
  currentEvent,
  exiting,
  isError,
  isLoading,
  lots,
  onExitPosition,
  onSelectSide,
  onSelectStrike,
  positionMarks,
  rows,
  selectedStrike,
}: {
  currentEvent: ReplayEvent;
  exiting: boolean;
  isError: boolean;
  isLoading: boolean;
  lots: number;
  onExitPosition: (mark: PositionMark) => void;
  onSelectSide: (side: TradeSide) => void;
  onSelectStrike: (strike: number) => void;
  positionMarks: PositionMark[];
  rows: ChainRow[];
  selectedStrike: number | null;
}) {
  return (
    <TerminalPanel
      title="Option Chain"
      subtitle="Select a strike or exit an open trade"
      headerActions={<DataSourceBadge source="api" />}
      className="min-h-[420px]"
      bodyClass="p-0"
    >
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-100/70">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Pricing event
        </div>
      ) : isError || rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-5 text-center text-sm text-red-100">
          Backend pricing unavailable for this event. No fallback option prices are shown.
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[780px] border-collapse font-data-tabular text-xs">
            <thead className="sticky top-0 z-10 bg-[#08152b] text-[10px] uppercase tracking-wide text-cyan-100/58">
              <tr className="border-b border-white/8">
                <th className="px-4 py-2.5 text-left">Lots</th>
                <th className="px-3 py-2.5 text-center">B</th>
                <th className="px-3 py-2.5 text-center">S</th>
                <th className="px-3 py-2.5 text-right">Strike</th>
                <th className="px-4 py-2.5 text-right">Option Price</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const selected = sameStrike(selectedStrike ?? -1, row.strike);
                const mark = positionMarks.find((item) => sameStrike(item.position.strike, row.strike));
                const markIsShort = (mark?.position.lots ?? 0) < 0;
                const markEntryPrice = markIsShort ? mark?.position.sellPrice ?? 0 : mark?.position.buyPrice ?? 0;
                return (
                  <React.Fragment key={row.strike}>
                    <tr
                      onClick={() => onSelectStrike(row.strike)}
                      className={cn(
                        "cursor-pointer border-b border-white/6 transition-colors odd:bg-white/2 hover:bg-cyan-400/8",
                        row.moneyness === "ATM" && "bg-cyan-400/10",
                        selected && "bg-cyan-400/14 shadow-[inset_4px_0_0_#67e8f9]"
                      )}
                    >
                      <td className="px-4 py-3 text-on-surface-variant">{mark?.position.lots ?? lots}</td>
                      <td className="px-3 py-3 text-center">
                        <ChainSideButton
                          label="B"
                          side="BUY"
                          onClick={() => {
                            onSelectStrike(row.strike);
                            onSelectSide("BUY");
                          }}
                        />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <ChainSideButton
                          label="S"
                          side="SELL"
                          onClick={() => {
                            onSelectStrike(row.strike);
                            onSelectSide("SELL");
                          }}
                        />
                      </td>
                      <td className="px-3 py-3 text-right text-base font-black text-on-surface">{row.strike.toFixed(0)}</td>
                      <td className="px-4 py-3 text-right font-black text-white">{formatMoney(row.premium)}</td>
                    </tr>
                    {mark && (
                      <tr className="border-b border-cyan-300/10 bg-cyan-300/[0.06]">
                        <td colSpan={5} className="px-4 py-2">
                          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-on-surface-variant">
                            <InlineTradeMetric value={`${mark.position.lots} Lots`} />
                            <InlineTradeMetric value={`P&L: Rs ${formatMoney(mark.pnl)}`} tone={mark.pnl >= 0 ? "up" : "down"} />
                            <InlineTradeMetric value={`Exit Price: Rs ${formatMoney(mark.markPrice)}`} />
                            <InlineTradeMetric value={`${markIsShort ? "Sell" : "Buy"} Entry: Rs ${formatMoney(markEntryPrice)}`} />
                            <InlineTradeMetric value={`Ball Number: ${currentEvent.legalBallNumber}`} />
                            <button
                              type="button"
                              onClick={() => onExitPosition(mark)}
                              disabled={exiting}
                              className="inline-flex h-7 items-center gap-1 rounded-full border border-bear-red/25 bg-bear-red/10 px-3 text-[10px] font-black text-bear-red disabled:opacity-50"
                            >
                              {exiting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                              Exit Trade
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </TerminalPanel>
  );
}

function ChainSideButton({
  label,
  onClick,
  side,
}: {
  label: string;
  onClick: () => void;
  side: TradeSide;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={cn(
        "h-6 w-6 rounded-full text-[10px] font-black",
        side === "BUY" ? "bg-bull-green/12 text-bull-green" : "bg-bear-red/12 text-bear-red"
      )}
    >
      {label}
    </button>
  );
}

function InlineTradeMetric({ tone, value }: { tone?: "up" | "down"; value: string }) {
  return (
    <span
      className={cn(
        "font-data-tabular font-black",
        tone === "up" && "text-bull-green",
        tone === "down" && "text-bear-red"
      )}
    >
      {value}
    </span>
  );
}

function OrdersPositionsPanel({
  cancelling,
  loadingOrders,
  loadingPositions,
  onCancelOrder,
  orders,
  positions,
  selectedStrike,
  syncing,
}: {
  cancelling: boolean;
  loadingOrders: boolean;
  loadingPositions: boolean;
  onCancelOrder: (orderId: string) => void;
  orders: Order[];
  positions: PositionMark[];
  selectedStrike: number | null;
  syncing: boolean;
}) {
  return (
    <TerminalPanel
      title="Orders & Positions"
      subtitle="Paper trading account"
      headerActions={
        <span
          className={cn(
            "rounded border px-2 py-0.5 text-[9px] font-black",
            syncing ? "border-[#FFB300]/25 bg-[#FFB300]/10 text-[#FFB300]" : "border-primary/20 bg-primary/10 text-primary"
          )}
        >
          {syncing ? "SYNCING" : "LIVE"}
        </span>
      }
      bodyClass="gap-3"
    >
      <div>
        <PanelSubhead label="Open Positions" value={positions.length} />
        {loadingPositions ? (
          <PanelState label="Loading positions..." />
        ) : positions.length === 0 ? (
          <PanelState label="No open positions yet" />
        ) : (
          <div className="space-y-1.5">
            {positions.slice(0, 4).map((mark) => {
              const selected = sameStrike(mark.position.strike, selectedStrike ?? -1);
              const isShort = mark.position.lots < 0;
              const entryPrice = isShort ? mark.position.sellPrice ?? 0 : mark.position.buyPrice;
              return (
                <div
                  key={mark.position._id}
                  className={cn(
                    "rounded-md border border-white/8 bg-[#071327] p-2",
                    selected && "border-cyan-300/30 bg-cyan-300/10"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-data-tabular text-xs font-black text-on-surface">
                      Strike {formatStrike(mark.position.strike)}
                    </span>
                    <span className={cn("font-data-tabular text-xs font-black", mark.pnl >= 0 ? "text-bull-green" : "text-bear-red")}>
                      {mark.pnl >= 0 ? "+" : "-"}Rs {formatMoney(Math.abs(mark.pnl))}
                    </span>
                  </div>
                  <div className="mt-1 grid grid-cols-3 gap-1 font-data-tabular text-[10px] text-on-surface-variant">
                    <span>{mark.position.lots} lots</span>
                    <span>{isShort ? "Sell" : "Buy"} {formatMoney(entryPrice)}</span>
                    <span className="text-right">Exit {formatMoney(mark.markPrice)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <PanelSubhead label="Recent Orders" value={orders.length} />
        {loadingOrders ? (
          <PanelState label="Loading orders..." />
        ) : orders.length === 0 ? (
          <PanelState label="No orders for this market" />
        ) : (
          <div className="space-y-1.5">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="rounded-md border border-white/8 bg-[#071327] p-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <SideBadge side={order.side} />
                    <span className="font-data-tabular text-[11px] font-black text-on-surface">
                      {formatStrike(order.strike)}
                    </span>
                  </div>
                  <span className={cn("text-[10px] font-black", statusColor(order.status))}>{displayStatus(order.status)}</span>
                </div>
                <div className="mt-1 grid grid-cols-3 gap-1 font-data-tabular text-[10px] text-on-surface-variant">
                  <span>{order.quantity} lots</span>
                  <span>Avg {order.averageFillPrice > 0 ? formatMoney(order.averageFillPrice) : "--"}</span>
                  <span className="text-right">{formatTime(order.createdAt)}</span>
                </div>
                {isWorkingOrder(order) && (
                  <button
                    type="button"
                    onClick={() => onCancelOrder(order.id)}
                    disabled={cancelling}
                    className="mt-2 inline-flex h-7 items-center gap-1 rounded border border-bear-red/20 bg-bear-red/10 px-2 text-[10px] font-black text-bear-red disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    {cancelling ? "Cancelling" : "Cancel"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </TerminalPanel>
  );
}

function PanelSubhead({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <h3 className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">{label}</h3>
      <span className="font-data-tabular text-[10px] text-on-surface-variant">{value}</span>
    </div>
  );
}

function EventTable({
  events,
  onSelect,
  selectedEvent,
}: {
  events: ReplayEvent[];
  onSelect: (event: ReplayEvent) => void;
  selectedEvent: ReplayEvent;
}) {
  return (
    <TerminalPanel title="CSV Event Timeline" subtitle="Event, runs, ball, over, score, wickets only" className="h-[360px]" bodyClass="p-0">
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[720px] border-collapse font-data-tabular text-xs">
          <thead className="sticky top-0 z-10 bg-[#08152b] text-[10px] uppercase tracking-wide text-cyan-100/58">
            <tr className="border-b border-white/8">
              <th className="px-3 py-2 text-left">Inn</th>
              <th className="px-3 py-2 text-left">Over</th>
              <th className="px-3 py-2 text-left">Event</th>
              <th className="px-3 py-2 text-right">Runs</th>
              <th className="px-3 py-2 text-right">Score</th>
              <th className="px-3 py-2 text-right">Wkts</th>
              <th className="px-3 py-2 text-right">Ball #</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const selected = event.id === selectedEvent.id;
              return (
                <tr
                  key={event.id}
                  onClick={() => onSelect(event)}
                  className={cn(
                    "cursor-pointer border-b border-white/6 transition-colors odd:bg-white/2 hover:bg-cyan-400/8",
                    selected && "bg-cyan-400/14 shadow-[inset_4px_0_0_#67e8f9]"
                  )}
                >
                  <td className="px-3 py-2 text-on-surface-variant">{event.innings}</td>
                  <td className="px-3 py-2 font-black text-on-surface">{overBallLabel(event)}</td>
                  <td className={cn("px-3 py-2 font-black", eventToneClass(event.event))}>{event.event}</td>
                  <td className="px-3 py-2 text-right text-on-surface">{event.runs}</td>
                  <td className="px-3 py-2 text-right text-on-surface">{scoreLabel(event)}</td>
                  <td className="px-3 py-2 text-right text-on-surface-variant">{event.wicketsLost}</td>
                  <td className="px-3 py-2 text-right text-on-surface-variant">{event.legalBallNumber}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </TerminalPanel>
  );
}

function SideBadge({ side }: { side: Order["side"] }) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[9px] font-black",
        side === "BUY" ? "bg-bull-green/15 text-bull-green" : "bg-bear-red/15 text-bear-red"
      )}
    >
      {side}
    </span>
  );
}

function PanelState({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-white/8 bg-[#071327] px-3 py-4 text-center text-xs font-bold text-on-surface-variant">
      {label}
    </div>
  );
}

function buildReplayPricingPayload(event: ReplayEvent, dataset: ReplayDataset): CalculatePricePayload {
  if (event.innings === 2) {
    return {
      innings: 2,
      currentScore: event.currentScore,
      wicketsLost: event.wicketsLost,
      ballsBowled: event.ballsBowled,
      targetScore: dataset.firstInningsFinalScore + 1,
    };
  }

  return {
    innings: 1,
    currentScore: event.currentScore,
    wicketsLost: event.wicketsLost,
    ballsLeft: event.ballsLeft,
  };
}

interface PositionMark {
  markPrice: number;
  pnl: number;
  position: OpenPosition;
}

interface RiskSnapshot {
  breakEven: string;
  marginRequired: string;
  maxLoss: string;
  maxProfit: string;
  over: string;
  pnl: number;
  score: string;
}

function buildReplayPositionMarks(positions: OpenPosition[], rows: ChainRow[]): PositionMark[] {
  return positions.map((position) => {
    const row = rows.find((item) => sameStrike(item.strike, position.strike));
    const markPrice = replayMarkPrice(position, row);
    return {
      markPrice,
      pnl: replayPositionPnL(position, markPrice),
      position,
    };
  });
}

function replayMarkPrice(position: OpenPosition, row?: ChainRow) {
  if (!row) return position.ltp;
  if (position.lots < 0) return positiveOrFallback(row.ask, row.premium, position.ltp);
  return positiveOrFallback(row.bid, row.premium, position.ltp);
}

function replayPositionPnL(position: OpenPosition, markPrice: number) {
  const lots = Math.abs(position.lots);
  if (lots === 0 || !Number.isFinite(markPrice)) return roundMoney(position.pnl);

  if (position.lots > 0 && position.buyPrice > 0) {
    return roundMoney((markPrice - position.buyPrice) * lots);
  }

  if (position.lots < 0 && (position.sellPrice ?? 0) > 0) {
    return roundMoney(((position.sellPrice ?? 0) - markPrice) * lots);
  }

  return roundMoney(position.pnl);
}

function positiveOrFallback(...values: number[]) {
  return values.find((value) => Number.isFinite(value) && value > 0) ?? 0;
}

function roundMoney(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

function buildRiskSnapshot({
  event,
  lots,
  maxModelScore,
  orderPrice,
  positionMark,
  row,
  side,
}: {
  event: ReplayEvent | null;
  lots: number;
  maxModelScore?: number;
  orderPrice: number;
  positionMark?: PositionMark;
  row?: ChainRow;
  side: TradeSide;
}): RiskSnapshot {
  const strike = row?.strike ?? 0;
  const positionLots = positionMark?.position.lots ?? 0;
  const isShort = positionMark ? positionLots < 0 : side === "SELL";
  const entryPrice = positionMark
    ? isShort
      ? positionMark.position.sellPrice ?? orderPrice
      : positionMark.position.buyPrice
    : orderPrice;
  const activeLots = positionMark ? Math.abs(positionLots) : lots;
  const margin = Math.max(0, entryPrice * activeLots);
  const pnl = positionMark?.pnl ?? 0;
  const longMaxProfit = modeledLongMaxProfit({ activeLots, entryPrice, maxModelScore, strike });
  const shortMaxProfit = `Rs ${formatMoney(Math.max(0, entryPrice * activeLots))}`;

  return {
    pnl,
    maxProfit: isShort ? shortMaxProfit : longMaxProfit,
    maxLoss: `Rs ${formatMoney(margin)}`,
    marginRequired: `Rs ${formatMoney(margin)}`,
    breakEven: strike > 0 && entryPrice > 0 ? formatMoney(strike + entryPrice) : "--",
    over: event ? overBallLabel(event) : "--",
    score: event ? scoreLabel(event) : "--",
  };
}

function maxModeledSettlementScore(event: ReplayEvent | null, payload: CalculatePricePayload | null) {
  if (!event || !payload) return undefined;
  if (payload.innings === 2) {
    return Math.max(event.currentScore, payload.targetScore ?? event.currentScore);
  }
  return Math.max(FIRST_INNINGS_MODEL_SCORE_CAP, event.currentScore);
}

function modeledLongMaxProfit({
  activeLots,
  entryPrice,
  maxModelScore,
  strike,
}: {
  activeLots: number;
  entryPrice: number;
  maxModelScore?: number;
  strike: number;
}) {
  if (!Number.isFinite(maxModelScore) || strike <= 0 || entryPrice <= 0 || activeLots <= 0) return "--";
  const maxPayoff = Math.max(0, (maxModelScore ?? 0) - strike);
  return `Rs ${formatMoney(Math.max(0, (maxPayoff - entryPrice) * activeLots))}`;
}

function getTradeDisabledReason({
  expectedPrice,
  lots,
  orderMatchId,
  pricingError,
  pricingLoading,
  row,
}: {
  expectedPrice: number;
  lots: number;
  orderMatchId?: string;
  pricingError: boolean;
  pricingLoading: boolean;
  row?: ChainRow;
}) {
  if (!orderMatchId) return "Market context is unavailable.";
  if (!row) return "Select a strike from the option chain.";
  if (pricingLoading) return "Pricing the selected replay event.";
  if (pricingError) return "Backend pricing is unavailable for this event.";
  if (expectedPrice <= 0) return "No executable quote is available for this strike.";
  if (lots <= 0) return "Enter a valid lot quantity.";
  return "";
}

function isWorkingOrder(order: Order) {
  return order.status === "PENDING" || order.status === "PARTIAL";
}

function statusColor(status: Order["status"]) {
  switch (status) {
    case "FILLED":
      return "text-bull-green";
    case "PENDING":
    case "PARTIAL":
      return "text-[#FFB300]";
    case "CANCELLED":
      return "text-on-surface-variant";
    case "REJECTED":
      return "text-bear-red";
    default:
      return "text-on-surface";
  }
}

function displayStatus(status: Order["status"]) {
  if (status === "FILLED") return "Filled";
  if (status === "PARTIAL") return "Partial";
  if (status === "PENDING") return "Working";
  if (status === "CANCELLED") return "Cancelled";
  if (status === "REJECTED") return "Rejected";
  return "Unknown";
}

function overBallLabel(event: ReplayEvent) {
  const legalBallNumber = Math.max(0, event.legalBallNumber);
  const displayOver = Math.floor(legalBallNumber / 6);
  const displayBall = legalBallNumber % 6;
  if (displayBall === 0) return String(displayOver);
  return `${displayOver}.${displayBall}`;
}

function scoreLabel(event: ReplayEvent) {
  return `${event.currentScore}/${event.wicketsLost}`;
}

function eventToneClass(event: string) {
  if (event.includes("WICKET")) return "text-red-300";
  if (event.includes("FOUR") || event.includes("SIX")) return "text-cyan-300";
  return "text-on-surface";
}

function formatStrike(value: number) {
  return Number.isFinite(value) ? value.toFixed(0) : "--";
}

function formatMoney(value: number) {
  if (!Number.isFinite(value)) return "0.00";
  return value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatTime(value: string) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function sameStrike(left: number, right: number) {
  return Math.abs(left - right) < 0.0001;
}

const inputClassName =
  "h-10 w-full rounded-md border border-white/10 bg-[#040a17] px-3 font-data-tabular text-sm font-black text-on-surface outline-none transition-colors focus:border-primary";
