import { apiClient } from "@/lib/api/client";
import { Quote, MarketDepth, Market as FrontendMarket, Order as FrontendOrder } from "@/types";
import { adaptMarkets, adaptMarketDepth, BackendMarket } from "@/lib/adapters/market.adapter";
import { adaptOrders, adaptOrder, BackendOrder } from "@/lib/adapters/order.adapter";
import { Execution } from "../types/execution";
import { OpenPosition } from "../types/position";

export interface CreateOrderPayload {
  matchId: string;
  marketId: string;
  strike: number;
  side: "buy" | "sell";
  type: "LIMIT" | "MARKET";
  quantity: number;
  price: number;
}

export interface ClosePositionPayload {
  positionId: string;
  type: "LIMIT" | "MARKET";
  /** Optional. Backend defaults to full open lots when omitted. */
  quantity?: number;
  /** Required for LIMIT exits. */
  price?: number;
  /** Context used to fall back to a SELL order if the close endpoint is unavailable. */
  matchId?: string;
  marketId?: string;
  strike?: number;
}

export interface CalculatePricePayload {
  innings: number;
  currentScore: number;
  wicketsLost: number;
  ballsLeft?: number;
  ballsBowled?: number;
  targetScore?: number;
}

export interface OptionChainStrike {
  strike: number;
  premium: number;
}

export interface CalculatedPrice {
  buyerPrice: number;
  sellerPrice: number;
  ltp: number;
  open: number;
  high: number;
  low: number;
  strikeStep?: number;
  maxStrike?: number;
  projectedS0?: number;
  optionChain?: OptionChainStrike[];
}

class TradingService {
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

  async fetchOrders(matchId?: string): Promise<FrontendOrder[]> {
    const params: Record<string, string> = {};
    if (matchId) params.matchId = matchId;

    const response = await apiClient.get<{ success: boolean; data: BackendOrder[] }>("/v1/orders", { params });
    return adaptOrders(response.data.data);
  }

  async createOrder(payload: CreateOrderPayload): Promise<FrontendOrder> {
    const response = await apiClient.post<{ success: boolean; data: BackendOrder }>("/v1/orders", payload);
    return adaptOrder(response.data.data);
  }

  async closePosition(payload: ClosePositionPayload): Promise<FrontendOrder> {
    const body: Record<string, unknown> = { type: payload.type };
    if (typeof payload.quantity === "number" && payload.quantity > 0) {
      body.quantity = payload.quantity;
    }
    if (payload.type === "LIMIT" && typeof payload.price === "number") {
      body.price = payload.price;
    }

    try {
      const response = await apiClient.post<{ success: boolean; data: BackendOrder }>(
        `/v1/positions/${payload.positionId}/close`,
        body
      );
      return adaptOrder(response.data.data);
    } catch (error) {
      // If the dedicated close endpoint isn't deployed, exit via a SELL order
      // (same engine as a buy). Only retry when the route is truly absent so we
      // never double-execute after a real validation/server error.
      if (closeEndpointMissing(error) && payload.marketId && payload.matchId && typeof payload.strike === "number") {
        return this.createOrder({
          matchId: payload.matchId,
          marketId: payload.marketId,
          strike: payload.strike,
          side: "sell",
          type: payload.type,
          quantity: payload.quantity ?? 0,
          price: payload.price ?? 0,
        });
      }
      throw error;
    }
  }

  async fetchExecutions(matchId: string, marketId: string): Promise<Execution[]> {
    const response = await apiClient.get<{ success: boolean; data: Execution[] }>("/v1/executions", {
      params: { matchId, marketId },
    });
    return response.data.data ?? [];
  }

  async fetchOpenPositions(): Promise<OpenPosition[]> {
    const response = await apiClient.get<{ success: boolean; data: OpenPosition[] }>("/v1/positions/open");
    return normalizeOpenPositions(response.data.data ?? []);
  }

  async calculateMarketPrice(marketId: string, payload: CalculatePricePayload): Promise<CalculatedPrice> {
    const response = await apiClient.post<{ success: boolean; data: CalculatedPrice }>(
      `/v1/markets/${marketId}/calculate-price`,
      payload
    );
    return response.data.data;
  }

  async cancelOrder(orderId: string): Promise<FrontendOrder> {
    const response = await apiClient.patch<{ success: boolean; data: BackendOrder }>(`/v1/orders/${orderId}/cancel`);
    return adaptOrder(response.data.data);
  }

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
}

export const tradingService = new TradingService();

function normalizeOpenPositions(positions: OpenPosition[]): OpenPosition[] {
  return positions.map((position) => ({
    ...position,
    strike: numberOrZero(position.strike),
    lots: numberOrZero(position.lots),
    buyPrice: numberOrZero(position.buyPrice),
    ltp: numberOrZero(position.ltp),
    pnl: numberOrZero(position.pnl),
  }));
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function closeEndpointMissing(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("response" in error)) return false;
  const response = (error as { response?: { status?: number } }).response;
  // 404 = route not found, 405 = method not allowed, 501 = not implemented.
  return response?.status === 404 || response?.status === 405 || response?.status === 501;
}

function symbolFromTitle(title: string): string {
  const words = title
    .split(/[\s/_-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (words.length === 0) return "0";
  return words.map((word) => word[0]).join("").toUpperCase() || "0";
}
