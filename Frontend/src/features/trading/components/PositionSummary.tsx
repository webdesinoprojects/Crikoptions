import React, { useState } from "react";
import { useOrders, useCancelOrder } from "../hooks";
import { toast } from "sonner";

interface PositionSummaryProps {
  matchId: string;
  marketId: string;
}

export function PositionSummary({ matchId, marketId }: PositionSummaryProps) {
  const [activeTab, setActiveTab] = useState<"POSITIONS" | "ORDERS">("ORDERS");
  
  const { data: orders, isLoading } = useOrders(matchId);
  const cancelOrderMutation = useCancelOrder();

  const handleCancel = (orderId: string) => {
    cancelOrderMutation.mutate(orderId, {
      onSuccess: () => {
        toast.success("Order cancelled successfully");
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || "Failed to cancel order";
        toast.error(`Cancellation failed: ${msg}`);
      },
    });
  };

  const activeOrders = orders ? orders.filter((o) => o.marketId === marketId) : [];

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col h-64">
      {/* Tabs */}
      <div className="flex bg-surface border-b border-outline-variant p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("POSITIONS")}
          className={`flex-1 py-1 text-[11px] font-bold rounded transition-all ${
            activeTab === "POSITIONS"
              ? "bg-surface-container-high text-on-surface"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Active Positions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ORDERS")}
          className={`flex-1 py-1 text-[11px] font-bold rounded transition-all ${
            activeTab === "ORDERS"
              ? "bg-surface-container-high text-on-surface"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Working Orders ({activeOrders.length})
        </button>
      </div>

      <div className="flex-grow p-2 overflow-y-auto scrollbar-hide text-[11px]">
        {activeTab === "POSITIONS" ? (
          /* Mock positions summary */
          <div className="flex flex-col gap-2">
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
                <tr className="hover:bg-surface-container transition-colors">
                  <td className="py-1 font-bold text-on-surface">MSDHONI</td>
                  <td className="py-1 text-center">₹152.00</td>
                  <td className="py-1 text-right text-bull-green font-bold">+150</td>
                  <td className="py-1 text-right text-bull-green font-bold">+₹375.00</td>
                </tr>
                <tr className="hover:bg-surface-container transition-colors">
                  <td className="py-1 font-bold text-on-surface">VKOHLI</td>
                  <td className="py-1 text-center">₹185.50</td>
                  <td className="py-1 text-right text-bear-red font-bold">-50</td>
                  <td className="py-1 text-right text-bear-red font-bold">-₹120.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          /* Live pending orders list */
          <div className="flex flex-col h-full">
            {isLoading ? (
              <div className="flex-grow flex items-center justify-center text-outline">Loading orders...</div>
            ) : activeOrders.length === 0 ? (
              <div className="flex-grow flex items-center justify-center text-outline">No working orders</div>
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
                        <td className={`py-1.5 font-bold ${isBuy ? "text-bull-green" : "text-bear-red"}`}>
                          {order.side}
                        </td>
                        <td className="py-1.5 font-bold text-on-surface">
                          ₹{order.price?.toFixed(2)}
                        </td>
                        <td className="py-1.5 text-center">
                          {order.quantity}
                        </td>
                        <td className="py-1.5 text-center uppercase text-[10px] text-on-surface-variant font-bold">
                          {order.status}
                        </td>
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
