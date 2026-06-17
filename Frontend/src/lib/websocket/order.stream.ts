import { socketManager } from "./socket-manager";

export interface OrderUpdateEvent {
  orderId: string;
  userId: string;
  marketId: string;
  side: "BUY" | "SELL";
  price: number;
  quantity: number;
  filledQuantity: number;
  status: "PENDING" | "PARTIAL" | "FILLED" | "CANCELLED";
  timestamp: string;
}

export interface PositionUpdateEvent {
  userId: string;
  marketId: string;
  quantity: number; // positive for long, negative for short
  averageEntryPrice: number;
  unrealizedPnL: number;
  timestamp: string;
}

/**
 * Interface contract for WebSocket Order and Position tracking subscriptions.
 */
export const orderStream = {
  subscribeOrderUpdates: (
    userId: string,
    onOrderUpdate: (event: OrderUpdateEvent) => void
  ): (() => void) => {
    socketManager.connect();
    const eventName = `user:${userId}:orders`;
    return socketManager.subscribe(eventName, onOrderUpdate);
  },

  subscribePositionUpdates: (
    userId: string,
    onPositionUpdate: (event: PositionUpdateEvent) => void
  ): (() => void) => {
    socketManager.connect();
    const eventName = `user:${userId}:positions`;
    return socketManager.subscribe(eventName, onPositionUpdate);
  },
};
