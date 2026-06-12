import React, { useState } from "react";
import { useTerminalStore } from "@/stores/terminal.store";
import { useCreateOrder, useMarketDetail } from "../hooks";
import { toast } from "sonner";

interface OrderEntryFormProps {
  matchId: string;
  marketId: string;
}

export function OrderEntryForm({ matchId, marketId }: OrderEntryFormProps) {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [type, setType] = useState<"LIMIT" | "MARKET">("LIMIT");
  const [qty, setQty] = useState("0");
  const [price, setPrice] = useState("0");

  const selectedPriceStore = useTerminalStore((state) => state.selectedPrice);
  const { data: market } = useMarketDetail(marketId);
  const createOrderMutation = useCreateOrder();

  const backendPrice = selectedPriceStore ?? market?.ltp ?? market?.buyerPrice ?? market?.sellerPrice ?? 0;
  const displayPrice = price === "0" ? backendPrice.toFixed(2) : price;
  const priceValue = type === "MARKET" ? backendPrice : Number.parseFloat(displayPrice) || 0;
  const qtyValue = Number.parseInt(qty, 10) || 0;
  const marginRequired = priceValue * qtyValue;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!matchId || !marketId) {
      toast.error("No backend market context available");
      return;
    }
    if (qtyValue <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    if (priceValue <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    createOrderMutation.mutate(
      {
        matchId,
        marketId,
        side: side.toLowerCase() as "buy" | "sell",
        quantity: qtyValue,
        price: priceValue,
      },
      {
        onSuccess: (data) => {
          toast.success(`Order placed: ${side} ${qtyValue} units @ Rs ${(data.price ?? 0).toFixed(2)}`);
          setQty("0");
        },
        onError: (error: unknown) => {
          const errMsg = getErrorMessage(error, "Failed to place order");
          toast.error(`Order Failed: ${errMsg}`);
        },
      }
    );
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-4">
      <div className="grid grid-cols-2 bg-surface p-1 rounded-lg border border-outline-variant">
        {(["BUY", "SELL"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSide(option)}
            className={`py-1.5 text-xs font-bold rounded-md transition-all ${
              side === option
                ? option === "BUY"
                  ? "bg-bull-green text-white shadow"
                  : "bg-bear-red text-white shadow"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-4 border-b border-outline-variant pb-2">
          {(["LIMIT", "MARKET"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setType(option)}
              className={`text-xs font-bold pb-1 transition-all border-b-2 ${
                type === option ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {option === "LIMIT" ? "Limit Order" : "Market Order"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {type === "LIMIT" && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                Limit Price (Rs)
              </label>
              <input
                type="number"
                step="0.05"
                value={displayPrice}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary font-data-tabular"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
              Quantity
            </label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="bg-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary font-data-tabular"
            />
          </div>
        </div>

        <div className="bg-surface p-3 rounded-lg flex flex-col gap-1.5 text-xs border border-outline-variant">
          <div className="flex justify-between text-on-surface-variant">
            <span>Estimated Price:</span>
            <span className="font-data-tabular text-on-surface">Rs {priceValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <span>Required Margin:</span>
            <span className="font-bold text-on-surface font-data-tabular">
              Rs {marginRequired.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={createOrderMutation.isPending || !matchId || !marketId}
          className={`w-full py-2.5 rounded-lg text-xs font-bold text-white transition-all shadow-lg hover:shadow-xl ${
            side === "BUY" ? "bg-bull-green hover:bg-bull-green/90" : "bg-bear-red hover:bg-bear-red/90"
          } disabled:opacity-50`}
        >
          {createOrderMutation.isPending ? "Placing Order..." : `${side} ${type}`}
        </button>
      </form>
    </div>
  );
}

function getErrorMessage(error: unknown, defaultMessage: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }
  return defaultMessage;
}
