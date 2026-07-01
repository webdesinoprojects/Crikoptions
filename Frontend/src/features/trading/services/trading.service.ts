import { apiClient } from "@/lib/api/client";
import { Quote, MarketDepth, Market as FrontendMarket, Order as FrontendOrder } from "@/types";
import { adaptMarkets, adaptMarketDepth, BackendMarket } from "@/lib/adapters/market.adapter";
import { adaptOrders, adaptOrder, BackendOrder } from "@/lib/adapters/order.adapter";
import { Execution } from "../types/execution";
import { OpenPosition } from "../types/position";

export interface CreateOrderPayload {
  clientOrderId?: string;
  matchId: string;
  marketId: string;
  strike: number;
  side: "buy" | "sell";
  type: "LIMIT" | "MARKET";
  quantity: number;
  price: number;
  pricingSnapshot?: CalculatePricePayload;
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

/** One persisted ball from GET /v1/matches/{id}/events */
export interface MatchBallHistoryEvent {
  innings?: number;
  over?: number;
  ball?: number;
  runs: number;
  isWicket: boolean;
  extra?: string | null;
  strikerName?: string;
  bowlerName?: string;
  commentary?: string;
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

export interface PositionQueryFilters {
  matchId?: string;
  marketId?: string;
}

export interface MarketPnL {
  marketId: string;
  openPnl: number;
  closedPnl: number;
  totalPnl: number;
}

export interface DailyPnL {
  dailyPnL: number;
  dailyPnLPct: number;
}

export interface ExitAllPositionFailure {
  matchId: string;
  marketId: string;
  strike: number;
  quantity: number;
  message: string;
}

export interface ExitAllPositionsResult {
  requested: number;
  submitted: number;
  failed: number;
  failures: ExitAllPositionFailure[];
}

export interface OrderPreview {
  matchId: string;
  marketId: string;
  strike: number;
  side: "buy" | "sell";
  type: "LIMIT" | "MARKET";
  quantity: number;
  requestedPrice: number;
  orderPrice: number;
  executablePrice: number;
  bid: number;
  ask: number;
  notional: number;
  marginRequired: number;
  availableBalance: number;
  sufficientBalance: boolean;
  willExecuteNow: boolean;
  message: string;
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

  async previewOrder(payload: CreateOrderPayload): Promise<OrderPreview> {
    const response = await apiClient.post<{ success: boolean; data: OrderPreview }>("/v1/orders/preview", payload);
    return normalizeOrderPreview(response.data.data);
  }

  async fetchExecutions(matchId: string, marketId: string): Promise<Execution[]> {
    const response = await apiClient.get<{ success: boolean; data: Execution[] }>("/v1/executions", {
      params: { matchId, marketId },
    });
    return response.data.data ?? [];
  }

  async fetchMatchEvents(matchId: string, limit = 6): Promise<MatchBallHistoryEvent[]> {
    const response = await apiClient.get<{ success: boolean; data: MatchBallHistoryEvent[] }>(
      `/v1/matches/${matchId}/events`,
      { params: { limit } }
    );
    return response.data.data ?? [];
  }

  async fetchOpenPositions(filters?: PositionQueryFilters): Promise<OpenPosition[]> {
    const response = await apiClient.get<{ success: boolean; data: OpenPosition[] }>("/v1/positions/open", {
      params: compactPositionFilters(filters),
    });
    return normalizeOpenPositions(response.data.data ?? []);
  }

  async fetchClosedPositions(filters?: PositionQueryFilters): Promise<OpenPosition[]> {
    const response = await apiClient.get<{ success: boolean; data: OpenPosition[] }>("/v1/positions/closed", {
      params: compactPositionFilters(filters),
    });
    return normalizeOpenPositions(response.data.data ?? []);
  }

  async fetchMarketPnL(marketId: string): Promise<MarketPnL> {
    const response = await apiClient.get<{ success: boolean; data: MarketPnL }>(
      `/v1/portfolio/markets/${marketId}/pnl`
    );
    return normalizeMarketPnL(response.data.data);
  }

  async fetchDailyPnL(): Promise<DailyPnL> {
    const response = await apiClient.get<{ success: boolean; data: DailyPnL }>("/v1/portfolio/daily-pnl");
    return normalizeDailyPnL(response.data.data);
  }

  async exitAllPositions(): Promise<ExitAllPositionsResult> {
    const response = await apiClient.post<{ success: boolean; data: ExitAllPositionsResult }>(
      "/v1/positions/close-all",
      { type: "MARKET" }
    );
    return normalizeExitAllPositions(response.data.data);
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
    sellPrice: numberOrZero(position.sellPrice),
    ltp: numberOrZero(position.ltp),
    pnl: numberOrZero(position.pnl),
    realizedPnl: numberOrZero(position.realizedPnl),
    matchedLots: numberOrZero(position.matchedLots),
  }));
}

function normalizeMarketPnL(pnl: MarketPnL): MarketPnL {
  return {
    marketId: pnl?.marketId ?? "",
    openPnl: numberOrZero(pnl?.openPnl),
    closedPnl: numberOrZero(pnl?.closedPnl),
    totalPnl: numberOrZero(pnl?.totalPnl),
  };
}

function normalizeDailyPnL(pnl: DailyPnL): DailyPnL {
  return {
    dailyPnL: numberOrZero(pnl?.dailyPnL),
    dailyPnLPct: numberOrZero(pnl?.dailyPnLPct),
  };
}

function normalizeExitAllPositions(result: ExitAllPositionsResult): ExitAllPositionsResult {
  return {
    requested: numberOrZero(result?.requested),
    submitted: numberOrZero(result?.submitted),
    failed: numberOrZero(result?.failed),
    failures: (result?.failures ?? []).map((failure) => ({
      matchId: failure?.matchId ?? "",
      marketId: failure?.marketId ?? "",
      strike: numberOrZero(failure?.strike),
      quantity: numberOrZero(failure?.quantity),
      message: failure?.message ?? "Exit failed",
    })),
  };
}

function normalizeOrderPreview(preview: OrderPreview): OrderPreview {
  return {
    matchId: preview?.matchId ?? "",
    marketId: preview?.marketId ?? "",
    strike: numberOrZero(preview?.strike),
    side: preview?.side === "sell" ? "sell" : "buy",
    type: preview?.type === "MARKET" ? "MARKET" : "LIMIT",
    quantity: numberOrZero(preview?.quantity),
    requestedPrice: numberOrZero(preview?.requestedPrice),
    orderPrice: numberOrZero(preview?.orderPrice),
    executablePrice: numberOrZero(preview?.executablePrice),
    bid: numberOrZero(preview?.bid),
    ask: numberOrZero(preview?.ask),
    notional: numberOrZero(preview?.notional),
    marginRequired: numberOrZero(preview?.marginRequired),
    availableBalance: numberOrZero(preview?.availableBalance),
    sufficientBalance: Boolean(preview?.sufficientBalance),
    willExecuteNow: Boolean(preview?.willExecuteNow),
    message: preview?.message ?? "",
  };
}

function compactPositionFilters(filters?: PositionQueryFilters): PositionQueryFilters {
  if (!filters) return {};

  return {
    ...(filters.matchId ? { matchId: filters.matchId } : {}),
    ...(filters.marketId ? { marketId: filters.marketId } : {}),
  };
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function symbolFromTitle(title: string): string {
  const words = title
    .split(/[\s/_-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (words.length === 0) return "0";
  return words.map((word) => word[0]).join("").toUpperCase() || "0";
}
