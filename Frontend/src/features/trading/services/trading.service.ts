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

  // Mocked/generated real-time simulations (Go backend lacks trades/candles REST endpoints)
  async getMarketCandles(marketId: string, timeframe: string): Promise<Quote[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const candles: Quote[] = [];
        let basePrice = 150;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 60; i++) {
          const time = new Date(now.getTime() - (60 - i) * 24 * 60 * 60 * 1000).getTime() / 1000;
          const open = basePrice + (Math.random() - 0.5) * 5;
          const close = open + (Math.random() - 0.5) * 5;
          const high = Math.max(open, close) + Math.random() * 2;
          const low = Math.min(open, close) - Math.random() * 2;
          
          candles.push({
            marketId,
            symbol: "MSDHONI",
            timestamp: time,
            open,
            high,
            low,
            close,
            volume: Math.floor(Math.random() * 10000)
          });
          
          basePrice = close;
        }
        resolve(candles);
      }, 500);
    });
  }

  async getRecentTrades(marketId: string): Promise<Trade[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const trades: Trade[] = [];
        let basePrice = 154.50;
        const now = new Date();
        
        for (let i = 0; i < 20; i++) {
          const price = basePrice + (Math.random() - 0.5) * 0.2;
          trades.push({
            id: `trd_${i}`,
            marketId,
            price,
            quantity: Math.floor(Math.random() * 200) + 10,
            timestamp: new Date(now.getTime() - i * 5000).toISOString(),
            makerSide: Math.random() > 0.5 ? "BUY" : "SELL"
          });
        }
        
        resolve(trades);
      }, 300);
    });
  }
}

export const tradingService = new TradingService();
