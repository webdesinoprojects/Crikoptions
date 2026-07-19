import { tradingService, type CreateOrderPayload } from "../services/trading.service";
import type { Order as FrontendOrder } from "@/types";

export function isTradingStateConflict(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("response" in error)) return false;
  const response = (error as { response?: { status?: number; data?: { code?: string; message?: string } } }).response;
  if (response?.status === 409 || response?.data?.code === "TRADING_STATE_CHANGED") return true;
  const message = (response?.data?.message ?? "").toLowerCase();
  return message.includes("trading state changed") || message.includes("refresh the quote");
}

/**
 * Place an order after refreshing the quote when the trading state moved.
 * Sells/exits are especially sensitive to stale versions and missing pricingSnapshot.
 */
export async function submitOrderWithFreshQuote(
  payload: CreateOrderPayload,
  options?: { retries?: number }
): Promise<FrontendOrder> {
  const maxRetries = options?.retries ?? 1;
  let attempt = 0;
  let current = { ...payload };

  while (true) {
    try {
      current = await hydrateOrderQuote(current);
      return await tradingService.createOrder(current);
    } catch (error) {
      if (!isTradingStateConflict(error) || attempt >= maxRetries) {
        throw error;
      }
      attempt += 1;
      // Drop stale versions and re-preview against the latest match/trading state.
      current = {
        ...current,
        expectedMatchStateVersion: undefined,
        expectedTradingVersion: undefined,
        quoteExpiresAt: undefined,
      };
    }
  }
}

async function hydrateOrderQuote(payload: CreateOrderPayload): Promise<CreateOrderPayload> {
  // Always refresh through preview so sell/exit gets executable bid + fresh versions.
  const preview = await tradingService.previewOrder(payload);

  const marketPrice =
    payload.type === "MARKET"
      ? preview.executablePrice > 0
        ? preview.executablePrice
        : preview.orderPrice > 0
          ? preview.orderPrice
          : payload.price
      : payload.price;

  return {
    ...payload,
    price: marketPrice > 0 ? marketPrice : payload.price,
    expectedMatchStateVersion: preview.matchStateVersion,
    expectedTradingVersion: preview.tradingVersion,
    quoteExpiresAt: preview.expiresAt,
  };
}
