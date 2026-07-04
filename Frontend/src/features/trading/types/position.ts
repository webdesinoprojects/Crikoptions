export interface OpenPosition {
  _id: string;
  userId?: string;
  matchId: string;
  marketId: string;
  strike: number;
  side?: "BUY" | "SELL";
  lots: number;
  buyPrice: number;
  sellPrice?: number;
  ltp: number;
  pnl: number;
  realizedPnl?: number;
  matchedLots?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}
