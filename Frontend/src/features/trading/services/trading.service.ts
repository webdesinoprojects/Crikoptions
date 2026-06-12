import { apiClient } from "@/lib/api/client";
import { Quote, Trade, MarketDepth, Market as FrontendMarket, Order as FrontendOrder } from "@/types";
import { adaptMarkets, adaptMarketDepth, BackendMarket } from "@/lib/adapters/market.adapter";
import { adaptOrders, adaptOrder, BackendOrder } from "@/lib/adapters/order.adapter";

export interface CreateOrderPayload {
  matchId: string;
  marketId: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
}

class TradingService {
  // Live API Integrations
  async fetchMarkets(matchId: string): Promise<FrontendMarket[]> {
    const response = await apiClient.get<{ success: boolean; data: BackendMarket[] }>(`/v1/matches/${matchId}/markets`);
    return adaptMarkets(response.data.data);
  }

  async fetchMarketDetail(marketId: string): Promise<BackendMarket> {
    const response = await apiClient.get<{ success: boolean; data: BackendMarket }>(`/v1/markets/${marketId}`);
    return response.data.data;
  }

  async fetchMarketDepth(marketId: string): Promise<MarketDepth> {
    const response = await apiClient.get<{ success: boolean; data: BackendMarket }>(`/v1/markets/${marketId}`);
    return adaptMarketDepth(response.data.data);
  }

  async fetchOrders(matchId?: string, status?: string): Promise<FrontendOrder[]> {
    const params: Record<string, string> = {};
    if (matchId) params.matchId = matchId;
    if (status) params.status = status;
    
    const response = await apiClient.get<{ success: boolean; data: BackendOrder[] }>("/v1/orders", { params });
    return adaptOrders(response.data.data);
  }

  async createOrder(payload: CreateOrderPayload): Promise<FrontendOrder> {
    const response = await apiClient.post<{ success: boolean; data: BackendOrder }>("/v1/orders", payload);
    return adaptOrder(response.data.data);
  }

  async cancelOrder(orderId: string): Promise<FrontendOrder> {
    const response = await apiClient.patch<{ success: boolean; data: BackendOrder }>(`/v1/orders/${orderId}/cancel`);
    return adaptOrder(response.data.data);
  }

  // Compatibility bindings for Phase A
  async getOrderBook(marketId: string): Promise<MarketDepth> {
    return this.fetchMarketDepth(marketId);
  }

  async getMarketCandles(marketId: string, timeframe: string): Promise<Quote[]> {
    void timeframe;
    const market = await this.fetchMarketDetail(marketId);
    if (!market) return [];

    const timestamp = Math.floor(new Date(market.updatedAt || market.createdAt || Date.now()).getTime() / 1000);
    const volume = (market.quantityLadder ?? []).reduce(
      (total, row) => total + (row.buyerQty ?? 0) + (row.sellerQty ?? 0),
      0
    );

    return [
      {
        marketId: market._id,
        symbol: symbolFromTitle(market.title),
        timestamp,
        open: market.open ?? 0,
        high: market.high ?? 0,
        low: market.low ?? 0,
        close: market.ltp ?? 0,
        volume,
      },
    ];
  }

  async getRecentTrades(marketId: string): Promise<Trade[]> {
    const orders = await this.fetchOrders(undefined, "executed");
    return orders
      .filter((order) => order.marketId === marketId)
      .map((order) => ({
        id: order.id,
        marketId: order.marketId,
        price: order.price ?? 0,
        quantity: order.filledQuantity || order.quantity || 0,
        timestamp: order.createdAt,
        makerSide: order.side,
      }));
  }
}

export const tradingService = new TradingService();

function symbolFromTitle(title: string): string {
  const words = title
    .split(/[\s/_-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (words.length === 0) return "0";
  return words.map((word) => word[0]).join("").toUpperCase() || "0";
}
