import { dataSources, type DataSourceKind } from "@/lib/data-source";
import { cn } from "@/lib/utils";

const sourceStyles: Record<DataSourceKind, string> = {
  api: "border-bull-green/30 bg-bull-green/10 text-bull-green",
  derived: "border-primary/30 bg-primary/10 text-primary",
  static: "border-outline/30 bg-white/5 text-on-surface-variant",
};

export function DataSourceBadge({
  source,
  className,
}: {
  source: DataSourceKind;
  className?: string;
}) {
  const descriptor = dataSources[source];

  return (
    <span
      title={descriptor.description}
      className={cn(
        "inline-flex h-5 shrink-0 items-center rounded border px-1.5 text-[9px] font-bold uppercase tracking-wider",
        sourceStyles[source],
        className
      )}
    >
      {descriptor.label}
    </span>
  );
}
