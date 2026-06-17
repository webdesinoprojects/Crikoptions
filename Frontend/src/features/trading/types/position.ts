export interface OpenPosition {
  _id: string;
  userId?: string;
  matchId: string;
  marketId: string;
  strike: number;
  lots: number;
  buyPrice: number;
  ltp: number;
  pnl: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}
