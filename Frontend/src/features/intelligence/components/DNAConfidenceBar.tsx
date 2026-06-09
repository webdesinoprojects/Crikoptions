"use client";

import { motion } from "framer-motion";

interface DNAConfidenceBarProps {
  confidence: number;
  status: "LIVE" | "STALE" | "SYNCING";
  latencyMs: number;
}

export function DNAConfidenceBar({ confidence, status, latencyMs }: DNAConfidenceBarProps) {
  const statusColor =
    status === "LIVE" ? "#4AF626" : status === "SYNCING" ? "#FFB300" : "#FF2A2A";

  return (
    <div className="flex items-center gap-4 select-none font-mono">
      {/* Live pulse */}
      <div
        className="flex items-center gap-1.5 px-2 py-0.5 border text-[9px] rounded-none bg-black/40"
        style={{
          borderColor: `${statusColor}40`,
        }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-none"
          style={{ backgroundColor: statusColor }}
          animate={{ opacity: status === "LIVE" ? [1, 0.2, 1] : 1 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span
          className="font-bold tracking-wider"
          style={{ color: statusColor }}
        >
          [SYNC:{status}]
        </span>
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">
          CONFIDENCE
        </span>
        <div className="flex gap-[2px]">
          {Array.from({ length: 10 }).map((_, i) => {
            const active = (confidence / 10) > i;
            const barColor = confidence > 85 ? "#4AF626" : confidence > 70 ? "#FFB300" : "#FF2A2A";
            return (
              <div
                key={i}
                className="w-1.5 h-3"
                style={{
                  backgroundColor: active ? barColor : "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${active ? barColor : "rgba(255, 255, 255, 0.1)"}`,
                }}
              />
            );
          })}
        </div>
        <span className="text-[10px] font-bold text-[#4AF626]">
          {confidence.toFixed(1)}%
        </span>
      </div>

      {/* Latency */}
      <div className="text-[9px] text-on-surface-variant border border-white/5 px-1 bg-black/20 rounded-none">
        LAT:{latencyMs}MS
      </div>
    </div>
  );
}

