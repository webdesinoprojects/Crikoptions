import Link from "next/link";

export function LastMatchRecap() {
  return (
    <div className="bg-[#0a1428] rounded-xl border border-white/10 p-5 h-full flex flex-col">
      <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-5">Last Match Recap</h3>

      <div className="flex-1 flex gap-4">
        {/* Match Result Block */}
        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-800 border border-blue-600 flex items-center justify-center font-black text-white text-xs">IND</div>
            <span className="text-xs font-bold text-on-surface-variant">VS</span>
            <div className="w-10 h-10 rounded-full bg-black border border-white/20 flex items-center justify-center font-black text-white text-xs">NZ</div>
          </div>
          <div className="text-sm font-bold text-bull-green mt-2">
            IND won by 6 wickets
          </div>
        </div>

        {/* Stats Block */}
        <div className="flex-1 flex flex-col justify-center space-y-4 py-2">
          <div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Your Result</div>
            <div className="text-sm font-bold font-data-tabular text-bull-green">+₵2,480</div>
          </div>
          <div className="h-px w-full bg-white/5" />
          <div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Predictions Correct</div>
            <div className="text-sm font-bold font-data-tabular text-cyan-400">4 of 6</div>
          </div>
          <div className="h-px w-full bg-white/5" />
          <div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Best Prediction</div>
            <div className="text-sm font-medium text-white/90">Kohli 50+</div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 text-center">
        <Link href="/portfolio" className="text-xs font-bold text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors flex items-center justify-center gap-1 w-full">
          Review Trades
        </Link>
      </div>
    </div>
  );
}
