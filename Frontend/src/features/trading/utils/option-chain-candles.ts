import type { ChainHistoryPoint } from "../hooks/useOptionChainHistory";

export const CANDLE_BUCKETS = [
  { label: "15s", value: 15_000 },
  { label: "30s", value: 30_000 },
  { label: "1m", value: 60_000 },
  { label: "5m", value: 300_000 },
] as const;

export interface StrikeCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  ticks: number;
  bid: number;
  ask: number;
  bidQty: number;
  askQty: number;
  startedAt: number;
  endedAt: number;
}

export function buildStrikeCandles(points: ChainHistoryPoint[], bucketMs: number): StrikeCandle[] {
  if (!Number.isFinite(bucketMs) || bucketMs <= 0) return [];

  const buckets = new Map<number, StrikeCandle>();
  const orderedPoints = [...points]
    .filter((point) => Number.isFinite(point.timestamp) && Number.isFinite(point.premium))
    .sort((left, right) => left.timestamp - right.timestamp);

  orderedPoints.forEach((point) => {
    const bucketTime = Math.floor(point.timestamp / bucketMs) * bucketMs;
    const premium = round2(point.premium);
    const existing = buckets.get(bucketTime);

    if (!existing) {
      buckets.set(bucketTime, {
        time: bucketTime,
        open: premium,
        high: premium,
        low: premium,
        close: premium,
        ticks: 1,
        bid: round2(point.bid),
        ask: round2(point.ask),
        bidQty: safeQuantity(point.bidQty),
        askQty: safeQuantity(point.askQty),
        startedAt: point.timestamp,
        endedAt: point.timestamp,
      });
      return;
    }

    existing.high = Math.max(existing.high, premium);
    existing.low = Math.min(existing.low, premium);
    existing.close = premium;
    existing.ticks += 1;
    existing.bid = round2(point.bid);
    existing.ask = round2(point.ask);
    existing.bidQty += safeQuantity(point.bidQty);
    existing.askQty += safeQuantity(point.askQty);
    existing.endedAt = point.timestamp;
  });

  return Array.from(buckets.values()).sort((left, right) => left.time - right.time);
}

export function getCandleStats(candles: StrikeCandle[]) {
  const first = candles[0];
  const last = candles[candles.length - 1];
  const previous = candles[candles.length - 2];
  const high = candles.reduce((max, candle) => Math.max(max, candle.high), first?.high ?? 0);
  const low = candles.reduce((min, candle) => Math.min(min, candle.low), first?.low ?? 0);

  return {
    first,
    last,
    previous,
    high,
    low,
    move: previous && last ? round2(last.close - previous.close) : 0,
    ticks: candles.reduce((total, candle) => total + candle.ticks, 0),
  };
}

function safeQuantity(value: number | undefined) {
  return Number.isFinite(value) && value ? Math.max(0, value) : 0;
}

function round2(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}
