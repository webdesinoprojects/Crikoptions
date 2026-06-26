export interface OpenPosition {
  _id: string;
  userId?: string;
  matchId: string;
  marketId: string;
  strike: number;
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
