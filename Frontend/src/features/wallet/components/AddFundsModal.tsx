"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Plus, Wallet, Loader2, Check } from "lucide-react";
import { walletService } from "../services/wallet.service";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newBalance: number) => void;
}

const PRESET_AMOUNTS = [1000, 2000, 5000, 10000, 25000, 50000];

function formatINR(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

type ModalStep = "input" | "loading" | "success";

export function AddFundsModal({ isOpen, onClose, onSuccess }: AddFundsModalProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<ModalStep>("input");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState("");
  
  // Track previous balance to show delta properly
  const [previousBalance, setPreviousBalance] = useState(0);
  const [addedAmount, setAddedAmount] = useState(0);

  // Fetch initial balance so we have the 'previous' balance ready
  useEffect(() => {
    if (isOpen) {
      const currentOverview = queryClient.getQueryData<any>(["dashboard", "overview"]);
      setPreviousBalance(currentOverview?.marginAvailable ?? 0);
    }
  }, [isOpen, queryClient]);

  const activeAmount = selectedPreset ?? (customAmount ? parseFloat(customAmount) : 0);

  const handlePreset = (amount: number) => {
    setSelectedPreset(amount);
    setCustomAmount("");
    setError("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(raw);
    setSelectedPreset(null);
    setError("");
  };

  const handleSubmit = useCallback(async () => {
    const amount = activeAmount;
    if (!amount || amount <= 0) {
      setError("Please select or enter an amount.");
      return;
    }
    if (amount > 99999) {
      setError("Maximum top-up is ₹99,999 per transaction.");
      return;
    }

    setError("");
    setStep("loading");
    setAddedAmount(amount);

    try {
      const result = await walletService.topUp(amount);
      setStep("success");
      // Invalidate dashboard + wallet so balances refresh instantly
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      onSuccess?.(result.wallet.availableBalance);
    } catch {
      setStep("input");
      setError("Failed to add funds. Please try again.");
    }
  }, [activeAmount, onSuccess, queryClient]);

  const handleClose = () => {
    if (step === "loading") return;
    setStep("input");
    setSelectedPreset(null);
    setCustomAmount("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#020617]/80 backdrop-blur-md transition-all" onClick={handleClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {step === "success" ? (
          <FundsAddedModal
            amount={addedAmount}
            previousBalance={previousBalance}
            onClose={handleClose}
          />
        ) : (
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl shadow-black/60"
            style={{
              background: "linear-gradient(160deg, #0a1428 0%, #060e1f 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              animation: "modalSlideIn 0.28s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-60" />

            {step !== "loading" && (
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-white/30 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {step === "loading" && (
              <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-[#d4af37]/20" />
                  <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
                </div>
                <p className="text-lg font-semibold text-white">Processing...</p>
                <p className="text-sm text-white/40">Adding Rs {formatINR(activeAmount)} to your wallet</p>
              </div>
            )}

            {step === "input" && (
              <>
                <div className="border-b border-white/5 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}
                    >
                      <Wallet className="h-5 w-5 text-[#d4af37]" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">Add Funds</h2>
                      <p className="text-xs text-white/40">Paper money · No real money involved</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 px-6 py-5">
                  <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/35">
                      Quick Select
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {PRESET_AMOUNTS.map((amount) => {
                        const isSelected = selectedPreset === amount;
                        return (
                          <button
                            key={amount}
                            onClick={() => handlePreset(amount)}
                            className="relative rounded-xl py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.97]"
                            style={
                              isSelected
                                ? {
                                    background: "rgba(212,175,55,0.15)",
                                    border: "1px solid rgba(212,175,55,0.6)",
                                    color: "#d4af37",
                                    boxShadow: "0 0 12px rgba(212,175,55,0.15)",
                                  }
                                : {
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    color: "rgba(255,255,255,0.6)",
                                  }
                            }
                          >
                            Rs {formatINR(amount)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/35">
                      Or Enter Amount
                    </p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-white/30">
                        Rs
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={customAmount}
                        onChange={handleCustomChange}
                        className="w-full rounded-xl py-3 pl-10 pr-4 text-base font-bold tabular-nums text-white placeholder-white/20 outline-none transition"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: customAmount
                            ? "1px solid rgba(212,175,55,0.4)"
                            : "1px solid rgba(255,255,255,0.08)",
                        }}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-white/25">
                      Min Rs 1 · Max Rs 99,999 per transaction
                    </p>
                  </div>

                  {error && (
                    <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                      {error}
                    </p>
                  )}

                  {activeAmount > 0 && (
                    <div
                      className="flex items-center justify-between rounded-xl px-4 py-3"
                      style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)" }}
                    >
                      <span className="text-xs text-white/40">You will receive</span>
                      <span className="text-sm font-black tabular-nums text-[#d4af37]">
                        Rs {formatINR(activeAmount)}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={!activeAmount || activeAmount <= 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold uppercase tracking-widest text-[#000d1a] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35"
                    style={{ background: "linear-gradient(135deg, #d4af37 0%, #f5d060 50%, #d4af37 100%)" }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Rs {activeAmount > 0 ? formatINR(activeAmount) : "0"} to Wallet
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.90) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable Premium Success Modal
// ─────────────────────────────────────────────────────────────────────────────

interface FundsAddedModalProps {
  amount: number;
  previousBalance: number;
  onClose: () => void;
}

export function FundsAddedModal({ amount, previousBalance, onClose }: FundsAddedModalProps) {
  const newBalance = previousBalance + amount;



  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="relative w-full max-w-[540px] overflow-hidden rounded-2xl border border-white/5 bg-[#081225] shadow-2xl"
    >
      {/* Decorative top glow */}
      <div className="absolute -top-24 left-1/2 h-48 w-64 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[60px]" />
      
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-5 top-5 z-20 rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative z-10 px-8 pb-8 pt-10 text-center">
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-500/10 blur-xl"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
            className="relative flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-[#040d1c] shadow-[0_0_20px_rgba(16,185,129,0.15)] z-10"
          >
            <Check className="h-8 w-8 text-emerald-400" strokeWidth={2.5} />
          </motion.div>
          {/* Subtle pulse ring */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: "easeOut", repeat: Infinity, repeatDelay: 2 }}
            className="absolute inset-0 rounded-full border border-emerald-400/40"
          />
          
          {/* Party Poppers */}
          <motion.div
            initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: -45 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 1], x: -40, y: -30, rotate: -15 }}
            transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
            className="absolute z-20 text-2xl"
          >
            🎉
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 45 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.8], x: 45, y: -20, rotate: 25 }}
            transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
            className="absolute z-20 text-xl"
          >
            🎉
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.1, 0.9], x: 0, y: -50, rotate: 10 }}
            transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
            className="absolute z-20 text-lg"
          >
            🎉
          </motion.div>

          {/* Gold sparks */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 0], y: -20, x: -15 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="absolute left-2 top-0 h-1.5 w-1.5 rounded-full bg-[#d4af37]"
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 0], y: -25, x: 20 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute right-2 top-2 h-1 w-1 rounded-full bg-cyan-400"
          />
        </div>

        {/* Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">Funds Added!</h2>
          <p className="mx-auto max-w-[280px] text-sm text-white/50 leading-relaxed">
            <span className="font-semibold text-emerald-400">Rs {formatINR(amount)}</span> has been credited to your paper wallet.
          </p>
        </motion.div>



        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mx-auto mt-6 flex max-w-sm flex-col items-center rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
          <div className="relative z-10 w-full flex justify-between items-start">
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60 mb-1">
                New Available Balance
              </span>
              <span className="font-mono text-3xl font-bold tracking-tight text-white">
                Rs {formatINR(newBalance)}
              </span>
            </div>
            <div className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-1 border border-emerald-500/20">
              <Plus className="h-3 w-3 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 tabular-nums">
                Rs {formatINR(amount)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Progress Timeline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex justify-between items-center px-4"
        >
          <TimelineStep label="Request" delay={0.7} />
          <TimelineLine delay={0.8} />
          <TimelineStep label="Credited" delay={0.9} />
          <TimelineLine delay={1.0} />
          <TimelineStep label="Ready" delay={1.1} active />
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-10 flex flex-col gap-3"
        >
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-[0_4px_15px_rgba(16,185,129,0.2)] transition-all hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(16,185,129,0.3)] active:scale-[0.98]"
          >
            Done
          </button>
          <button
            onClick={() => {
              // Stub for future navigation
              onClose();
            }}
            className="text-xs font-medium text-white/40 transition-colors hover:text-white"
          >
            View Wallet Activity
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function TimelineStep({ label, delay, active }: { label: string; delay: number; active?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col items-center gap-2"
    >
      <div className={`flex h-5 w-5 items-center justify-center rounded-full ${active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-emerald-500/20'}`}>
        <Check className={`h-3 w-3 ${active ? 'text-[#040d1c]' : 'text-emerald-400'}`} strokeWidth={3} />
      </div>
      <span className={`text-[9px] font-bold uppercase tracking-wider ${active ? 'text-white' : 'text-white/40'}`}>
        {label}
      </span>
    </motion.div>
  );
}

function TimelineLine({ delay }: { delay: number }) {
  return (
    <div className="h-0.5 flex-1 mx-2 overflow-hidden rounded bg-white/5 relative -top-3">
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "0%" }}
        transition={{ delay, duration: 0.4, ease: "easeOut" }}
        className="h-full w-full bg-emerald-500/40"
      />
    </div>
  );
}
