"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../hooks/useAuth";
import { TerminalPanel } from "@/components/shared/TerminalComponents";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export function ProfileManager() {
  const { user, updateProfile, isLoading, error } = useAuthStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setLocalError(null);
    try {
      await updateProfile({ name, phone: phone || undefined });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setLocalError(err.message || "Failed to update profile settings.");
    }
  };

  if (!user) {
    return (
      <div className="p-4 text-center text-on-surface-variant text-xs">
        No active user session. Please sign in to manage your profile.
      </div>
    );
  }

  return (
    <TerminalPanel
      title="User Profile Settings"
      subtitle="Manage your personal details and contact settings"
      className="max-w-md mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {localError && (
          <div className="p-3 rounded border border-error/20 bg-error/5 flex items-center gap-2 text-xs text-error font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded border border-bull-green/20 bg-bull-green/5 flex items-center gap-2 text-xs text-bull-green font-medium">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Profile settings updated successfully.</span>
          </div>
        )}

        {/* Name input */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">
            Full Name
          </label>
          <input
            type="text"
            className="w-full bg-surface-dim border border-outline/10 focus:border-primary/50 outline-none rounded px-3 py-2 text-xs text-white font-medium transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email input (read-only) */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">
            Email Address
          </label>
          <input
            type="email"
            className="w-full bg-surface-dim/40 border border-outline/5 rounded px-3 py-2 text-xs text-on-surface-variant/70 font-mono font-medium cursor-not-allowed select-all"
            value={user.email}
            disabled
            readOnly
          />
          <span className="text-[8px] text-on-surface-variant/40 block">
            Email address cannot be changed. Contact admin for assistance.
          </span>
        </div>

        {/* Phone input */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">
            Phone Number
          </label>
          <input
            type="tel"
            className="w-full bg-surface-dim border border-outline/10 focus:border-primary/50 outline-none rounded px-3 py-2 text-xs text-white font-medium transition-all"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 98765 43210"
          />
        </div>

        {/* Account Created (read-only) */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">
            Session Created
          </label>
          <div className="text-xs font-mono text-on-surface-variant/80">
            {new Date(user.createdAt).toLocaleString()}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white font-bold py-2 rounded flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-[0.99] transition-all text-xs uppercase tracking-wider mt-6"
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {isLoading ? "Saving changes..." : "Save Settings"}
        </button>
      </form>
    </TerminalPanel>
  );
}
