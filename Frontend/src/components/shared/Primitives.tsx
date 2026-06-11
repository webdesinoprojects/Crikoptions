import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react";

export function TrendBadge({
  value,
  percentage,
  trend,
  className,
}: {
  value?: number;
  percentage?: number;
  trend: "UP" | "DOWN" | "NEUTRAL";
  className?: string;
}) {
  const isUp = trend === "UP";
  const isDown = trend === "DOWN";

  return (
    <span
      className={cn(
        "flex items-center gap-1 font-bold whitespace-nowrap",
        isUp && "text-bull-green",
        isDown && "text-bear-red",
        !isUp && !isDown && "text-on-surface-variant",
        className
      )}
    >
      {isUp && <TrendingUp className="w-4 h-4" />}
      {isDown && <TrendingDown className="w-4 h-4" />}
      {value !== undefined && <span>{value > 0 && isUp ? `+${value}` : value}</span>}
      {percentage !== undefined && (
        <span className="text-xs ml-1">({percentage > 0 && isUp ? `+${percentage}%` : `${percentage}%`})</span>
      )}
    </span>
  );
}

export function LiveIndicator() {
  return (
    <span className="flex items-center gap-1.5 px-2 py-0.5 bg-bear-red/10 text-bear-red text-[10px] rounded font-bold uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-bear-red animate-pulse"></span>
      LIVE
    </span>
  );
}
