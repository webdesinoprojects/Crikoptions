"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../hooks/useAuth";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getErrorMessage } from "@/lib/error-message";

export function ProfileManager() {
  const { user, updateProfile, isLoading } = useAuthStore();
  
  // Local state for all fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [maxExposure, setMaxExposure] = useState<number>(10000);
  const [defaultLeverage, setDefaultLeverage] = useState<number>(1);
  const [autoKillSwitch, setAutoKillSwitch] = useState<boolean>(false);
  const [theme, setTheme] = useState<string>("TERMINAL_DARK");
  const [dataDensity, setDataDensity] = useState<string>("COMPACT");

  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const frame = requestAnimationFrame(() => {
      setName(user.name);
      setPhone(user.phone || "");
      if (user.settings) {
        setMaxExposure(user.settings.riskLimits?.maxExposure || 10000);
        setDefaultLeverage(user.settings.riskLimits?.defaultLeverage || 1);
        setAutoKillSwitch(user.settings.riskLimits?.autoKillSwitch || false);
        setTheme(user.settings.preferences?.theme || "TERMINAL_DARK");
        setDataDensity(user.settings.preferences?.dataDensity || "COMPACT");
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
        phone: phone || undefined,
        settings: {
          riskLimits: { maxExposure, defaultLeverage, autoKillSwitch },
          preferences: { theme, dataDensity, notificationsEnabled: true }
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
      <div className="flex h-[400px] items-center justify-center font-mono text-xs text-on-surface-variant uppercase tracking-widest border border-dashed border-white/10 bg-black/40">
        [ NO ACTIVE SESSION FOUND ]
      </div>
    );
  }

  const initials = user.name.substring(0, 2).toUpperCase();
  const tierColor = user.tier === "INSTITUTIONAL" ? "#A855F7" : user.tier === "PRO" ? "#0EA5E9" : "#94a3b8";

  return (
    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-4 font-mono select-none">
      
      {/* LEFT COLUMN: IDENTITY & ACCESS */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="border border-white/10 bg-[#020617] rounded-none overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 group-hover:bg-primary transition-colors"></div>
          <div className="p-4 bg-black/40 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-[12px] font-bold text-white tracking-widest uppercase">[ IDENTITY & ACCESS ]</h2>
            <div className="flex items-center gap-2">
              <div
                className={`px-2 py-0.5 border text-[9px] font-bold tracking-wider ${
                  user.role === "admin"
                    ? "border-[#4AF626]/40 text-[#4AF626] bg-[#4AF626]/10"
                    : "border-white/20 text-on-surface-variant bg-black/40"
                }`}
              >
                {(user.role || "user").toUpperCase()} ROLE
              </div>
              <div className="px-2 py-0.5 border text-[9px] font-bold tracking-wider shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ borderColor: `${tierColor}40`, color: tierColor, backgroundColor: `${tierColor}10` }}>
                {user.tier || "STANDARD"} TIER
              </div>
            </div>
          </div>
          
          <div className="p-5 flex gap-5 items-start relative">
            <div className="w-20 h-20 shrink-0 border border-white/20 bg-black flex items-center justify-center relative overflow-hidden group-hover:border-primary/50 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.8)]">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.02)_4px,rgba(255,255,255,0.02)_8px)]"></div>
              <span className="text-2xl font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] tracking-tighter relative z-10">{initials}</span>
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">OPERATOR DESIGNATION</label>
                <input
                  type="text"
                  className="w-full bg-black/60 border border-white/10 focus:border-primary focus:shadow-[0_0_10px_rgba(14,165,233,0.3)] outline-none rounded-none px-3 py-2 text-[12px] text-white font-bold transition-all uppercase"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">SECURE COMMS LINK (PHONE)</label>
                <input
                  type="tel"
                  className="w-full bg-black/60 border border-white/10 focus:border-primary focus:shadow-[0_0_10px_rgba(14,165,233,0.3)] outline-none rounded-none px-3 py-2 text-[12px] text-white font-bold transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91..."
                />
              </div>
              <div className="space-y-1 opacity-70">
                <label className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">ENCRYPTED RELAY (EMAIL)</label>
                <input
                  type="email"
                  className="w-full bg-transparent border border-transparent border-b-white/10 rounded-none px-3 py-2 text-[11px] text-white/50 cursor-not-allowed uppercase"
                  value={user.email}
                  disabled
                />
              </div>
              {user.role !== "admin" && (
                <div className="rounded border border-[#FFB300]/30 bg-[#FFB300]/10 p-3 text-[9px] leading-relaxed text-[#FFB300]">
                  Admin wallet funding requires <strong>admin</strong> role from the backend. If you added your email to
                  <code className="mx-1">ADMIN_EMAILS</code>, restart the backend server, sign out, and sign in again so
                  your session picks up the new role.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TERMINAL PREFERENCES */}
        <div className="border border-white/10 bg-[#020617] rounded-none overflow-hidden relative">
          <div className="p-4 bg-black/40 border-b border-white/5">
            <h2 className="text-[12px] font-bold text-white tracking-widest uppercase">[ TERMINAL PREFERENCES ]</h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold block">AESTHETIC PROTOCOL</label>
              <div className="grid grid-cols-2 gap-2">
                {["TERMINAL_DARK", "HIGH_CONTRAST"].map(t => (
                  <button 
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`py-2 px-2 text-[9px] font-bold uppercase tracking-wider border transition-all ${theme === t ? "border-primary bg-primary/10 text-primary shadow-[inset_0_0_10px_rgba(14,165,233,0.2)]" : "border-white/10 bg-black/40 text-on-surface-variant hover:border-white/30 hover:text-white"}`}
                  >
                    {t.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold block">DATA DENSITY</label>
              <div className="grid grid-cols-2 gap-2">
                {["COMPACT", "COMFORT"].map(d => (
                  <button 
                    key={d}
                    type="button"
                    onClick={() => setDataDensity(d)}
                    className={`py-2 px-2 text-[9px] font-bold uppercase tracking-wider border transition-all ${dataDensity === d ? "border-[#4AF626] bg-[#4AF626]/10 text-[#4AF626] shadow-[inset_0_0_10px_rgba(74,246,38,0.2)]" : "border-white/10 bg-black/40 text-on-surface-variant hover:border-white/30 hover:text-white"}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: RISK LIMITS & SUBMIT */}
      <div className="flex-1 lg:max-w-md flex flex-col gap-4">
        <div className="border border-[#FF2A2A]/20 bg-[#020617] rounded-none overflow-hidden relative shadow-[0_0_30px_rgba(255,42,42,0.03)]">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#FF2A2A]/50"></div>
          <div className="p-4 bg-black/40 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-[12px] font-bold text-[#FF2A2A] tracking-widest uppercase drop-shadow-[0_0_8px_rgba(255,42,42,0.5)]">[ RISK & EXECUTION LIMITS ]</h2>
            <AlertCircle className="w-4 h-4 text-[#FF2A2A] opacity-80" />
          </div>
          
          <div className="p-5 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">MAX EXPOSURE PER TRADE</label>
                <span className="text-[14px] font-black text-white tracking-wider">₹{maxExposure.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="1000" 
                max="500000" 
                step="1000"
                value={maxExposure}
                onChange={(e) => setMaxExposure(Number(e.target.value))}
                className="w-full accent-[#FF2A2A] h-1 bg-white/10 appearance-none outline-none cursor-ew-resize" 
              />
              <div className="flex justify-between text-[8px] text-on-surface-variant opacity-60">
                <span>₹1K (MIN)</span>
                <span>₹500K (MAX)</span>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/5">
              <div className="flex justify-between items-end">
                <label className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">DEFAULT LEVERAGE (X)</label>
                <span className="text-[14px] font-black text-[#FFB300] tracking-wider">{defaultLeverage}x</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="1"
                value={defaultLeverage}
                onChange={(e) => setDefaultLeverage(Number(e.target.value))}
                className="w-full accent-[#FFB300] h-1 bg-white/10 appearance-none outline-none cursor-ew-resize" 
              />
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-white uppercase tracking-wider">AUTO-KILL SWITCH</div>
                <div className="text-[8px] text-on-surface-variant max-w-[200px] mt-0.5">LIQUIDATES ALL POSITIONS IF PORTFOLIO DROPS &gt;10% DAILY</div>
              </div>
              <button 
                type="button"
                onClick={() => setAutoKillSwitch(!autoKillSwitch)}
                className={`w-12 h-6 border ${autoKillSwitch ? 'bg-[#FF2A2A]/20 border-[#FF2A2A]' : 'bg-black border-white/20'} relative transition-colors`}
              >
                <motion.div 
                  className={`w-4 h-4 absolute top-[3px] bg-${autoKillSwitch ? '[#FF2A2A]' : 'white/40'}`}
                  animate={{ left: autoKillSwitch ? '26px' : '3px' }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* FEEDBACK & SUBMIT */}
        <AnimatePresence>
          {localError && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 border border-error/40 bg-error/10 text-[10px] text-error font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" /> [ ERROR: {localError} ]
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-3 border border-[#4AF626]/40 bg-[#4AF626]/10 text-[10px] text-[#4AF626] font-bold uppercase tracking-wider flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5" /> [ PROTOCOL UPDATED ]
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full mt-2 py-3 bg-primary text-black font-black text-[12px] uppercase tracking-widest hover:bg-[#38bdf8] hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] active:scale-[0.98] transition-all relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "[ TRANSMITTING... ]" : "[ COMMIT PROTOCOL SETTINGS ]"}
          </span>
        </button>
      </div>

    </div>
  );
}
