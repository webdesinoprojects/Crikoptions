import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex h-[calc(100dvh-64px)] w-full flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-white/5 bg-[#040a17]/50 p-8 shadow-2xl backdrop-blur-sm">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-primary/20"></div>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-sm font-bold tracking-wider text-white">INITIALIZING</h3>
          <p className="text-xs font-medium text-muted-foreground">Syncing market data...</p>
        </div>
      </div>
    </div>
  );
}
