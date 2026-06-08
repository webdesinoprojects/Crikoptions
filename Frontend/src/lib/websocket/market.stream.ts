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
    const socket = socketManager.connect();
    const eventName = `market:depth:${marketId}`;

    socket.emit("subscribe", { channel: eventName });
    socket.on(eventName, onUpdate);

    // Unsubscribe cleanup callback
    return () => {
      socket.off(eventName, onUpdate);
      socket.emit("unsubscribe", { channel: eventName });
    };
  },

  subscribePriceTicks: (
    marketId: string,
    onTick: (event: PriceTickEvent) => void
  ): (() => void) => {
    const socket = socketManager.connect();
    const eventName = `market:ticks:${marketId}`;

    socket.emit("subscribe", { channel: eventName });
    socket.on(eventName, onTick);

    return () => {
      socket.off(eventName, onTick);
      socket.emit("unsubscribe", { channel: eventName });
    };
  },
};
