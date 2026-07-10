import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { OptionChainHistoryPointResponse, tradingService } from "../services/trading.service";
import { ChainRow } from "../utils/terminal-context";

const MAX_POINTS_PER_STRIKE = 240;

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
    if (!marketId) {
      setHistory([]);
      return;
    }

    let cancelled = false;

    tradingService
      .fetchOptionChainHistory(marketId)
      .then((response) => {
        if (cancelled) return;
        const seeded = (response.points ?? []).map(normalizeHistoryPoint).filter(Boolean) as ChainHistoryPoint[];
        setHistory((current) =>
          trimHistory([
            ...seeded,
            ...current.filter((point) => point.marketId === marketId),
          ])
        );
      })
      .catch(() => {
        // Live snapshots still form candles if the history endpoint is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, [marketId]);

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
  const grouped = new Map<string, ChainHistoryPoint[]>();

  points.forEach((point) => {
    const key = `${point.marketId}:${point.strike}`;
    const strikePoints = grouped.get(key) ?? [];
    strikePoints.push(point);
    grouped.set(key, strikePoints);
  });

  return Array.from(grouped.values()).flatMap((strikePoints) =>
    Array.from(new Map(strikePoints.map((point) => [historyPointKey(point), point])).values())
      .sort((left, right) => left.timestamp - right.timestamp)
      .slice(-MAX_POINTS_PER_STRIKE)
  );
}

function historyPointKey(point: ChainHistoryPoint) {
  return [
    point.timestamp,
    point.premium,
    point.bid,
    point.ask,
    point.bidQty,
    point.askQty,
  ].join(":");
}

function normalizeHistoryPoint(point: OptionChainHistoryPointResponse): ChainHistoryPoint | null {
  if (!Number.isFinite(point.timestamp) || !Number.isFinite(point.strike) || !Number.isFinite(point.premium)) {
    return null;
  }

  return {
    marketId: point.marketId,
    timestamp: point.timestamp,
    strike: point.strike,
    premium: point.premium,
    bid: numberOrZero(point.bid),
    ask: numberOrZero(point.ask),
    bidQty: numberOrZero(point.bidQty),
    askQty: numberOrZero(point.askQty),
    moneyness: normalizeMoneyness(point.moneyness),
  };
}

function normalizeMoneyness(value: unknown): ChainRow["moneyness"] {
  return value === "ITM" || value === "ATM" || value === "OTM" ? value : "OTM";
}

function numberOrZero(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
