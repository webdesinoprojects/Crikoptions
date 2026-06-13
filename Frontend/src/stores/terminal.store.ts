import { create } from "zustand";

interface TerminalState {
  activeMarketId: string | null;
  selectedPrice: number | null;
  selectedSide: "BUY" | "SELL" | null;
  selectedStrike: number | null;
  orderSize: number;
  setActiveMarket: (id: string) => void;
  setSelectedPrice: (price: number) => void;
  setSelectedSide: (side: "BUY" | "SELL") => void;
  setOrderIntent: (intent: { side: "BUY" | "SELL"; price: number; strike?: number }) => void;
  setOrderSize: (size: number) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  activeMarketId: null,
  selectedPrice: null,
  selectedSide: null,
  selectedStrike: null,
  orderSize: 10,
  setActiveMarket: (id) => set({ activeMarketId: id }),
  setSelectedPrice: (price) => set({ selectedPrice: price }),
  setSelectedSide: (side) => set({ selectedSide: side }),
  setOrderIntent: ({ side, price, strike }) =>
    set({
      selectedSide: side,
      selectedPrice: price,
      selectedStrike: strike ?? null,
    }),
  setOrderSize: (size) => set({ orderSize: size }),
}));
