// Selling blocks twice the margin of the equivalent buy. Mirrors
// ShortInitialMarginRate in the backend orders service, which remains the
// authority for any margin the server prices; these helpers only cover the
// client-side previews the terminal and simulator show before it answers.
export const SHORT_MARGIN_MULTIPLIER = 2;

export function marginForSide(notional: number, side: "BUY" | "SELL") {
  return side === "SELL" ? notional * SHORT_MARGIN_MULTIPLIER : notional;
}
