export type BackendOrderStatus = "open" | "executed" | "partially_filled" | "cancelled" | "rejected" | string;

export interface Order {
  id: string;
  matchId?: string;
  marketId: string;
  strike: number;
  side: "BUY" | "SELL";
  type: "MARKET" | "LIMIT" | "STOP";
  positionEffect?: "AUTO" | "OPEN" | "CLOSE" | string;
  positionIntent?: string;
  status: "PENDING" | "PARTIAL" | "FILLED" | "CANCELLED" | "REJECTED" | "UNKNOWN";
  backendStatus: BackendOrderStatus;
  price?: number;
  reservedAmount?: number;
  reservedQuantity?: number;
  quantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  averageFillPrice: number;
  createdAt: string;
}
