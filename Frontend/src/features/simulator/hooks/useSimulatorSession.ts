import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { SHORT_MARGIN_MULTIPLIER, marginForSide } from "@/features/trading/utils/margin";
import type { ChainRow } from "@/features/trading/utils/terminal-context";
import type { ReplayEvent, ReplayMatchKey } from "../types";

export type SimulatorOrderSide = "BUY" | "SELL";
export type SimulatorOrderType = "MARKET" | "LIMIT";
export type SimulatorOrderStatus = "FILLED" | "WORKING" | "CANCELLED";

export interface SimulatorOrder {
  id: string;
  matchKey: ReplayMatchKey;
  marketId: string;
  eventId: string;
  strike: number;
  side: SimulatorOrderSide;
  type: SimulatorOrderType;
  status: SimulatorOrderStatus;
  price: number;
  limitPrice: number;
  quantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  averageFillPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface SimulatorPosition {
  id: string;
  matchKey: ReplayMatchKey;
  marketId: string;
  strike: number;
  lots: number;
  buyPrice: number;
  sellPrice?: number;
  realizedPnl: number;
  createdAt: string;
  updatedAt: string;
}

export interface SimulatorAccount {
  startingBalance: number;
  availableBalance: number;
  openExposure: number;
  workingReserves: number;
  totalRealizedPnl: number;
  totalUnrealizedPnl: number;
  totalPnl: number;
}

interface SimulatorSessionState {
  orders: SimulatorOrder[];
  positions: SimulatorPosition[];
}

interface SubmitOrderInput {
  eventId: string;
  limitPrice: number;
  quantity: number;
  row: ChainRow;
  side: SimulatorOrderSide;
  type: SimulatorOrderType;
}

interface TradePreviewInput {
  limitPrice: number;
  quantity: number;
  row?: ChainRow;
  side: SimulatorOrderSide;
  type: SimulatorOrderType;
}

interface TradePreview {
  executablePrice: number;
  marginRequired: number;
  message: string;
  sufficientBalance: boolean;
}

const SIMULATOR_STARTING_BALANCE = 100000;

export function useSimulatorSession({
  event,
  marketId,
  matchKey,
  rows,
}: {
  event: ReplayEvent | null;
  marketId: string;
  matchKey: ReplayMatchKey;
  rows: ChainRow[];
}) {
  const [state, setState] = useState<SimulatorSessionState>({ orders: [], positions: [] });
  const sequenceRef = useRef(0);
  const eventId = event?.id;

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setState({ orders: [], positions: [] });
      sequenceRef.current = 0;
    });
    return () => {
      active = false;
    };
  }, [marketId, matchKey]);

  useEffect(() => {
    if (!eventId || rows.length === 0) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setState((current) => fillWorkingOrders(current, rows, eventId));
    });
    return () => {
      active = false;
    };
  }, [eventId, rows]);

  const openPositions = useMemo(
    () => state.positions.filter((position) => position.matchKey === matchKey && position.marketId === marketId && position.lots !== 0),
    [marketId, matchKey, state.positions]
  );

  const account = useMemo(
    () => buildSimulatorAccount(state.positions, state.orders, rows),
    [rows, state.orders, state.positions]
  );

  const previewTrade = useCallback(
    ({ limitPrice, quantity, row, side, type }: TradePreviewInput): TradePreview => {
      const executablePrice = row ? priceForSide(row, side) : 0;
      const price = type === "LIMIT" ? limitPrice : executablePrice;
      const position = row
        ? state.positions.find(
            (item) => item.matchKey === matchKey && item.marketId === marketId && sameStrike(item.strike, row.strike)
          )
        : undefined;
      const marginRequired = row && price > 0 ? requiredOpeningMargin(position, side, quantity, price) : 0;
      const sufficientBalance = marginRequired <= account.availableBalance;
      return {
        executablePrice,
        marginRequired,
        message: sufficientBalance ? "" : "Insufficient simulator session balance.",
        sufficientBalance,
      };
    },
    [account.availableBalance, marketId, matchKey, state.positions]
  );

  const submitOrder = useCallback(
    (input: SubmitOrderInput) => {
      const quote = priceForSide(input.row, input.side);
      const submittedPrice = input.type === "LIMIT" ? input.limitPrice : quote;
      const marginRequired = requiredOpeningMargin(
        state.positions.find(
          (item) => item.matchKey === matchKey && item.marketId === marketId && sameStrike(item.strike, input.row.strike)
        ),
        input.side,
        input.quantity,
        submittedPrice
      );

      if (submittedPrice <= 0) {
        return { ok: false, message: "No executable quote is available for this strike." };
      }
      if (input.quantity <= 0) {
        return { ok: false, message: "Enter a valid lot quantity." };
      }
      if (marginRequired > account.availableBalance) {
        return { ok: false, message: "Insufficient simulator session balance." };
      }

      const now = new Date().toISOString();
      const marketable = input.type === "MARKET" || limitCrossesQuote(input.side, input.limitPrice, quote);
      const order: SimulatorOrder = {
        id: nextOrderID(matchKey, sequenceRef),
        matchKey,
        marketId,
        eventId: input.eventId,
        strike: input.row.strike,
        side: input.side,
        type: input.type,
        status: marketable ? "FILLED" : "WORKING",
        price: input.type === "LIMIT" ? input.limitPrice : 0,
        limitPrice: input.type === "LIMIT" ? input.limitPrice : 0,
        quantity: input.quantity,
        filledQuantity: marketable ? input.quantity : 0,
        remainingQuantity: marketable ? 0 : input.quantity,
        averageFillPrice: marketable ? quote : 0,
        createdAt: now,
        updatedAt: now,
      };

      setState((current) => {
        const withOrder = { ...current, orders: [order, ...current.orders] };
        if (!marketable) return withOrder;
        return {
          orders: withOrder.orders,
          positions: applyPositionFill(withOrder.positions, order, quote, now),
        };
      });

      return { ok: true, order };
    },
    [account.availableBalance, marketId, matchKey, state.positions]
  );

  const exitPosition = useCallback(
    ({ eventId, position, row }: { eventId: string; position: SimulatorPosition; row: ChainRow }) => {
      const side: SimulatorOrderSide = position.lots < 0 ? "BUY" : "SELL";
      return submitOrder({
        eventId,
        limitPrice: 0,
        quantity: Math.abs(position.lots),
        row,
        side,
        type: "MARKET",
      });
    },
    [submitOrder]
  );

  const cancelOrder = useCallback((orderID: string) => {
    const canCancel = state.orders.some((order) => order.id === orderID && order.status === "WORKING");
    if (!canCancel) return false;
    setState((current) => ({
      ...current,
      orders: current.orders.map((order) => {
        if (order.id !== orderID || order.status !== "WORKING") return order;
        return {
          ...order,
          status: "CANCELLED",
          remainingQuantity: 0,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    return true;
  }, [state.orders]);

  return {
    account,
    cancelOrder,
    exitPosition,
    openPositions,
    orders: state.orders.filter((order) => order.matchKey === matchKey && order.marketId === marketId),
    previewTrade,
    submitOrder,
  };
}

function fillWorkingOrders(state: SimulatorSessionState, rows: ChainRow[], eventId: string): SimulatorSessionState {
  let changed = false;
  let positions = state.positions;
  const now = new Date().toISOString();
  const orders = state.orders.map((order) => {
    if (order.status !== "WORKING") return order;
    const row = rows.find((item) => sameStrike(item.strike, order.strike));
    if (!row) return order;
    const quote = priceForSide(row, order.side);
    if (quote <= 0 || !limitCrossesQuote(order.side, order.limitPrice, quote)) return order;

    changed = true;
    const filled = {
      ...order,
      eventId,
      status: "FILLED" as SimulatorOrderStatus,
      filledQuantity: order.quantity,
      remainingQuantity: 0,
      averageFillPrice: quote,
      updatedAt: now,
    };
    positions = applyPositionFill(positions, filled, quote, now);
    return filled;
  });

  return changed ? { orders, positions } : state;
}

function buildSimulatorAccount(positions: SimulatorPosition[], orders: SimulatorOrder[], rows: ChainRow[]): SimulatorAccount {
  const openPositions = positions.filter((position) => position.lots !== 0);
  const totalRealizedPnl = roundMoney(positions.reduce((sum, position) => sum + position.realizedPnl, 0));
  const totalUnrealizedPnl = roundMoney(
    openPositions.reduce((sum, position) => {
      const row = rows.find((item) => sameStrike(item.strike, position.strike));
      return sum + positionPnL(position, markPriceForPosition(position, row));
    }, 0)
  );
  const openExposure = roundMoney(
    openPositions.reduce(
      (sum, position) =>
        sum + entryPrice(position) * Math.abs(position.lots) * (position.lots < 0 ? SHORT_MARGIN_MULTIPLIER : 1),
      0
    )
  );
  const workingReserves = roundMoney(
    orders
      .filter((order) => order.status === "WORKING")
      .reduce((sum, order) => sum + marginForSide(order.quantity * (order.limitPrice || order.price || 0), order.side), 0)
  );
  const totalPnl = roundMoney(totalRealizedPnl + totalUnrealizedPnl);
  return {
    startingBalance: SIMULATOR_STARTING_BALANCE,
    availableBalance: roundMoney(SIMULATOR_STARTING_BALANCE + totalRealizedPnl - openExposure - workingReserves),
    openExposure,
    totalPnl,
    totalRealizedPnl,
    totalUnrealizedPnl,
    workingReserves,
  };
}

function applyPositionFill(positions: SimulatorPosition[], order: SimulatorOrder, fillPrice: number, timestamp: string): SimulatorPosition[] {
  const next = [...positions];
  const index = next.findIndex(
    (position) => position.matchKey === order.matchKey && position.marketId === order.marketId && sameStrike(position.strike, order.strike)
  );
  const existing =
    index >= 0
      ? next[index]
      : {
          id: `simulator-position-${order.matchKey}-${order.marketId}-${formatStrikeKey(order.strike)}`,
          matchKey: order.matchKey,
          marketId: order.marketId,
          strike: order.strike,
          lots: 0,
          buyPrice: 0,
          sellPrice: 0,
          realizedPnl: 0,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

  const updated = order.side === "BUY" ? applyBuy(existing, order.quantity, fillPrice, timestamp) : applySell(existing, order.quantity, fillPrice, timestamp);
  if (index >= 0) {
    next[index] = updated;
  } else {
    next.push(updated);
  }
  return next;
}

function applyBuy(position: SimulatorPosition, quantity: number, price: number, timestamp: string): SimulatorPosition {
  if (position.lots >= 0) {
    const newLots = position.lots + quantity;
    const buyPrice = newLots > 0 ? weightedAverage(position.buyPrice, position.lots, price, quantity) : 0;
    return { ...position, buyPrice, lots: newLots, updatedAt: timestamp };
  }

  const shortLots = Math.abs(position.lots);
  const coverLots = Math.min(quantity, shortLots);
  const remainingBuy = quantity - coverLots;
  const realizedPnl = roundMoney(position.realizedPnl + ((position.sellPrice ?? price) - price) * coverLots);
  if (remainingBuy > 0) {
    return {
      ...position,
      buyPrice: price,
      lots: remainingBuy,
      realizedPnl,
      sellPrice: 0,
      updatedAt: timestamp,
    };
  }
  return {
    ...position,
    lots: position.lots + coverLots,
    realizedPnl,
    updatedAt: timestamp,
  };
}

function applySell(position: SimulatorPosition, quantity: number, price: number, timestamp: string): SimulatorPosition {
  if (position.lots <= 0) {
    const currentShortLots = Math.abs(position.lots);
    const newShortLots = currentShortLots + quantity;
    const sellPrice = newShortLots > 0 ? weightedAverage(position.sellPrice ?? 0, currentShortLots, price, quantity) : 0;
    return { ...position, lots: -newShortLots, sellPrice, updatedAt: timestamp };
  }

  const closeLots = Math.min(quantity, position.lots);
  const remainingSell = quantity - closeLots;
  const realizedPnl = roundMoney(position.realizedPnl + (price - position.buyPrice) * closeLots);
  if (remainingSell > 0) {
    return {
      ...position,
      buyPrice: 0,
      lots: -remainingSell,
      realizedPnl,
      sellPrice: price,
      updatedAt: timestamp,
    };
  }
  return {
    ...position,
    lots: position.lots - closeLots,
    realizedPnl,
    updatedAt: timestamp,
  };
}

export function simulatorPositionMarkPrice(position: SimulatorPosition, row?: ChainRow) {
  return markPriceForPosition(position, row);
}

export function simulatorPositionPnL(position: SimulatorPosition, markPrice: number) {
  return positionPnL(position, markPrice);
}

function markPriceForPosition(position: SimulatorPosition, row?: ChainRow) {
  if (!row) return entryPrice(position);
  if (position.lots < 0) return positiveOrFallback(row.ask, row.premium, entryPrice(position));
  return positiveOrFallback(row.bid, row.premium, entryPrice(position));
}

function positionPnL(position: SimulatorPosition, markPrice: number) {
  const lots = Math.abs(position.lots);
  if (lots === 0 || !Number.isFinite(markPrice)) return 0;
  if (position.lots > 0 && position.buyPrice > 0) {
    return roundMoney((markPrice - position.buyPrice) * lots);
  }
  if (position.lots < 0 && (position.sellPrice ?? 0) > 0) {
    return roundMoney(((position.sellPrice ?? 0) - markPrice) * lots);
  }
  return 0;
}

function requiredOpeningMargin(position: SimulatorPosition | undefined, side: SimulatorOrderSide, quantity: number, price: number) {
  const lots = position?.lots ?? 0;
  const closingLots = side === "BUY" && lots < 0 ? Math.min(quantity, Math.abs(lots)) : side === "SELL" && lots > 0 ? Math.min(quantity, lots) : 0;
  return roundMoney(marginForSide(Math.max(0, quantity - closingLots) * price, side));
}

function priceForSide(row: ChainRow, side: SimulatorOrderSide) {
  return side === "BUY" ? row.ask : row.bid;
}

function limitCrossesQuote(side: SimulatorOrderSide, limitPrice: number, quote: number) {
  if (side === "BUY") return limitPrice >= quote;
  return limitPrice <= quote;
}

function entryPrice(position: SimulatorPosition) {
  return position.lots < 0 ? position.sellPrice ?? 0 : position.buyPrice;
}

function weightedAverage(currentPrice: number, currentQuantity: number, newPrice: number, newQuantity: number) {
  const totalQuantity = currentQuantity + newQuantity;
  if (totalQuantity <= 0) return 0;
  return roundMoney((currentPrice * currentQuantity + newPrice * newQuantity) / totalQuantity);
}

function nextOrderID(matchKey: ReplayMatchKey, sequenceRef: MutableRefObject<number>) {
  sequenceRef.current += 1;
  return `simulator-order-${matchKey}-${sequenceRef.current}`;
}

function positiveOrFallback(...values: number[]) {
  return values.find((value) => Number.isFinite(value) && value > 0) ?? 0;
}

function roundMoney(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

function sameStrike(left: number, right: number) {
  return Math.abs(left - right) < 0.0001;
}

function formatStrikeKey(strike: number) {
  return String(Math.round(strike * 100));
}
