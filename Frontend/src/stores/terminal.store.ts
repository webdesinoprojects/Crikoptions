import { create } from "zustand";

interface TerminalState {
  activeMarketId: string | null;
  selectedPrice: number | null;
  selectedSide: "BUY" | "SELL" | null;
  selectedStrike: number | null;
  strikeSelectionSource: "auto" | "user" | null;
  orderSize: number;
  setActiveMarket: (id: string) => void;
  setSelectedPrice: (price: number) => void;
  setSelectedSide: (side: "BUY" | "SELL") => void;
  setOrderIntent: (intent: { side: "BUY" | "SELL"; price: number; strike?: number; source?: "auto" | "user" }) => void;
  setOrderSize: (size: number) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  activeMarketId: null,
  selectedPrice: null,
  selectedSide: null,
  selectedStrike: null,
  strikeSelectionSource: null,
  orderSize: 10,
  setActiveMarket: (id) =>
    set((state) => {
      if (state.activeMarketId === id) return {};

      return {
        activeMarketId: id,
        selectedPrice: null,
        selectedStrike: null,
        strikeSelectionSource: null,
      };
    }),
  setSelectedPrice: (price) => set({ selectedPrice: price }),
  setSelectedSide: (side) => set({ selectedSide: side }),
  setOrderIntent: ({ side, price, strike, source = "user" }) =>
    set({
      selectedSide: side,
      selectedPrice: price,
      selectedStrike: strike ?? null,
      strikeSelectionSource: strike == null ? null : source,
    }),
  setOrderSize: (size) => set({ orderSize: size }),
}));
