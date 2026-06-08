import { apiClient } from "@/lib/api/client";
import { adaptOrders, BackendOrder } from "@/lib/adapters/order.adapter";
import { adaptMarkets, BackendMarket } from "@/lib/adapters/market.adapter";
import { Order } from "@/types";
import { PortfolioSummary } from "../types/portfolio";
import { computePortfolioSummary } from "./portfolio-calculator";

class PortfolioService {
  /**
   * Fetch all orders (filled + open) from the Go API.
   * Returns frontend-typed Order[].
   */
  async fetchAllOrders(): Promise<Order[]> {
    const response = await apiClient.get<{
      success: boolean;
      data: BackendOrder[];
    }>("/v1/orders");
    return adaptOrders(response.data.data);
  }

  /**
   * Fetch current market prices for all marketIds present in orders.
   * Returns a Map<marketId, currentPrice>.
   */
  async fetchCurrentPrices(
    marketIds: string[]
  ): Promise<Map<string, number>> {
    const priceMap = new Map<string, number>();

    // Batch fetch markets in parallel (limited blast)
    const unique = Array.from(new Set(marketIds)).slice(0, 20);
    const results = await Promise.allSettled(
      unique.map((id) =>
        apiClient.get<{ success: boolean; data: BackendMarket }>(
          `/v1/markets/${id}`
        )
      )
    );

    for (let i = 0; i < unique.length; i++) {
      const res = results[i];
      if (res.status === "fulfilled") {
        const market = res.value.data.data;
        priceMap.set(unique[i], market?.ltp ?? market?.buyerPrice ?? 0);
      }
    }

    return priceMap;
  }

  /**
   * Aggregates raw orders + live prices into a computed PortfolioSummary.
   * This is the single method the React Query hook should call.
   */
  async getPortfolioSummary(): Promise<PortfolioSummary> {
    const orders = await this.fetchAllOrders();

    const marketIds = Array.from(new Set(orders.map((o) => o.marketId)));
    const priceMap = await this.fetchCurrentPrices(marketIds);

    return computePortfolioSummary(orders, priceMap);
  }
}

export const portfolioService = new PortfolioService();
