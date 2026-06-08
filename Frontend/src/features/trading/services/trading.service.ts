import { Quote, Trade, MarketDepth } from "@/types";

// Mock data repositories for trading terminal
class TradingService {
  async getMarketCandles(marketId: string, timeframe: string): Promise<Quote[]> {
    // Generate some mock candlestick data for Lightweight Charts
    return new Promise((resolve) => {
      setTimeout(() => {
        const candles: Quote[] = [];
        let basePrice = 150;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 60; i++) {
          const time = new Date(now.getTime() - (60 - i) * 24 * 60 * 60 * 1000).getTime() / 1000; // Daily candles
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

  async getOrderBook(marketId: string): Promise<MarketDepth> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const basePrice = 154.50;
        const bids = [];
        const asks = [];
        
        for (let i = 0; i < 10; i++) {
          bids.push({ price: basePrice - (i * 0.05), quantity: Math.floor(Math.random() * 2000) + 100 });
          asks.push({ price: basePrice + ((i + 1) * 0.05), quantity: Math.floor(Math.random() * 2000) + 100 });
        }
        
        resolve({
          marketId,
          bids: bids.sort((a, b) => b.price - a.price),
          asks: asks.sort((a, b) => a.price - b.price),
          spread: asks[0].price - bids[0].price
        });
      }, 300);
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
