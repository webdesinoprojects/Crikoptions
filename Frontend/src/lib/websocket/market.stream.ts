import { socketManager } from "./socket-manager";

export interface MarketDepthUpdateEvent {
  marketId: string;
  bids: Array<{ price: number; quantity: number }>;
  asks: Array<{ price: number; quantity: number }>;
  spread: number;
  timestamp: string;
}

export interface PriceTickEvent {
  marketId: string;
  price: number;
  quantity: number;
  direction: "UP" | "DOWN" | "NEUTRAL";
  timestamp: string;
}

/**
 * Interface contract for WebSocket Market Stream subscriptions.
 */
export const marketStream = {
  subscribeMarketDepth: (
    marketId: string,
    onUpdate: (event: MarketDepthUpdateEvent) => void
  ): (() => void) => {
    socketManager.connect();
    const eventName = `market:depth:${marketId}`;
    return socketManager.subscribe(eventName, onUpdate);
  },

  subscribePriceTicks: (
    marketId: string,
    onTick: (event: PriceTickEvent) => void
  ): (() => void) => {
    socketManager.connect();
    const eventName = `market:ticks:${marketId}`;
    return socketManager.subscribe(eventName, onTick);
  },
};
