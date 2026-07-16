export interface NumericRange {
  from: number;
  to: number;
}

const MIN_VISIBLE_BARS = 24;
const MAX_VISIBLE_BARS = 80;
const TARGET_BAR_WIDTH_PX = 12;
const DEFAULT_RIGHT_OFFSET = 3;

export function getInitialLogicalRange(
  dataCount: number,
  chartWidth: number,
  rightOffset = DEFAULT_RIGHT_OFFSET
): NumericRange | null {
  if (dataCount <= 0 || chartWidth <= 0) return null;

  const visibleBars = clamp(
    Math.floor(chartWidth / TARGET_BAR_WIDTH_PX),
    MIN_VISIBLE_BARS,
    MAX_VISIBLE_BARS
  );
  if (dataCount <= visibleBars) return null;

  const to = dataCount - 1 + rightOffset;
  return {
    from: to - visibleBars,
    to,
  };
}

export function isAtLiveEdge(
  range: NumericRange | null,
  dataCount: number,
  toleranceBars = 1
) {
  if (!range || dataCount <= 0) return true;
  return range.to >= dataCount - 1 - toleranceBars;
}

export function translatePriceRange(
  range: NumericRange,
  deltaY: number,
  paneHeight: number
): NumericRange {
  if (!Number.isFinite(deltaY) || paneHeight <= 0) return range;

  const span = range.to - range.from;
  if (!Number.isFinite(span) || span <= 0) return range;

  const priceShift = (deltaY / paneHeight) * span;
  return {
    from: range.from + priceShift,
    to: range.to + priceShift,
  };
}

export function shiftLogicalRange(range: NumericRange, barsAddedBefore: number): NumericRange {
  if (!Number.isFinite(barsAddedBefore) || barsAddedBefore === 0) return range;
  return {
    from: range.from + barsAddedBefore,
    to: range.to + barsAddedBefore,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
