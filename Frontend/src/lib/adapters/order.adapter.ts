import { BackendOrderStatus, Order as FrontendOrder } from "@/types";

export interface BackendOrder {
  _id: string;
  userId?: string;
  matchId: string;
  marketId: string;
  strike: number;
  side: string;
  type?: string;
  quantity: number;
  price: number;
  filledQuantity?: number;
  remainingQuantity?: number;
  averageFillPrice?: number;
  status: BackendOrderStatus | string;
  createdAt: string;
  updatedAt?: string;
}

export function mapOrderStatus(status: string): FrontendOrder["status"] {
  const normalized = status.toLowerCase();
  if (normalized === "executed") return "FILLED";
  if (normalized === "partially_filled" || normalized === "partial") return "PARTIAL";
  if (normalized === "cancelled") return "CANCELLED";
  return "PENDING";
}

export function adaptOrder(backend: BackendOrder): FrontendOrder {
  const side: FrontendOrder["side"] = backend.side.toLowerCase() === "sell" ? "SELL" : "BUY";
  const backendStatus = (backend.status?.toLowerCase() ?? "open") as BackendOrderStatus;
  const status = mapOrderStatus(backend.status);
  const filledQuantity = numberOrZero(backend.filledQuantity);
  const remainingQuantity =
    typeof backend.remainingQuantity === "number"
      ? backend.remainingQuantity
      : Math.max(0, numberOrZero(backend.quantity) - filledQuantity);

  return {
    id: backend._id,
    matchId: backend.matchId,
    marketId: backend.marketId,
    strike: numberOrZero(backend.strike),
    side,
    type: backend.type?.toUpperCase() === "MARKET" ? "MARKET" : "LIMIT",
    status,
    backendStatus,
    price: backend.price,
    quantity: numberOrZero(backend.quantity),
    filledQuantity,
    remainingQuantity,
    averageFillPrice: numberOrZero(backend.averageFillPrice),
    createdAt: backend.createdAt,
  };
}

export function adaptOrders(backendOrders: BackendOrder[]): FrontendOrder[] {
  if (!backendOrders) return [];
  return backendOrders.map(adaptOrder);
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
