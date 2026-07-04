import { socketManager } from "./socket-manager";
import type { PortfolioSummary } from "@/types";

/**
 * Interface contract for WebSocket Portfolio subscriptions.
 */
export const portfolioStream = {
  subscribePortfolioUpdates: (
    userId: string,
    onUpdate: (event: PortfolioSummary) => void
  ): (() => void) => {
    socketManager.connect();
    const eventName = `user:${userId}:portfolio`;
    return socketManager.subscribe(eventName, onUpdate);
  },
};
