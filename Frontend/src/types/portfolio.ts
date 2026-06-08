export interface Portfolio {
  userId: string;
  totalEquity: number;
  availableMargin: number;
  usedMargin: number;
  unrealizedPnL: number;
  dailyPnL: number;
  winRate30D?: number;
}
