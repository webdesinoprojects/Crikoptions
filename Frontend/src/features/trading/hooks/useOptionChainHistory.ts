import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChainRow } from "../utils/terminal-context";

const MAX_POINTS_PER_STRIKE = 240;
const TEST_HISTORY_POINTS_PER_STRIKE = 120;
const TEST_HISTORY_STEP_MS = 5_000;
const ENABLE_CANDLE_TEST_HISTORY = process.env.NODE_ENV !== "production";

export interface ChainHistoryPoint {
  marketId: string;
  timestamp: number;
  strike: number;
  premium: number;
  bid: number;
  ask: number;
  bidQty: number;
  askQty: number;
  moneyness: ChainRow["moneyness"];
}

export function useOptionChainHistory(marketId: string, rows: ChainRow[]) {
  const [history, setHistory] = useState<ChainHistoryPoint[]>([]);
  const currentMarketRef = useRef(marketId);

  useEffect(() => {
    const marketChanged = currentMarketRef.current !== marketId;
    if (marketChanged) {
      currentMarketRef.current = marketId;
    }

    if (!marketId || rows.length === 0) {
      if (marketChanged || !marketId) setHistory([]);
      return;
    }

    const timestamp = Date.now();
    const snapshot = rows.map((row) => ({
      marketId,
      timestamp,
      strike: row.strike,
      premium: row.premium,
      bid: row.bid,
      ask: row.ask,
      bidQty: row.bidQty,
      askQty: row.askQty,
      moneyness: row.moneyness,
    }));

    setHistory((current) => {
      const scopedCurrent = marketChanged ? [] : current.filter((point) => point.marketId === marketId);
      const seededHistory =
        ENABLE_CANDLE_TEST_HISTORY && scopedCurrent.length === 0
          ? buildTestHistory(marketId, rows, timestamp)
          : [];

      return trimHistory([...seededHistory, ...scopedCurrent, ...snapshot]);
    });
  }, [marketId, rows]);

  const historyByStrike = useMemo(() => {
    const grouped = new Map<number, ChainHistoryPoint[]>();

    history.forEach((point) => {
      const points = grouped.get(point.strike) ?? [];
      points.push(point);
      grouped.set(point.strike, points);
    });

    grouped.forEach((points, strike) => {
      grouped.set(
        strike,
        [...points].sort((left, right) => left.timestamp - right.timestamp)
      );
    });

    return grouped;
  }, [history]);

  const getStrikeHistory = useCallback(
    (strike?: number | null) => {
      if (strike == null) return [];
      return historyByStrike.get(strike) ?? [];
    },
    [historyByStrike]
  );

  return {
    getStrikeHistory,
    history,
    historyByStrike,
    maxPointsPerStrike: MAX_POINTS_PER_STRIKE,
  };
}

function buildTestHistory(marketId: string, rows: ChainRow[], timestamp: number): ChainHistoryPoint[] {
  return rows.flatMap((row, rowIndex) => {
    const spread = Math.max(0.1, row.ask - row.bid);
    const amplitude = Math.max(0.35, spread * 1.8, row.premium * 0.014);
    const startTimestamp = timestamp - TEST_HISTORY_STEP_MS * TEST_HISTORY_POINTS_PER_STRIKE;

    return Array.from({ length: TEST_HISTORY_POINTS_PER_STRIKE }, (_, index) => {
      const progress = (index + 1) / TEST_HISTORY_POINTS_PER_STRIKE;
      const trend = (progress - 1) * amplitude * 1.35;
      const wave = Math.sin((index + rowIndex * 0.67) * 1.18) * amplitude * 0.62;
      const pullback = index % 5 === 2 ? -amplitude * 0.48 : 0;
      const premium = round2(Math.max(0.1, row.premium + trend + wave + pullback));
      const bid = round2(Math.max(0, premium - spread / 2));
      const ask = round2(premium + spread / 2);

      return {
        marketId,
        timestamp: startTimestamp + index * TEST_HISTORY_STEP_MS,
        strike: row.strike,
        premium,
        bid,
        ask,
        bidQty: Math.max(1, Math.round(row.bidQty * (0.78 + ((index + rowIndex) % 6) * 0.055))),
        askQty: Math.max(1, Math.round(row.askQty * (0.8 + ((index + rowIndex + 2) % 6) * 0.05))),
        moneyness: row.moneyness,
      };
    });
  });
}

function trimHistory(points: ChainHistoryPoint[]) {
  const grouped = new Map<number, ChainHistoryPoint[]>();

  points.forEach((point) => {
    const strikePoints = grouped.get(point.strike) ?? [];
    strikePoints.push(point);
    grouped.set(point.strike, strikePoints);
  });

  return Array.from(grouped.values()).flatMap((strikePoints) =>
    strikePoints
      .sort((left, right) => left.timestamp - right.timestamp)
      .slice(-MAX_POINTS_PER_STRIKE)
  );
}

function round2(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}
