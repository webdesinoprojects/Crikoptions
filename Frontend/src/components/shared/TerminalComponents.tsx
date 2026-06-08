import React from "react";
import { cn } from "@/lib/utils";
import { TrendBadge } from "./Primitives";

interface TerminalPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerActions?: React.ReactNode;
  borderClass?: string;
  headerClass?: string;
  bodyClass?: string;
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
  ...props
}: TerminalPanelProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-outline/10 rounded-md overflow-hidden flex flex-col text-on-surface",
        borderClass,
        className
      )}
      {...props}
    >
      {(title || subtitle || headerActions) && (
        <div
          className={cn(
            "px-3 py-2 bg-surface-bright/50 border-b border-outline/5 flex items-center justify-between gap-4 select-none",
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
      <div className={cn("p-3 flex-1 flex flex-col min-h-0", bodyClass)}>{children}</div>
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
}: TerminalKPIProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-outline/10 p-3 rounded-md flex flex-col justify-between select-none min-h-[84px] text-on-surface",
        className
      )}
    >
      <div className="flex flex-col">
        <span className="text-on-surface-variant text-[9px] uppercase font-bold tracking-wider mb-0.5">
          {label}
        </span>
        <span className="text-xl font-bold font-data-tabular tracking-tight truncate">
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
