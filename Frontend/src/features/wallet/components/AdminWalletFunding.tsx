"use client";

import React from "react";
import { toast } from "sonner";
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, Wallet, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import {
  useAdminCreditWallet,
  useAdminDebitWallet,
  useAdminWallet,
  useAdminWalletLedger,
} from "../hooks";

type FundingMode = "credit" | "debit";

export function AdminWalletFunding() {
  const user = useAuthStore((state) => state.user);
  const [userId, setUserId] = React.useState("");
  const [amount, setAmount] = React.useState("10000");
  const [reason, setReason] = React.useState("Admin paper wallet funding");
  const [mode, setMode] = React.useState<FundingMode>("credit");
  const [formError, setFormError] = React.useState<string | null>(null);

  const normalizedUserId = userId.trim();
  const isAdmin = user?.role === "admin";
  const isUserIdReady = normalizedUserId.length === 24;
  const walletQuery = useAdminWallet(normalizedUserId, isAdmin && isUserIdReady);
  const ledgerQuery = useAdminWalletLedger(isUserIdReady ? normalizedUserId : undefined, 25, isAdmin && isUserIdReady);
  const creditMutation = useAdminCreditWallet();
  const debitMutation = useAdminDebitWallet();
  const activeMutation = mode === "credit" ? creditMutation : debitMutation;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    const parsedAmount = Number.parseFloat(amount);
    if (!isAdmin) {
      toast.error("Admin access required");
      return;
    }
    if (!isUserIdReady) {
      toast.error("Enter a valid 24-character user ID");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter a positive amount");
      return;
    }

    activeMutation.mutate(
      {
        userId: normalizedUserId,
        payload: {
          amount: parsedAmount,
          reason,
        },
      },
      {
        onSuccess: (result) => {
          setFormError(null);
          toast.success(
            `${mode === "credit" ? "Credited" : "Debited"} Rs ${formatMoney(parsedAmount)}. Available: Rs ${formatMoney(
              result.wallet.availableBalance
            )}`
          );
        },
        onError: (error: unknown) => {
          const message = getErrorMessage(error, "Wallet adjustment failed");
          setFormError(message);
          toast.error(message);
        },
      }
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-on-surface">
      <div className="border-b border-outline/10 px-4 py-3">
        <h1 className="text-sm font-black uppercase tracking-wider text-white">Admin Wallet Funding</h1>
        <p className="mt-1 text-[11px] text-on-surface-variant">
          Credit or debit paper money for beta trading accounts. Every adjustment is written to the wallet ledger.
        </p>
        {user && (
          <p className="mt-2 text-[10px] text-on-surface-variant">
            Signed in as <span className="font-bold text-white">{user.email}</span> with role{" "}
            <span className={`font-bold ${user.role === "admin" ? "text-bull-green" : "text-bear-red"}`}>
              {user.role || "user"}
            </span>
            .
          </p>
        )}
      </div>

      {!isAdmin ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-center">
            <h2 className="text-base font-black text-white">Admin access required</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Wallet funding is restricted to authenticated admin users.
            </p>
          </div>
        </div>
      ) : (
      <div className="grid flex-1 gap-3 overflow-y-auto p-3 lg:grid-cols-[420px_minmax(0,1fr)]">
        <form onSubmit={handleSubmit} className="h-fit rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-black">Paper Wallet Control</div>
              <div className="text-[11px] text-on-surface-variant">Phase 1 admin funding workflow</div>
            </div>
          </div>

          <label className="grid gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">User ID</span>
            <input
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="24-char Mongo user ID"
              className="h-10 rounded-md border border-outline-variant bg-surface px-3 font-data-tabular text-sm text-on-surface outline-none focus:border-primary"
            />
          </label>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["credit", "debit"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                className={`flex h-9 items-center justify-center gap-2 rounded-md border text-xs font-black uppercase transition-colors ${
                  mode === option
                    ? option === "credit"
                      ? "border-bull-green/40 bg-bull-green/15 text-bull-green"
                      : "border-bear-red/40 bg-bear-red/15 text-bear-red"
                    : "border-outline-variant bg-surface text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {option === "credit" ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                {option}
              </button>
            ))}
          </div>

          <label className="mt-3 grid gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-10 rounded-md border border-outline-variant bg-surface px-3 font-data-tabular text-sm text-on-surface outline-none focus:border-primary"
            />
          </label>

          <label className="mt-3 grid gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Reason</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              className="resize-none rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
            />
          </label>

          <button
            type="submit"
            disabled={activeMutation.isPending || !isUserIdReady}
            className={`mt-4 h-10 w-full rounded-md text-sm font-black text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              mode === "credit" ? "bg-bull-green hover:bg-bull-green/90" : "bg-bear-red hover:bg-bear-red/90"
            }`}
          >
            {activeMutation.isPending ? "Applying..." : `${mode === "credit" ? "Credit" : "Debit"} Paper Wallet`}
          </button>

          {formError && (
            <div className="mt-3 flex items-start gap-2 rounded-md border border-bear-red/30 bg-bear-red/10 p-3 text-xs text-bear-red">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
        </form>

        <div className="grid gap-3 lg:grid-rows-[auto_minmax(0,1fr)]">
          <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black">Wallet Snapshot</h2>
                <p className="text-[11px] text-on-surface-variant">Backend account state for the selected user.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  walletQuery.refetch();
                  ledgerQuery.refetch();
                }}
                disabled={!isUserIdReady}
                className="rounded border border-outline-variant bg-surface p-2 text-on-surface-variant hover:text-on-surface disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <BalanceCard label="Cash" value={walletQuery.data?.cashBalance ?? 0} />
              <BalanceCard label="Available" value={walletQuery.data?.availableBalance ?? 0} accent />
              <BalanceCard label="Reserved" value={walletQuery.data?.reservedBalance ?? 0} />
              <BalanceCard label="Currency" text={walletQuery.data?.currency ?? "PAPER_INR"} />
            </div>

            {walletQuery.isError && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-bear-red/30 bg-bear-red/10 p-3 text-xs text-bear-red">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{getErrorMessage(walletQuery.error, "Failed to load wallet snapshot")}</span>
              </div>
            )}
          </section>

          <section className="min-h-[280px] overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
            <div className="border-b border-outline-variant bg-surface px-3 py-2">
              <h2 className="text-sm font-black">Ledger</h2>
              <p className="text-[11px] text-on-surface-variant">Latest wallet movements for this user.</p>
            </div>
            <div className="max-h-[520px] overflow-y-auto p-2">
              {!isUserIdReady ? (
                <EmptyState label="Enter a user ID to load ledger entries" />
              ) : ledgerQuery.isLoading ? (
                <EmptyState label="Loading ledger" />
              ) : (ledgerQuery.data ?? []).length === 0 ? (
                <EmptyState label="No ledger entries" />
              ) : (
                <div className="space-y-1">
                  {ledgerQuery.data?.map((entry) => (
                    <div
                      key={entry._id}
                      className="grid grid-cols-[120px_1fr_120px] gap-2 rounded-md border border-outline-variant bg-surface px-3 py-2 text-xs"
                    >
                      <div className={entry.type === "ADMIN_CREDIT" ? "font-black text-bull-green" : "font-black text-bear-red"}>
                        {entry.type.replace("ADMIN_", "")}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-on-surface">{entry.description || "Admin adjustment"}</div>
                        <div className="mt-1 truncate font-data-tabular text-[10px] text-on-surface-variant">
                          {formatDate(entry.createdAt)} | {entry.balanceBefore.toFixed(2)} to {entry.balanceAfter.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right font-data-tabular font-black">Rs {formatMoney(entry.amount)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      )}
    </div>
  );
}

function BalanceCard({ label, value, text, accent }: { label: string; value?: number; text?: string; accent?: boolean }) {
  return (
    <div className="rounded-md border border-outline-variant bg-surface p-3">
      <div className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">{label}</div>
      <div className={`mt-2 font-data-tabular text-lg font-black ${accent ? "text-primary" : "text-on-surface"}`}>
        {text ?? `Rs ${formatMoney(value ?? 0)}`}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-md border border-dashed border-outline-variant text-sm text-on-surface-variant">
      {label}
    </div>
  );
}

function formatMoney(value: number) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString();
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response;
    if (typeof response === "object" && response !== null && "data" in response) {
      const data = response.data;
      if (typeof data === "object" && data !== null) {
        if ("message" in data && typeof data.message === "string" && data.message.trim()) {
          if (data.message.toLowerCase().includes("admin access required")) {
            return "Admin access required on the backend. Restart the backend after updating ADMIN_EMAILS, then sign out and sign in again.";
          }
          return data.message;
        }
        if ("error" in data && typeof data.error === "string" && data.error.trim()) {
          return data.error;
        }
      }
    }
    if (typeof response === "object" && response !== null && "status" in response) {
      const status = response.status;
      if (status === 401) return "Unauthorized. Log in again with an admin account.";
      if (status === 403) return "Forbidden. Your account does not have backend admin permissions.";
      if (status === 404) return "User or wallet not found for that ID.";
    }
  }
  if (error instanceof Error && error.message.trim()) {
    if (error.message.includes("timeout")) {
      return "Request timed out. Check that the backend is running and NEXT_PUBLIC_API_URL is correct.";
    }
    return error.message;
  }
  return fallback;
}
