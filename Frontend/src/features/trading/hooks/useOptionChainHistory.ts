import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChainRow } from "../utils/terminal-context";

const MAX_POINTS_PER_STRIKE = 240;

export interface ChainHistoryPoint {
  marketId: string;
  timestamp: number;
  strike: number;
  premium: number;
  bid: number;
  ask: number;
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
      moneyness: row.moneyness,
    }));

    setHistory((current) => {
      const scopedCurrent = marketChanged ? [] : current.filter((point) => point.marketId === marketId);
      return trimHistory([...scopedCurrent, ...snapshot]);
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
