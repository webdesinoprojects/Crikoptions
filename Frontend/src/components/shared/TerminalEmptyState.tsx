"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TerminalEmptyStateProps {
  title: string;
  description?: string;
  className?: string;
  minHeight?: string;
  variant?: "default" | "compact";
}

export function TerminalEmptyState({
  title,
  description,
  className,
  minHeight = "min-h-[100px]",
  variant = "default",
}: TerminalEmptyStateProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center p-3",
        minHeight,
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={cn(
          "relative w-full overflow-hidden rounded-lg border border-outline-variant/60 bg-surface/40 text-center",
          isCompact ? "px-4 py-5" : "px-5 py-7"
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.08),transparent_55%)]" />

        <div className="relative mx-auto flex flex-col items-center gap-3">
          <div className="flex flex-col items-center gap-1.5">
            {[0, 1, 2].map((index) => (
              <motion.span
                key={index}
                className="block h-1 rounded-full bg-primary/70"
                style={{ width: 28 - index * 6 }}
                animate={{ opacity: [0.35, 1, 0.35], scaleX: [0.85, 1, 0.85] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  delay: index * 0.18,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-1.5">
            <p
              className={cn(
                "font-semibold tracking-tight text-on-surface",
                isCompact ? "text-[11px]" : "text-sm"
              )}
            >
              {title}
            </p>
            {description ? (
              <p
                className={cn(
                  "max-w-[240px] leading-relaxed text-on-surface-variant",
                  isCompact ? "text-[10px]" : "text-[11px]"
                )}
              >
                {description}
              </p>
            ) : null}
          </div>

          <motion.div
            className="h-px w-16 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            animate={{ opacity: [0.3, 0.9, 0.3], scaleX: [0.7, 1, 0.7] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
}
