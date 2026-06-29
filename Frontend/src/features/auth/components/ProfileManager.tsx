"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../hooks/useAuth";
import { AlertCircle, CheckCircle, Loader2, Camera, Calendar, MapPin, TrendingUp, Trophy, Target, Shield, Info, Bell, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getErrorMessage } from "@/lib/error-message";
import { usePerformance } from "@/features/portfolio/hooks";

// A reusable lightweight SVG sparkline
function Sparkline({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 30;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible mt-2">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <path
        fill={`url(#gradient-${color.replace('#', '')})`}
        d={`M0,${height} L${points} L${width},${height} Z`}
        opacity="0.2"
      />
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ProfileManager() {
  const { user, updateProfile, isLoading } = useAuthStore();
  const { portfolio } = usePerformance();
  
  const [name, setName] = useState("");
  const [maxExposure, setMaxExposure] = useState<number>(20000);
  const [dailyLossLimit, setDailyLossLimit] = useState<number>(10000);
  const [highVolWarning, setHighVolWarning] = useState(true);
  const [confirmOrders, setConfirmOrders] = useState(true);

  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const frame = requestAnimationFrame(() => {
      setName(user.name);
      if (user.settings) {
        setMaxExposure(user.settings.riskLimits?.maxExposure || 20000);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setLocalError(null);
    try {
      await updateProfile({
        name,
        settings: {
          riskLimits: { maxExposure, defaultLeverage: 1, autoKillSwitch: false },
          preferences: { theme: "PREMIUM_DARK", dataDensity: "COMFORT", notificationsEnabled: true }
        }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: unknown) {
      setLocalError(getErrorMessage(error, "Failed to update profile settings."));
    }
  };

  if (!user) {
    return (
      <div className="flex h-[400px] items-center justify-center font-mono text-xs text-slate-500 uppercase tracking-widest border border-dashed border-white/10 bg-black/40 rounded-2xl">
        Loading Profile...
      </div>
    );
  }

  const initials = user.name.substring(0, 1).toUpperCase();
  const joinDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Jun 2026";

  // Derive real performance data
  const walletBalance = portfolio?.totalEquity ?? 0;
  const totalPnL = portfolio?.totalPnL ?? 0;
  const pnlPercent = portfolio?.totalPnLPct ?? 0;
  const winRate = portfolio?.winRate ?? 0;
  
  const closedTrades = portfolio?.closedTrades ?? [];
  const winningTrades = closedTrades.filter(t => t.realizedPnL > 0).length;
  const bestTradeAmount = closedTrades.length > 0 ? Math.max(...closedTrades.map(t => t.realizedPnL)) : 0;
  
  const totalTradesCount = (portfolio?.openPositionsCount ?? 0) + (portfolio?.closedTradesCount ?? 0);
  
  // Calculate Avg Holding Time
  const avgHoldingMs = closedTrades.length > 0 
    ? closedTrades.reduce((sum, t) => sum + (t.holdingPeriodMs || 0), 0) / closedTrades.length 
    : 0;
  const avgHoldingMins = Math.floor(avgHoldingMs / 60000);
  const avgHoldingSecs = Math.floor((avgHoldingMs % 60000) / 1000);
  
  // Calculate Most Active Match
  const matchCounts = closedTrades.reduce((acc, t) => {
    acc[t.matchName] = (acc[t.matchName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostActiveMatch = Object.entries(matchCounts).sort((a, b) => b[1] - a[1])[0];

  const perfData = {
    balance: walletBalance.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
    totalPnl: totalPnL > 0 ? `+${totalPnL.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : totalPnL.toLocaleString("en-IN", { maximumFractionDigits: 0 }),
    pnlPercent: pnlPercent > 0 ? `+${pnlPercent.toFixed(2)}%` : `${pnlPercent.toFixed(2)}%`,
    winRate: `${winRate.toFixed(1)}%`,
    winRateDesc: `${winningTrades} / ${closedTrades.length} Trades`,
    totalTrades: totalTradesCount,
    closedTrades: portfolio?.closedTradesCount ?? 0,
    bestTrade: bestTradeAmount > 0 ? `+₹${bestTradeAmount.toLocaleString("en-IN")}` : `₹0`,
    avgHoldingTime: avgHoldingMs > 0 ? `${avgHoldingMins}m ${avgHoldingSecs}s` : "-",
    mostActiveMatch: mostActiveMatch ? mostActiveMatch[0] : "-",
    mostActiveMatchCount: mostActiveMatch ? mostActiveMatch[1] : 0,
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6 font-sans select-none pb-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row gap-6 items-center xl:items-start justify-between">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
          <div className="relative group mx-auto sm:mx-0">
            <div className="w-24 h-24 rounded-full border border-[#d4af37]/40 bg-[#0a0f1a] flex items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.15)]">
               <span className="text-4xl font-light text-[#d4af37]">{initials}</span>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors shadow-lg cursor-pointer">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <h1 className="text-3xl font-semibold text-white tracking-tight">{name}</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                {user.tier || "STANDARD TRADER"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap items-center sm:items-start justify-center sm:justify-start gap-2 sm:gap-6 mt-3 text-sm text-slate-400 font-medium">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 opacity-70" /> Member Since {joinDate}</span>
              <span className="flex items-center gap-2"><Trophy className="w-4 h-4 opacity-70" /> Favorite Team RCB</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 opacity-70" /> Location India</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-4 w-full xl:w-auto">
          <div className="flex-1 xl:w-48 bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center relative overflow-hidden backdrop-blur-md">
             <div className="text-xs text-slate-400 font-medium flex items-center gap-2 mb-1"><Wallet className="w-4 h-4 text-sky-400" /> Paper Balance</div>
             <div className="text-xl font-bold text-white tracking-tight">Rs {perfData.balance}</div>
             <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-sky-500/50 rounded-t-full shadow-[0_0_10px_rgba(14,165,233,0.8)]"></div>
          </div>
          <div className="flex-1 xl:w-48 bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center backdrop-blur-md">
             <div className="text-xs text-slate-400 font-medium flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-emerald-400" /> Total P&L</div>
             <div className="text-xl font-bold text-emerald-400 tracking-tight">{perfData.totalPnl}</div>
             <div className="text-xs text-emerald-400/80 mt-0.5">{perfData.pnlPercent}</div>
          </div>
          <div className="flex-1 xl:w-48 bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center backdrop-blur-md">
             <div className="text-xs text-slate-400 font-medium flex items-center gap-2 mb-1"><Target className="w-4 h-4 text-slate-300" /> Win Rate</div>
             <div className="text-xl font-bold text-white tracking-tight">{perfData.winRate}</div>
             <div className="text-xs text-slate-500 mt-0.5">{perfData.winRateDesc}</div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        
        {/* LEFT COLUMN: TRADER CARD */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="relative rounded-2xl border border-[#d4af37]/30 bg-gradient-to-br from-[#1a1500] to-[#050505] overflow-hidden p-6 shadow-[0_10px_40px_rgba(212,175,55,0.05)] h-full">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#d4af37]/0 via-[#d4af37] to-[#d4af37]/0 opacity-50"></div>
             <div className="flex items-center gap-2 text-[#d4af37] text-xs font-black tracking-widest uppercase mb-8">
               <Trophy className="w-4 h-4" /> CricOptions Trader Card
             </div>
             
             <div className="space-y-4 relative z-10">
               <div className="flex justify-between items-center border-b border-white/5 pb-3">
                 <span className="text-xs text-slate-400 font-medium tracking-wide">TRADING STYLE</span>
                 <span className="text-sm text-white font-semibold">Chase Trader</span>
               </div>
               <div className="flex justify-between items-center border-b border-white/5 pb-3">
                 <span className="text-xs text-slate-400 font-medium tracking-wide">FAVORITE MARKET</span>
                 <span className="text-sm text-white font-semibold">Player Runs</span>
               </div>
               <div className="flex justify-between items-center border-b border-white/5 pb-3">
                 <span className="text-xs text-slate-400 font-medium tracking-wide">RISK PROFILE</span>
                 <span className="text-sm text-[#d4af37] font-semibold">Balanced</span>
               </div>
               <div className="flex justify-between items-center border-b border-white/5 pb-3">
                 <span className="text-xs text-slate-400 font-medium tracking-wide">BEST PREDICTION</span>
                 <span className="text-sm text-white font-semibold">Kohli 50+ Runs</span>
               </div>
             </div>

             {/* Stylized background silhouette or gradient */}
             <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none"></div>
             <div className="mt-12 text-2xl font-[Brush_Script_MT,cursive] text-[#d4af37]/80 opacity-70 transform -rotate-2 select-none">
               {name || "Trader"}
             </div>
             <div className="absolute bottom-4 left-6 right-6 flex gap-1 opacity-20 pointer-events-none">
               {Array.from({length: 30}).map((_, i) => (
                 <div key={i} className="h-4 w-1 bg-[#d4af37] rounded-sm" style={{ height: Math.random() * 16 + 8 }}></div>
               ))}
             </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: PERFORMANCE SNAPSHOT */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 h-full flex flex-col backdrop-blur-md">
            <h2 className="text-sm font-bold text-white tracking-wider uppercase mb-6">Performance Snapshot</h2>
            
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4 flex flex-col justify-between group hover:border-white/10 transition-colors">
                <span className="text-xs text-slate-400 font-medium">Total Trades</span>
                <div className="mt-2 text-2xl font-bold text-white">{perfData.totalTrades}</div>
                <div className="h-8 mt-2 opacity-50 group-hover:opacity-100 transition-opacity"><Sparkline data={[1, 3, 2, 5, 4, 7, 6, 9]} color="#3b82f6" /></div>
              </div>
              <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4 flex flex-col justify-between group hover:border-white/10 transition-colors">
                <span className="text-xs text-slate-400 font-medium">Closed Trades</span>
                <div className="mt-2 text-2xl font-bold text-white">{perfData.closedTrades}</div>
                <div className="h-8 mt-2 opacity-50 group-hover:opacity-100 transition-opacity"><Sparkline data={[0, 1, 1, 2, 4, 3, 5, 6]} color="#0ea5e9" /></div>
              </div>
              <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4 flex flex-col justify-between col-span-2 sm:col-span-1 group hover:border-white/10 transition-colors">
                <span className="text-xs text-slate-400 font-medium">Best Trade</span>
                <div className="mt-2 text-xl font-bold text-emerald-400">{perfData.bestTrade}</div>
                <div className="h-8 mt-2 opacity-50 group-hover:opacity-100 transition-opacity"><Sparkline data={[2, 3, 5, 4, 8, 6, 9, 12]} color="#10b981" /></div>
              </div>
              <div className="grid grid-rows-2 gap-4 col-span-2 sm:col-span-1">
                <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">Avg Holding Time</span>
                  <div className="text-lg font-bold text-white">{perfData.avgHoldingTime}</div>
                </div>
                <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">Most Active Match</span>
                  <div className="text-sm font-bold text-white truncate" title={perfData.mostActiveMatch}>{perfData.mostActiveMatch}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{perfData.mostActiveMatchCount} Trades</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RISK & SETTINGS */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-sm font-bold text-white tracking-wider uppercase mb-6 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" /> Risk Controls
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-300 font-medium flex items-center gap-1">
                    Daily Paper Loss Limit <Info className="w-3 h-3 text-slate-500" />
                  </label>
                  <span className="text-sm font-bold text-white">Rs {dailyLossLimit.toLocaleString("en-IN")}</span>
                </div>
                <input 
                  type="range" min="1000" max="50000" step="1000"
                  value={dailyLossLimit} onChange={(e) => setDailyLossLimit(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-full appearance-none outline-none cursor-pointer" 
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>50% of balance</span>
                  <span>Rs 50,000</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-300 font-medium flex items-center gap-1">
                    Max Position Size <Info className="w-3 h-3 text-slate-500" />
                  </label>
                  <span className="text-sm font-bold text-white">Rs {maxExposure.toLocaleString("en-IN")}</span>
                </div>
                <input 
                  type="range" min="1000" max="50000" step="1000"
                  value={maxExposure} onChange={(e) => setMaxExposure(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-full appearance-none outline-none cursor-pointer" 
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>24% of balance</span>
                  <span>Rs 50,000</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-300 font-medium flex items-center gap-1">
                    High Vol Warning <Info className="w-3 h-3 text-slate-500" />
                  </label>
                  <button onClick={() => setHighVolWarning(!highVolWarning)} className={`w-9 h-5 rounded-full relative transition-colors ${highVolWarning ? 'bg-blue-500' : 'bg-slate-700'}`}>
                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all ${highVolWarning ? 'left-[19px]' : 'left-[3px]'}`} />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-300 font-medium flex items-center gap-1">
                    Confirm Orders <Info className="w-3 h-3 text-slate-500" />
                  </label>
                  <button onClick={() => setConfirmOrders(!confirmOrders)} className={`w-9 h-5 rounded-full relative transition-colors ${confirmOrders ? 'bg-blue-500' : 'bg-slate-700'}`}>
                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all ${confirmOrders ? 'left-[19px]' : 'left-[3px]'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* NOTIFICATIONS SECTION */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
            <h2 className="text-sm font-bold text-white tracking-wider uppercase mb-5 flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-400" /> Match Notifications
            </h2>
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Match starts</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Get notified when a match begins</div>
                  </div>
                  <button className="w-9 h-5 bg-emerald-500 rounded-full relative shadow-[0_0_10px_rgba(16,185,129,0.3)]"><div className="w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] left-[19px]"></div></button>
               </div>
               <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Player market moves</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Alert when followed market moves 10%</div>
                  </div>
                  <button className="w-9 h-5 bg-emerald-500 rounded-full relative shadow-[0_0_10px_rgba(16,185,129,0.3)]"><div className="w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] left-[19px]"></div></button>
               </div>
               <button className="w-full mt-2 py-2 border border-white/10 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors">Manage All Notifications</button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.2)] hover:shadow-[0_0_30px_rgba(14,165,233,0.4)] flex justify-center items-center gap-2 mt-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Saving..." : "Save Settings"}
          </button>

          <AnimatePresence>
            {localError && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-xs text-red-400 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {localError}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-400 font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Settings updated successfully
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
