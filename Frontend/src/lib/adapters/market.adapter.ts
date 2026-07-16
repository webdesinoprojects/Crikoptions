import { Market as FrontendMarket, MarketDepth as FrontendMarketDepth } from "@/types";

export interface BackendLadderEntry {
  buyerQty: number | null;
  buyerPrice: number | null;
  sellerPrice: number | null;
  sellerQty: number | null;
}

export interface BackendMarket {
  _id: string | null;
  matchId: string | null;
  title: string | null;
  type: string | null;
  status: string | null;
  buyerPrice: number | null;
  sellerPrice: number | null;
  ltp: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  quantityLadder: BackendLadderEntry[] | null;
  createdAt: string | null;
  updatedAt: string | null;
  lifecycle?: string;
  blockers?: string[];
  innings?: number;
  formulaVersion?: string;
}

export function adaptMarket(backend: BackendMarket): FrontendMarket {
  // Map backend status "active" -> "ACTIVE", "closed" -> "SETTLED"
  let status: FrontendMarket["status"] = "ACTIVE";
  const statusLower = (backend.status ?? "").toLowerCase();
  if (statusLower === "closed" || statusLower === "settled" || backend.lifecycle === "settled" || backend.lifecycle === "void") {
    status = "SETTLED";
  } else if (statusLower === "suspended" || (backend.lifecycle !== undefined && backend.lifecycle !== "open") || (backend.blockers?.length ?? 0) > 0) {
    status = "SUSPENDED";
  }

  return {
    id: stringOrFallback(backend._id, ""),
    matchId: stringOrFallback(backend.matchId, ""),
    title: stringOrFallback(backend.title, "Market"),
    type: stringOrFallback(backend.type, "match_depth"),
    status,
    ltp: numberOrZero(backend.ltp),
    open: numberOrZero(backend.open),
    high: numberOrZero(backend.high),
    low: numberOrZero(backend.low),
    lifecycle: backend.lifecycle,
    blockers: backend.blockers ?? [],
    innings: backend.innings,
    formulaVersion: backend.formulaVersion,
  };
}

export function adaptMarkets(backendMarkets: BackendMarket[]): FrontendMarket[] {
  if (!backendMarkets) return [];
  return backendMarkets.map(adaptMarket).filter((market) => market.id !== "");
}

export function adaptMarketDepth(backend: BackendMarket): FrontendMarketDepth {
  const bids = (backend.quantityLadder ?? [])
    .map((entry) => ({
      price: numberOrZero(entry.buyerPrice),
      quantity: numberOrZero(entry.buyerQty),
    }))
    .filter((b) => b.quantity > 0)
    .sort((a, b) => b.price - a.price); // high to low

  const asks = (backend.quantityLadder ?? [])
    .map((entry) => ({
      price: numberOrZero(entry.sellerPrice),
      quantity: numberOrZero(entry.sellerQty),
    }))
    .filter((a) => a.quantity > 0)
    .sort((a, b) => a.price - b.price); // low to high

  const spread = asks.length > 0 && bids.length > 0 ? asks[0].price - bids[0].price : 0;

  return {
    marketId: stringOrFallback(backend._id, ""),
    bids,
    asks,
    spread,
  };
}

function stringOrFallback(value: string | null | undefined, fallback: string): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed || fallback;
}

function numberOrZero(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
