"use client";

import { motion } from "framer-motion";

interface DNAConfidenceBarProps {
  confidence: number;
  status: "LIVE" | "STALE" | "SYNCING";
  latencyMs: number;
}

export function DNAConfidenceBar({ confidence, status, latencyMs }: DNAConfidenceBarProps) {
  const statusColor =
    status === "LIVE" ? "#22c55e" : status === "SYNCING" ? "#ffd700" : "#94a3b8";

  return (
    <div className="flex items-center gap-4 select-none">
      {/* Live pulse */}
      <div
        className="flex items-center gap-2 px-2 py-0.5 rounded border text-[10px]"
        style={{
          backgroundColor: `${statusColor}15`,
          borderColor: `${statusColor}30`,
        }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: statusColor }}
          animate={{ opacity: status === "LIVE" ? [1, 0.3, 1] : 1 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span
          className="font-bold font-data-tabular tracking-wider"
          style={{ color: statusColor }}
        >
          DNA SYNC: {status}
        </span>
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">
          DNA CONFIDENCE
        </span>
        <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor:
                confidence > 85 ? "#22c55e" : confidence > 70 ? "#ffd700" : "#ef4444",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <span className="text-[11px] font-data-tabular font-bold text-primary">
          {confidence.toFixed(1)}%
        </span>
      </div>

      {/* Latency */}
      <div className="text-[9px] font-data-tabular text-on-surface-variant">
        {latencyMs}ms
      </div>
    </div>
  );
}
