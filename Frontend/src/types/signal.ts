export interface Signal {
  id: string;
  title: string;
  message: string;
  type: "AI_SIGNAL" | "CATALYST" | "ALERT";
  impact: "HIGH" | "MEDIUM" | "LOW";
  timestamp: string;
  recommendation?: "BUY" | "SELL" | "HOLD";
  targetId?: string; // e.g. marketId or playerId
}
