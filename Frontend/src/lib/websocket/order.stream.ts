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
    const socket = socketManager.connect();
    const eventName = `user:${userId}:orders`;

    socket.emit("subscribe", { channel: eventName });
    socket.on(eventName, onOrderUpdate);

    return () => {
      socket.off(eventName, onOrderUpdate);
      socket.emit("unsubscribe", { channel: eventName });
    };
  },

  subscribePositionUpdates: (
    userId: string,
    onPositionUpdate: (event: PositionUpdateEvent) => void
  ): (() => void) => {
    const socket = socketManager.connect();
    const eventName = `user:${userId}:positions`;

    socket.emit("subscribe", { channel: eventName });
    socket.on(eventName, onPositionUpdate);

    return () => {
      socket.off(eventName, onPositionUpdate);
      socket.emit("unsubscribe", { channel: eventName });
    };
  },
};
