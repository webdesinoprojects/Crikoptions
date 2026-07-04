"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useExitAllPositions, useOpenPositions } from "../hooks";

const CONFIRM_MS = 3500;

export function ExitAllPositionsButton() {
  const [armed, setArmed] = useState(false);
  const { data: positions = [], isLoading } = useOpenPositions();
  const exitAll = useExitAllPositions();

  const openTradeCount = useMemo(
    () => positions.filter((position) => position.lots !== 0).length,
    [positions]
  );
  const disabled = isLoading || exitAll.isPending || openTradeCount === 0;

  useEffect(() => {
    if (!armed) return;
    const timeout = window.setTimeout(() => setArmed(false), CONFIRM_MS);
    return () => window.clearTimeout(timeout);
  }, [armed]);

  const handleClick = () => {
    if (disabled) return;
    if (!armed) {
      setArmed(true);
      return;
    }

    exitAll.mutate(undefined, {
      onSuccess: (result) => {
        setArmed(false);
        if (result.requested === 0) {
          toast.success("No open trades to exit");
          return;
        }
        if (result.failed > 0) {
          toast.error(`Exited ${result.submitted}/${result.requested}; ${result.failures[0]?.message ?? "some exits failed"}`);
          return;
        }
        toast.success(`Exit all submitted for ${result.submitted} open trade${result.submitted === 1 ? "" : "s"}`);
      },
      onError: (error: unknown) => {
        setArmed(false);
        toast.error(getErrorMessage(error, "Failed to exit open trades"));
      },
    });
  };

  return (
    <button
      type="button"
      title={openTradeCount > 0 ? `Exit ${openTradeCount} open trade${openTradeCount === 1 ? "" : "s"}` : "No open trades"}
      onClick={handleClick}
      disabled={disabled}
      className={`flex h-14 min-w-[104px] shrink-0 items-center justify-center gap-2 rounded-lg border px-3 text-[11px] font-black uppercase tracking-wider transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 ${
        armed
          ? "border-bear-red/70 bg-bear-red/20 text-bear-red shadow-[0_0_18px_rgba(239,68,68,0.22)]"
          : "border-bear-red/35 bg-[#071327] text-bear-red hover:border-bear-red/60 hover:bg-bear-red/10"
      }`}
    >
      {exitAll.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
      <span>{exitAll.isPending ? "Exiting" : armed ? "Confirm" : "Exit All"}</span>
    </button>
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
