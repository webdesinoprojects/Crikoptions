import { Order as FrontendOrder } from "@/types";

export interface BackendOrder {
  _id: string;
  userId: string;
  matchId: string;
  marketId: string;
  side: string; // "buy" | "sell"
  quantity: number;
  price: number;
  status: string; // "open" | "executed" | "cancelled" | "closed"
  createdAt: string;
  updatedAt: string;
}

export function adaptOrder(backend: BackendOrder): FrontendOrder {
  const side: FrontendOrder["side"] = backend.side.toUpperCase() === "SELL" ? "SELL" : "BUY";
  
  let status: FrontendOrder["status"] = "PENDING";
  const statusLower = backend.status.toLowerCase();
  if (statusLower === "executed" || statusLower === "closed") {
    status = "FILLED";
  } else if (statusLower === "cancelled") {
    status = "CANCELLED";
  } else if (statusLower === "partial") {
    status = "PARTIAL";
  }

  const filledQuantity = status === "FILLED" ? backend.quantity : 0;

  return {
    id: backend._id,
    matchId: backend.matchId,
    marketId: backend.marketId,
    side,
    type: "LIMIT", // Default to LIMIT since Go backend supports pricing limit orders
    status,
    price: backend.price,
    quantity: backend.quantity,
    filledQuantity,
    createdAt: backend.createdAt,
  };
}

export function adaptOrders(backendOrders: BackendOrder[]): FrontendOrder[] {
  if (!backendOrders) return [];
  return backendOrders.map(adaptOrder);
}
