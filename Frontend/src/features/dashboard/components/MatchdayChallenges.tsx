import { Trophy, Target, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

export function MatchdayChallenges() {
  return (
    <div className="bg-[#0a1428] rounded-xl border border-white/10 p-5 h-full flex flex-col">
      <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-5">Matchday Challenges</h3>

      <div className="flex-1 space-y-4">
        {/* Highlighted Challenge */}
        <div className="bg-black/40 rounded-xl border border-[#d4af37]/30 p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-2xl -mr-10 -mt-10" />
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex flex-col items-center justify-center shrink-0 border border-[#d4af37]/20">
              <Trophy className="w-5 h-5 text-[#d4af37] mb-0.5" />
              <span className="text-[10px] font-bold text-[#d4af37] font-data-tabular">2 / 3</span>
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white tracking-wide mb-1 uppercase">Read the Chase</h4>
              <p className="text-xs text-white/60 mb-3 line-clamp-2">Complete 3 paper trades during a successful run chase</p>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#d4af37] rounded-full" style={{ width: "66%" }} />
                </div>
                <span className="text-xs font-bold text-[#d4af37]">+250 XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Other Challenges */}
        <div className="space-y-1">
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer">
            <div className="flex items-center gap-3">
              <Target className="w-4 h-4 text-white/40" />
              <span className="text-xs font-medium text-white/80 group-hover:text-white transition-colors">Three-match positive streak</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-data-tabular text-cyan-400">2 / 3</span>
              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-bull-green" />
              <span className="text-xs font-medium text-white/80 group-hover:text-white transition-colors">Trade with exposure below 25%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-bull-green">Complete</span>
              <CheckCircle2 className="w-4 h-4 text-bull-green" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 text-center">
        <Link href="/profile" className="text-xs font-bold text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors flex items-center justify-center gap-1 w-full">
          View All Challenges <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
