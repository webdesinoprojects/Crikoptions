export type BackendOrderStatus = "open" | "executed" | "partially_filled" | "cancelled";

export interface Order {
  id: string;
  matchId?: string;
  marketId: string;
  strike: number;
  side: "BUY" | "SELL";
  type: "MARKET" | "LIMIT" | "STOP";
  status: "PENDING" | "PARTIAL" | "FILLED" | "CANCELLED";
  backendStatus: BackendOrderStatus;
  price?: number;
  quantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  averageFillPrice: number;
  createdAt: string;
}
