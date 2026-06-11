export interface Alert {
  id: string;
  userId: string;
  marketId: string;
  condition: "PRICE_ABOVE" | "PRICE_BELOW" | "VOLUME_SPIKE";
  threshold: number;
  isActive: boolean;
  createdAt: string;
}
