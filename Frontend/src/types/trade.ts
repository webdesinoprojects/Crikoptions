export interface Trade {
  id: string;
  marketId: string;
  price: number;
  quantity: number;
  timestamp: string;
  makerSide?: "BUY" | "SELL";
}
