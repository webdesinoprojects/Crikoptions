import { create } from "zustand";

interface TerminalState {
  activeMarketId: string | null;
  selectedPrice: number | null;
  orderSize: number;
  setActiveMarket: (id: string) => void;
  setSelectedPrice: (price: number) => void;
  setOrderSize: (size: number) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  activeMarketId: null,
  selectedPrice: null,
  orderSize: 10,
  setActiveMarket: (id) => set({ activeMarketId: id }),
  setSelectedPrice: (price) => set({ selectedPrice: price }),
  setOrderSize: (size) => set({ orderSize: size }),
}));
