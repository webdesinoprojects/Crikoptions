import { socketManager } from "./socket-manager";

export interface OrderUpdateEvent {
  orderId: string;
  marketId: string;
  strike: number;
  side: "BUY" | "SELL";
  status: string;
  filledQuantity: number;
  remainingQuantity: number;
  averageFillPrice: number;
}

export interface PositionUpdateEvent {
  marketId: string;
  strike: number;
  /** Remaining open lots. 0 => position fully closed (remove from open list). */
  lots: number;
  buyPrice: number;
  ltp: number;
  pnl: number;
  realizedPnl: number;
  status: string;
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
