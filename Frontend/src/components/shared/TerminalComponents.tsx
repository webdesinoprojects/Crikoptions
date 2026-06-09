import React from "react";
import { cn } from "@/lib/utils";
import { TrendBadge } from "./Primitives";
import { PrecisionArc } from "@/features/shared/components/PrecisionArc";

interface TerminalPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerActions?: React.ReactNode;
  borderClass?: string;
  headerClass?: string;
  bodyClass?: string;
  density?: "default" | "dense";
}

export function TerminalPanel({
  title,
  subtitle,
  headerActions,
  children,
  className,
  borderClass,
  headerClass,
  bodyClass,
  density = "default",
  ...props
}: TerminalPanelProps) {
  const isRoundedNone = className?.includes("rounded-none") || borderClass?.includes("rounded-none");
  const roundedClass = isRoundedNone ? "rounded-none" : "rounded-md";
  const isDense = density === "dense";

  return (
    <div
      className={cn(
        "bg-surface border border-outline/10 overflow-hidden flex flex-col text-on-surface relative",
        roundedClass,
        borderClass,
        className
      )}
      {...props}
    >
      {isRoundedNone && <PrecisionArc />}
      {(title || subtitle || headerActions) && (
        <div
          className={cn(
            "bg-surface-bright/50 border-b border-outline/5 flex items-center justify-between gap-4 select-none",
            isDense ? "px-2.5 py-1" : "px-3 py-2",
            headerClass
          )}
        >
          <div className="flex flex-col min-w-0">
            {title && (
              <h4 className="text-[11px] font-bold text-on-surface uppercase tracking-wider truncate">
                {title}
              </h4>
            )}
            {subtitle && (
              <p className="text-[9px] text-on-surface-variant truncate">
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && <div className="flex items-center gap-1.5 shrink-0">{headerActions}</div>}
        </div>
      )}
      <div className={cn("flex-1 flex flex-col min-h-0", isDense ? "p-2" : "p-3", bodyClass)}>{children}</div>
    </div>
  );
}

interface TerminalKPIProps {
  label: string;
  value: string | number;
  changeValue?: number;
  changePercent?: number;
  trend?: "UP" | "DOWN" | "NEUTRAL";
  progress?: number;
  subText?: string;
  className?: string;
  density?: "default" | "dense";
}

export function TerminalKPI({
  label,
  value,
  changeValue,
  changePercent,
  trend,
  progress,
  subText,
  className,
  density = "default",
}: TerminalKPIProps) {
  const isRoundedNone = className?.includes("rounded-none");
  const roundedClass = isRoundedNone ? "rounded-none" : "rounded-md";
  const isDense = density === "dense";

  return (
    <div
      className={cn(
        "bg-surface border border-outline/10 flex flex-col justify-between select-none text-on-surface",
        roundedClass,
        isDense ? "p-2.5 min-h-[68px]" : "p-3 min-h-[84px]",
        className
      )}
    >
      <div className="flex flex-col">
        <span className="text-on-surface-variant text-[9px] uppercase font-bold tracking-wider mb-0.5">
          {label}
        </span>
        <span className={cn("font-bold font-data-tabular tracking-tight truncate", isDense ? "text-base" : "text-xl")}>
          {value}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 min-h-[16px]">
        {trend && (changeValue !== undefined || changePercent !== undefined) ? (
          <TrendBadge
            value={changeValue}
            percentage={changePercent}
            trend={trend}
            className="text-[10px]"
          />
        ) : subText ? (
          <span className="text-[10px] text-on-surface-variant truncate">{subText}</span>
        ) : null}

        {progress !== undefined && (
          <div className="flex items-center gap-1.5 shrink-0">
            {subText && progress === undefined && (
              <span className="text-[9px] text-on-surface-variant">{subText}</span>
            )}
            <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-on-surface-variant font-data-tabular">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

