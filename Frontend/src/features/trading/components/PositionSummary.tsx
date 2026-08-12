import React, { useState } from "react";
import { useOrders, useCancelOrder } from "../hooks";
import { usePositions } from "@/features/portfolio/hooks";
import { toast } from "sonner";

interface PositionSummaryProps {
  matchId: string;
  marketId: string;
}

export function PositionSummary({ matchId, marketId }: PositionSummaryProps) {
  const [activeTab, setActiveTab] = useState<"POSITIONS" | "ORDERS">("ORDERS");
  const { data: orders, isLoading } = useOrders(matchId);
  const { data: positions = [], isLoading: positionsLoading } = usePositions();
  const cancelOrderMutation = useCancelOrder();

  const handleCancel = (orderId: string) => {
    cancelOrderMutation.mutate(orderId, {
      onSuccess: () => toast.success("Order cancelled successfully"),
      onError: (err: unknown) => {
        const msg = getErrorMessage(err, "Failed to cancel order");
        toast.error(`Cancellation failed: ${msg}`);
      },
    });
  };

  const activeOrders = orders ? orders.filter((o) => o.marketId === marketId) : [];
  const activePositions = positions.filter((position) => position.marketId === marketId);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-md overflow-hidden flex h-full min-h-[180px] flex-col">
      <div className="bg-surface px-3 py-1.5 border-b border-outline-variant">
        <h3 className="text-sm font-semibold text-on-surface">Exposure</h3>
        <p className="text-[10px] text-on-surface-variant">Active positions and working orders</p>
      </div>

      <div className="flex bg-surface border-b border-outline-variant p-0.5 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("POSITIONS")}
          className={`flex-1 py-0.5 text-[10px] font-bold rounded transition-all ${
            activeTab === "POSITIONS" ? "bg-surface-container-high text-on-surface" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Active Positions ({activePositions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ORDERS")}
          className={`flex-1 py-0.5 text-[10px] font-bold rounded transition-all ${
            activeTab === "ORDERS" ? "bg-surface-container-high text-on-surface" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Working Orders ({activeOrders.length})
        </button>
      </div>

      <div className="flex-grow p-1.5 overflow-y-auto scrollbar-hide text-[11px]">
        {activeTab === "POSITIONS" ? (
          positionsLoading ? (
          <div className="flex h-full min-h-[100px] items-center justify-center text-outline">Loading positions...</div>
        ) : activePositions.length === 0 ? (
            <div className="flex h-full min-h-[100px] flex-col items-center justify-center rounded border border-dashed border-outline-variant text-center">
              <span className="text-sm font-semibold text-on-surface">No active positions</span>
              <span className="mt-1 text-[11px] text-on-surface-variant">Executed orders will appear here.</span>
            </div>
          ) : (
            <table className="w-full text-left font-data-tabular">
              <thead>
                <tr className="text-on-surface-variant border-b border-outline-variant">
                  <th className="pb-1">Asset</th>
                  <th className="pb-1 text-center">Avg. Entry</th>
                  <th className="pb-1 text-right">Size</th>
                  <th className="pb-1 text-right">PnL</th>
                </tr>
              </thead>
              <tbody>
                {activePositions.map((position) => {
                  const isUp = position.unrealizedPnL >= 0;
                  return (
                    <tr key={position.marketId} className="hover:bg-surface-container transition-colors">
                      <td className="py-1 font-bold text-on-surface">{position.symbol}</td>
                      <td className="py-1 text-center">₵{position.averageEntryPrice.toFixed(2)}</td>
                      <td className={`py-1 text-right font-bold ${position.side === "BUY" ? "text-bull-green" : "text-bear-red"}`}>
                        {position.side === "BUY" ? "+" : "-"}
                        {position.quantity}
                      </td>
                      <td className={`py-1 text-right font-bold ${isUp ? "text-bull-green" : "text-bear-red"}`}>
                        {isUp ? "+" : "-"}₵{Math.abs(position.unrealizedPnL).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : (
          <div className="flex flex-col h-full">
            {isLoading ? (
              <div className="flex-grow min-h-[100px] flex items-center justify-center text-outline">Loading orders...</div>
            ) : activeOrders.length === 0 ? (
              <div className="flex-grow min-h-[100px] flex flex-col items-center justify-center rounded border border-dashed border-outline-variant text-center">
                <span className="text-sm font-semibold text-on-surface">No working orders</span>
                <span className="mt-1 text-[11px] text-on-surface-variant">Open limits will appear here.</span>
              </div>
            ) : (
              <table className="w-full text-left font-data-tabular">
                <thead>
                  <tr className="text-on-surface-variant border-b border-outline-variant">
                    <th className="pb-1">Side</th>
                    <th className="pb-1">Price</th>
                    <th className="pb-1 text-center">Qty</th>
                    <th className="pb-1 text-center">Status</th>
                    <th className="pb-1 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrders.map((order) => {
                    const isBuy = order.side === "BUY";
                    const isPending = order.status === "PENDING";

                    return (
                      <tr key={order.id} className="hover:bg-surface-container transition-colors border-b border-outline-variant/30">
                        <td className={`py-1.5 font-bold ${isBuy ? "text-bull-green" : "text-bear-red"}`}>{order.side}</td>
                        <td className="py-1.5 font-bold text-on-surface">₵{order.price?.toFixed(2) ?? "0.00"}</td>
                        <td className="py-1.5 text-center">{order.quantity}</td>
                        <td className="py-1.5 text-center uppercase text-[10px] text-on-surface-variant font-bold">{order.status}</td>
                        <td className="py-1.5 text-right">
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleCancel(order.id)}
                              disabled={cancelOrderMutation.isPending}
                              className="bg-bear-red/10 hover:bg-bear-red/20 text-bear-red px-2 py-0.5 rounded font-bold transition-all disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
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
