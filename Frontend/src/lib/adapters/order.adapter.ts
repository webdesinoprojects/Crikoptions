import { BackendOrderStatus, Order as FrontendOrder } from "@/types";

export interface BackendOrder {
  _id: string;
  userId?: string;
  matchId: string;
  marketId: string;
  strike: number;
  strikePrice?: number;
  strike_price?: number;
  side: string;
  type?: string;
  quantity: number;
  price: number;
  filledQuantity?: number;
  filled_quantity?: number;
  remainingQuantity?: number;
  remaining_quantity?: number;
  averageFillPrice?: number;
  average_fill_price?: number;
  status: BackendOrderStatus | string;
  createdAt: string;
  created_at?: string;
  updatedAt?: string;
}

export function mapOrderStatus(status: string): FrontendOrder["status"] {
  const normalized = status.toLowerCase();
  if (normalized === "executed") return "FILLED";
  if (normalized === "partially_filled" || normalized === "partial") return "PARTIAL";
  if (normalized === "cancelled") return "CANCELLED";
  if (normalized === "rejected") return "REJECTED";
  if (normalized === "open" || normalized === "pending") return "PENDING";
  return "UNKNOWN";
}

export function adaptOrder(backend: BackendOrder): FrontendOrder {
  const side: FrontendOrder["side"] = String(backend.side ?? "").toLowerCase() === "sell" ? "SELL" : "BUY";
  const backendStatus = String(backend.status ?? "open").toLowerCase() as BackendOrderStatus;
  const status = mapOrderStatus(backendStatus);
  const quantity = numberOrZero(backend.quantity);
  const filledQuantity = numberOrZero(backend.filledQuantity ?? backend.filled_quantity);
  const remainingQuantity =
    typeof backend.remainingQuantity === "number"
      ? backend.remainingQuantity
      : typeof backend.remaining_quantity === "number"
        ? backend.remaining_quantity
        : Math.max(0, quantity - filledQuantity);
  const averageFillPrice = numberOrZero(backend.averageFillPrice ?? backend.average_fill_price);
  const strike = numberOrZero(backend.strike ?? backend.strikePrice ?? backend.strike_price);

  return {
    id: backend._id,
    matchId: backend.matchId,
    marketId: backend.marketId,
    strike,
    side,
    type: backend.type?.toUpperCase() === "MARKET" ? "MARKET" : "LIMIT",
    status,
    backendStatus,
    price: backend.price,
    quantity,
    filledQuantity,
    remainingQuantity,
    averageFillPrice,
    createdAt: backend.createdAt ?? backend.created_at ?? "",
  };
}

export function adaptOrders(backendOrders: BackendOrder[]): FrontendOrder[] {
  if (!backendOrders) return [];
  return backendOrders.map(adaptOrder);
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
