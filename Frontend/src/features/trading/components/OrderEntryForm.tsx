import React, { useState, useEffect } from "react";
import { useTerminalStore } from "@/stores/terminal.store";
import { useCreateOrder } from "../hooks";
import { toast } from "sonner";

interface OrderEntryFormProps {
  matchId: string;
  marketId: string;
}

export function OrderEntryForm({ matchId, marketId }: OrderEntryFormProps) {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [type, setType] = useState<"LIMIT" | "MARKET">("LIMIT");
  const [qty, setQty] = useState<string>("10");
  
  const selectedPriceStore = useTerminalStore((state) => state.selectedPrice);
  const setSelectedPriceStore = useTerminalStore((state) => state.setSelectedPrice);
  const [price, setPrice] = useState<string>("150.00");

  const createOrderMutation = useCreateOrder();

  // Prefill price when selected from the order book
  useEffect(() => {
    if (selectedPriceStore !== null) {
      setPrice(selectedPriceStore.toFixed(2));
    }
  }, [selectedPriceStore]);

  const priceValue = parseFloat(price) || 0;
  const qtyValue = parseInt(qty) || 0;
  const marginRequired = priceValue * qtyValue;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (qtyValue <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    
    if (type === "LIMIT" && priceValue <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    createOrderMutation.mutate(
      {
        matchId,
        marketId,
        side: side.toLowerCase() as "buy" | "sell",
        quantity: qtyValue,
        price: type === "LIMIT" ? priceValue : 155.00, // standard market fallback
      },
      {
        onSuccess: (data) => {
          toast.success(`Order Placed: ${side} ${qtyValue} units @ ₹${(data.price ?? 0).toFixed(2)}`);
          setQty("10");
        },
        onError: (error: any) => {
          const errMsg = error?.response?.data?.message || "Failed to place order";
          toast.error(`Order Failed: ${errMsg}`);
        },
      }
    );
  };

  const handlePercentage = (pct: number) => {
    // For demo/simulated account, assume 1000 max quantity capacity
    const calculatedQty = Math.floor((1000 * pct) / 100);
    setQty(calculatedQty.toString());
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-4">
      {/* Side Selector Tabs */}
      <div className="grid grid-cols-2 bg-surface p-1 rounded-lg border border-outline-variant">
        <button
          type="button"
          onClick={() => setSide("BUY")}
          className={`py-1.5 text-xs font-bold rounded-md transition-all ${
            side === "BUY"
              ? "bg-bull-green text-white shadow"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          BUY
        </button>
        <button
          type="button"
          onClick={() => setSide("SELL")}
          className={`py-1.5 text-xs font-bold rounded-md transition-all ${
            side === "SELL"
              ? "bg-bear-red text-white shadow"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          SELL
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Type Selector (Market / Limit) */}
        <div className="flex gap-4 border-b border-outline-variant pb-2">
          <button
            type="button"
            onClick={() => setType("LIMIT")}
            className={`text-xs font-bold pb-1 transition-all border-b-2 ${
              type === "LIMIT"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Limit Order
          </button>
          <button
            type="button"
            onClick={() => setType("MARKET")}
            className={`text-xs font-bold pb-1 transition-all border-b-2 ${
              type === "MARKET"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Market Order
          </button>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-3">
          {type === "LIMIT" && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                Limit Price (₹)
              </label>
              <input
                type="number"
                step="0.05"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary font-data-tabular"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                Quantity
              </label>
              <span className="text-[10px] text-on-surface-variant font-data-tabular">
                Est. Max: 1,000
              </span>
            </div>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary font-data-tabular"
            />
          </div>
        </div>

        {/* Percentage Selector Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => handlePercentage(pct)}
              className="bg-surface hover:bg-surface-container border border-outline-variant rounded-md py-1 text-[10px] font-bold text-on-surface-variant transition-colors"
            >
              {pct === 100 ? "MAX" : `${pct}%`}
            </button>
          ))}
        </div>

        {/* Margin Calculations */}
        <div className="bg-surface p-3 rounded-lg flex flex-col gap-1.5 text-xs border border-outline-variant">
          <div className="flex justify-between text-on-surface-variant">
            <span>Estimated Price:</span>
            <span className="font-data-tabular text-on-surface">
              ₹{type === "LIMIT" ? priceValue.toFixed(2) : "155.00"}
            </span>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <span>Required Margin:</span>
            <span className="font-bold text-on-surface font-data-tabular">
              ₹{marginRequired.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={createOrderMutation.isPending}
          className={`w-full py-2.5 rounded-lg text-xs font-bold text-white transition-all shadow-lg hover:shadow-xl ${
            side === "BUY"
              ? "bg-bull-green hover:bg-bull-green/90"
              : "bg-bear-red hover:bg-bear-red/90"
          } disabled:opacity-50`}
        >
          {createOrderMutation.isPending
            ? "Placing Order..."
            : `${side} ${type}`}
        </button>
      </form>
    </div>
  );
}
