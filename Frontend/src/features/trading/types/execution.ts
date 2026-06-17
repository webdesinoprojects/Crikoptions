export interface Execution {
  _id: string;
  orderId: string;
  matchId: string;
  marketId: string;
  strike: number;
  side: "buy" | "sell";
  price: number;
  quantity: number;
  liquiditySource: string;
  createdAt: string;
}
