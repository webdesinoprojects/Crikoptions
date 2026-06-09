"use client";

import { useState } from "react";
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await register({ name, email, phone: phone || undefined, password });
      router.push("/");
    } catch (err: any) {
      setFormError(err.message || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Left-side visual preview panel */}
      <div className="w-full hidden md:inline-block relative">
        <img
          className="h-full w-full object-cover brightness-[0.4] contrast-[1.1]"
          src="https://images.unsplash.com/photo-1540747737956-3787293f9de0?auto=format&fit=crop&q=80&w=1200"
          alt="Stadium lights"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background" />
        <div className="absolute bottom-12 left-12 max-w-md select-none">
          <h1 className="text-3xl font-extrabold text-white uppercase tracking-wider font-display">
            PitchSide Pro
          </h1>
          <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
            Create an account to start tracking historical sports datasets, simulating match scenarios, and managing player indices.
          </p>
        </div>
      </div>

      {/* Right-side register card panel */}
      <div className="w-full flex flex-col items-center justify-center p-6 bg-surface-container-lowest animate-fadeIn">
        <form onSubmit={handleSubmit} className="md:w-96 w-80 flex flex-col items-center justify-center">
          <h2 className="text-3xl text-white font-bold tracking-tight font-display uppercase">Sign Up</h2>
          <p className="text-xs text-on-surface-variant mt-2 font-medium">
            Create your institutional sports trading account
          </p>

          {formError && (
            <div className="w-full mt-4 p-3 rounded border border-error/20 bg-error/5 flex items-center gap-2 text-xs text-error font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Name input field */}
          <div className="flex items-center mt-6 w-full bg-surface-dim border border-outline/10 hover:border-primary/30 focus-within:border-primary/50 transition-all h-11 rounded-full overflow-hidden pl-5 pr-3 gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" className="shrink-0">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              type="text"
              placeholder="Full Name"
              className="bg-transparent text-white placeholder-on-surface-variant/50 outline-none text-xs w-full h-full font-medium"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email input field */}
          <div className="flex items-center mt-4 w-full bg-surface-dim border border-outline/10 hover:border-primary/30 focus-within:border-primary/50 transition-all h-11 rounded-full overflow-hidden pl-5 pr-3 gap-2">
            <svg width="14" height="10" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#94a3b8"/>
            </svg>
            <input
              type="email"
              placeholder="Email address"
              className="bg-transparent text-white placeholder-on-surface-variant/50 outline-none text-xs w-full h-full font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Phone input field (optional) */}
          <div className="flex items-center mt-4 w-full bg-surface-dim border border-outline/10 hover:border-primary/30 focus-within:border-primary/50 transition-all h-11 rounded-full overflow-hidden pl-5 pr-3 gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" className="shrink-0">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <input
              type="tel"
              placeholder="Phone number (optional)"
              className="bg-transparent text-white placeholder-on-surface-variant/50 outline-none text-xs w-full h-full font-medium"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Password input field */}
          <div className="flex items-center mt-4 w-full bg-surface-dim border border-outline/10 hover:border-primary/30 focus-within:border-primary/50 transition-all h-11 rounded-full overflow-hidden pl-5 pr-3 gap-2">
            <svg width="12" height="15" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#94a3b8"/>
            </svg>
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent text-white placeholder-on-surface-variant/50 outline-none text-xs w-full h-full font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-8 w-full h-10 rounded-full text-white bg-primary hover:brightness-110 active:scale-[0.99] transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Creating Account..." : "Register"}
          </button>
          <p className="text-on-surface-variant text-[11px] font-medium mt-4 select-none">
            Already have an account?{" "}
            <Link className="text-primary hover:underline font-bold" href="/login">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
