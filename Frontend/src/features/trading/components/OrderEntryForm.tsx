import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { useTerminalStore } from "@/stores/terminal.store";
import { Match } from "@/types";
import { useCreateOrder, useMarketDetail, useOptionChain } from "../hooks";
import { buildOptionRows, buildPricePayload, findAtmRow, projectedRange } from "../utils/terminal-context";

interface OrderEntryFormProps {
  matchId: string;
  marketId: string;
  match?: Match;
}

export function OrderEntryForm({ matchId, marketId, match }: OrderEntryFormProps) {
  const [type, setType] = useState<"LIMIT" | "MARKET">("LIMIT");
  const orderSize = useTerminalStore((state) => state.orderSize);
  const setOrderSize = useTerminalStore((state) => state.setOrderSize);
  const [qty, setQty] = useState(String(orderSize));
  const [priceOverride, setPriceOverride] = useState<{ key: string; value: string } | null>(null);

  const selectedPriceStore = useTerminalStore((state) => state.selectedPrice);
  const selectedSideStore = useTerminalStore((state) => state.selectedSide);
  const setSelectedSide = useTerminalStore((state) => state.setSelectedSide);
  const selectedStrike = useTerminalStore((state) => state.selectedStrike);
  const { data: market } = useMarketDetail(marketId);
  const payload = useMemo(() => buildPricePayload(match, market), [match, market]);
  const { data: calculated } = useOptionChain(marketId, payload);
  const rows = useMemo(() => buildOptionRows(calculated, market), [calculated, market]);
  const selectedRow = rows.find((row) => row.strike === selectedStrike) ?? findAtmRow(rows);
  const createOrderMutation = useCreateOrder();

  const side = selectedSideStore ?? "BUY";
  const routedPrice = side === "BUY" ? selectedRow?.ask : selectedRow?.bid;
  const backendPrice = selectedPriceStore ?? routedPrice ?? market?.ltp ?? market?.buyerPrice ?? market?.sellerPrice ?? 0;
  const priceKey = `${selectedStrike ?? "market"}:${backendPrice.toFixed(2)}`;
  const displayPrice = priceOverride?.key === priceKey ? priceOverride.value : backendPrice.toFixed(2);
  const priceValue = type === "MARKET" ? backendPrice : Number.parseFloat(displayPrice) || 0;
  const qtyValue = Number.parseInt(qty, 10) || 0;
  const marginRequired = priceValue * qtyValue;
  const fairLtp = calculated?.ltp ?? market?.ltp ?? 0;
  const sensitivity = ballSensitivity(match?.ballsLeft ?? 120, match?.wicketsLost ?? 0);

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
          setQty(String(orderSize));
        },
        onError: (error: unknown) => {
          const errMsg = getErrorMessage(error, "Failed to place order");
          toast.error(`Order Failed: ${errMsg}`);
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-fit self-start flex-col gap-2 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest p-2.5"
    >
      <div className="flex shrink-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-black text-on-surface">Order Ticket</h3>
          <p className="truncate text-[11px] text-on-surface-variant">
            {selectedRow ? `Strike ${selectedRow.strike.toFixed(0)} selected` : market?.title ?? "Select a strike"}
          </p>
        </div>
        <span
          className={`rounded border px-2 py-1 text-[10px] font-black ${
            side === "BUY"
              ? "border-bull-green/20 bg-bull-green/10 text-bull-green"
              : "border-bear-red/20 bg-bear-red/10 text-bear-red"
          }`}
        >
          {side}
        </span>
      </div>

      <div className="shrink-0 rounded-md border border-outline-variant bg-surface-container-high/70 p-1.5 text-[10px]">
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          <TicketMetric label="Projected final" value={projectedRange(calculated?.projectedS0 ?? market?.ltp)} highlight />
          <TicketMetric label="Fair LTP" value={fairLtp.toFixed(2)} />
          <TicketMetric
            label={`Strike ${selectedRow?.strike?.toFixed(0) ?? "--"} prob`}
            value={selectedRow ? `${selectedRow.impliedProbability}%` : "--"}
            highlight
          />
          <TicketMetric label="Ball sensitivity" value={sensitivity} />
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 rounded-md border border-outline-variant bg-surface p-0.5">
        {(["BUY", "SELL"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSelectedSide(option)}
            className={`h-6 rounded text-[11px] font-black transition-all ${
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

      <div className="flex shrink-0 gap-4 border-b border-outline-variant">
        {(["LIMIT", "MARKET"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setType(option)}
            className={`border-b-2 pb-1 text-[10px] font-black transition-all ${
              type === option ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {option === "LIMIT" ? "Limit Order" : "Market Order"}
          </button>
        ))}
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-2">
        {type === "LIMIT" && (
          <div className="grid gap-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
              Limit (Rs)
            </label>
            <input
              type="number"
              step="0.05"
              value={displayPrice}
              onChange={(e) => setPriceOverride({ key: priceKey, value: e.target.value })}
              className="h-7 rounded-md border border-outline-variant bg-surface px-2 font-data-tabular text-[12px] text-on-surface focus:border-primary focus:outline-none"
            />
          </div>
        )}

        <div className="grid gap-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
            Quantity
          </label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="h-7 rounded-md border border-outline-variant bg-surface px-2 font-data-tabular text-[12px] text-on-surface focus:border-primary focus:outline-none"
          />
        </div>

        <div className="col-span-2 grid grid-cols-4 gap-1">
          {[5, 10, 25, 50].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                setOrderSize(size);
                setQty(String(size));
              }}
              className={`h-5 rounded border text-[10px] font-black transition-colors ${
                qtyValue === size
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-outline-variant bg-surface text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="shrink-0 rounded-md border border-outline-variant bg-surface p-1.5 text-[10px]">
        <div className="flex justify-between text-on-surface-variant">
          <span>Estimated Price</span>
          <span className="font-data-tabular text-on-surface">Rs {priceValue.toFixed(2)}</span>
        </div>
        <div className="mt-0.5 flex justify-between text-on-surface-variant">
          <span>Required Margin</span>
          <span className="font-data-tabular font-black text-on-surface">
            Rs {marginRequired.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={createOrderMutation.isPending || !matchId || !marketId}
        className={`h-9 shrink-0 rounded-md text-[12px] font-black text-white shadow-lg transition-all hover:shadow-xl ${
          side === "BUY" ? "bg-bull-green hover:bg-bull-green/90" : "bg-bear-red hover:bg-bear-red/90"
        } disabled:opacity-50`}
      >
        {createOrderMutation.isPending
          ? "Placing order..."
          : `${side === "BUY" ? "Buy" : "Sell"} ${type === "LIMIT" ? "Limit" : "Market"} - Rs ${marginRequired.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
      </button>
    </form>
  );
}

function TicketMetric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="truncate text-on-surface-variant">{label}</div>
      <div className={`font-data-tabular font-black ${highlight ? "text-teal-200" : "text-on-surface"}`}>{value}</div>
    </div>
  );
}

function ballSensitivity(ballsLeft: number, wicketsLost: number) {
  if (ballsLeft <= 18 || wicketsLost >= 7) return "High";
  if (ballsLeft <= 42 || wicketsLost >= 4) return "Medium";
  return "Low";
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
