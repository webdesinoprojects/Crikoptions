export interface Order {
  id: string;
  matchId?: string;
  marketId: string;
  side: "BUY" | "SELL";
  type: "MARKET" | "LIMIT" | "STOP";
  status: "PENDING" | "PARTIAL" | "FILLED" | "CANCELLED";
  price?: number;
  quantity: number;
  filledQuantity: number;
  createdAt: string;
}
