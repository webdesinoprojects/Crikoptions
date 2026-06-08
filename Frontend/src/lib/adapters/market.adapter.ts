import { Market as FrontendMarket, MarketDepth as FrontendMarketDepth } from "@/types";

export interface BackendLadderEntry {
  buyerQty: number;
  buyerPrice: number;
  sellerPrice: number;
  sellerQty: number;
}

export interface BackendMarket {
  _id: string;
  matchId: string;
  title: string;
  type: string;
  status: string;
  buyerPrice: number;
  sellerPrice: number;
  ltp: number;
  open: number;
  high: number;
  low: number;
  quantityLadder: BackendLadderEntry[];
  createdAt: string;
  updatedAt: string;
}

export function adaptMarket(backend: BackendMarket): FrontendMarket {
  // Map backend status "active" -> "ACTIVE", "closed" -> "SETTLED"
  let status: FrontendMarket["status"] = "ACTIVE";
  const statusLower = backend.status.toLowerCase();
  if (statusLower === "closed" || statusLower === "settled") {
    status = "SETTLED";
  } else if (statusLower === "suspended") {
    status = "SUSPENDED";
  }

  return {
    id: backend._id,
    matchId: backend.matchId,
    title: backend.title,
    type: backend.type,
    status,
  };
}

export function adaptMarkets(backendMarkets: BackendMarket[]): FrontendMarket[] {
  if (!backendMarkets) return [];
  return backendMarkets.map(adaptMarket);
}

export function adaptMarketDepth(backend: BackendMarket): FrontendMarketDepth {
  const bids = (backend.quantityLadder || [])
    .map((entry) => ({
      price: entry.buyerPrice,
      quantity: entry.buyerQty,
    }))
    .filter((b) => b.quantity > 0)
    .sort((a, b) => b.price - a.price); // high to low

  const asks = (backend.quantityLadder || [])
    .map((entry) => ({
      price: entry.sellerPrice,
      quantity: entry.sellerQty,
    }))
    .filter((a) => a.quantity > 0)
    .sort((a, b) => a.price - b.price); // low to high

  const spread = asks.length > 0 && bids.length > 0 ? asks[0].price - bids[0].price : 0;

  return {
    marketId: backend._id,
    bids,
    asks,
    spread,
  };
}
