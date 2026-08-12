import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function FriendsLeague() {
  const leaderboard = [
    { rank: 1, initial: "A", name: "Aryan", pnl: "+₵14,820", isMe: false },
    { rank: 2, initial: "M", name: "Meera", pnl: "+₵11,460", isMe: false },
    { rank: 3, initial: "D", name: "Dev", pnl: "+₵9,180", isMe: false },
    { rank: 4, initial: "K", name: "You", pnl: "+₵8,420", isMe: true },
  ];

  return (
    <div className="bg-[#0a1428] rounded-xl border border-white/10 p-5 h-full flex flex-col">
      <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-1">Friends League</h3>
      <p className="text-xs text-on-surface-variant mb-5">This week</p>

      <div className="flex-1 space-y-1">
        {leaderboard.map((user) => (
          <div key={user.rank} className={cn(
            "flex items-center justify-between p-2 rounded-lg transition-colors",
            user.isMe ? "bg-[#00284d] border border-cyan-500/30" : "hover:bg-white/5 border border-transparent"
          )}>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold font-data-tabular text-white/50 w-4 text-center">{user.rank}</span>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black",
                user.isMe ? "bg-cyan-500 text-[#000d1a]" : "bg-white/10 text-white"
              )}>
                {user.initial}
              </div>
              <span className={cn("text-sm font-medium", user.isMe ? "text-cyan-400" : "text-white/90")}>
                {user.name}
              </span>
            </div>
            <span className="text-sm font-bold font-data-tabular text-bull-green">
              {user.pnl}
            </span>
          </div>
        ))}
        
        <div className="pt-2 px-2 pb-1">
          <p className="text-xs text-on-surface-variant italic">₵760 to reach #3</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 text-center">
        <Link href="/profile" className="text-xs font-bold text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors flex items-center justify-center gap-1 w-full">
          View League <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
