"use client";

import { useState } from "react";
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2, X } from "lucide-react";

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
      router.push("/dashboard");
    } catch (err: any) {
      setFormError(err.message || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="h-screen w-full bg-black relative flex overflow-hidden text-white font-sans">
      {/* Background Image spanning the entire page, centric to the 60% section on desktop */}
      <div className="absolute inset-y-0 left-0 w-full md:w-[60%] h-full overflow-hidden md:overflow-visible pointer-events-none z-0">
        <img
          className="h-full w-full md:w-[100vw] md:max-w-none object-cover object-center absolute left-0 md:left-1/2 md:-translate-x-1/2 select-none"
          src="/Welcome to.png"
          alt="Welcome to Crikoptions"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      </div>

      {/* Left-side visual preview panel spacer (60% width) */}
      <div className="hidden md:flex md:w-[60%] shrink-0 h-full relative z-10 justify-center">
        {/* Top Centered Header text */}
        <h2 className="absolute top-16 left-1/2 -translate-x-1/2 text-white font-display text-4xl font-black text-center w-full px-6 select-none uppercase tracking-tighter leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          Look first /<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-white">Then leap.</span>
        </h2>
      </div>

      {/* Right-side register card panel (40% width, semi-transparent background) */}
      <div className="w-full md:w-[40%] shrink-0 h-full flex flex-col justify-between py-8 px-6 md:px-12 bg-[#000d1a]/85 backdrop-blur-md relative z-10 overflow-y-auto border-l border-white/10 shadow-2xl">
        {/* Top Header Row with Logo and Close Icon */}
        <div className="flex justify-between items-center w-full shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2 select-none">
            <span className="text-lg font-black font-display uppercase tracking-widest text-[#d4af37]">Crikoptions</span>
          </div>
          {/* Close button */}
          <Link href="/" className="text-white/50 hover:text-white transition-colors p-2">
            <X className="w-6 h-6" />
          </Link>
        </div>

        {/* Center Form Container */}
        <div className="flex-grow flex flex-col justify-center items-center w-full max-w-sm mx-auto my-8">
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            <h3 className="text-2xl font-bold font-sans text-center mb-1 uppercase tracking-wider text-white">Sign Up</h3>
            <p className="text-xs text-white/50 text-center mb-8 font-medium">
              Create your institutional sports trading account
            </p>

            {formError && (
              <div className="w-full mb-6 p-3 rounded-xl border border-error/20 bg-error/5 flex items-center gap-2 text-xs text-error font-medium animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Google Authentication Button (Aesthetic representation matching screenshot) */}
            <button 
              type="button" 
              className="w-full bg-white text-black font-sans font-bold text-xs h-11 rounded-xl flex items-center justify-center gap-3 hover:bg-neutral-100 transition-colors mb-6 shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.85 5.85 0 0 1 8 12.8a5.85 5.85 0 0 1 5.99-5.8c1.55 0 2.964.585 4.053 1.543l3.076-3.076C19.296 3.703 16.822 2.6 13.99 2.6a10.2 10.2 0 0 0-10.2 10.2 10.2 0 0 0 10.2 10.2c5.623 0 10.37-3.9 10.37-10.2 0-.6-.058-1.2-.172-1.714H12.24z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 w-full mb-6">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {/* Input Fields Stack */}
            <div className="flex flex-col gap-4 w-full">
              {/* Name input field */}
              <div className="flex items-center w-full bg-[#0a1428] border border-white/10 hover:border-[#d4af37]/30 focus-within:border-[#d4af37]/50 transition-all h-12 rounded-xl pl-5 pr-3 gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" className="shrink-0">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="bg-transparent text-white placeholder-white/30 outline-none text-xs w-full h-full font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Email input field */}
              <div className="flex items-center w-full bg-[#0a1428] border border-white/10 hover:border-[#d4af37]/30 focus-within:border-[#d4af37]/50 transition-all h-12 rounded-xl pl-5 pr-3 gap-2">
                <svg width="14" height="10" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#94a3b8"/>
                </svg>
                <input
                  type="email"
                  placeholder="Email address"
                  className="bg-transparent text-white placeholder-white/30 outline-none text-xs w-full h-full font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Phone input field (optional) */}
              <div className="flex items-center w-full bg-[#0a1428] border border-white/10 hover:border-[#d4af37]/30 focus-within:border-[#d4af37]/50 transition-all h-12 rounded-xl pl-5 pr-3 gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" className="shrink-0">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <input
                  type="tel"
                  placeholder="Phone number (optional)"
                  className="bg-transparent text-white placeholder-white/30 outline-none text-xs w-full h-full font-medium"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Password input field */}
              <div className="flex items-center w-full bg-[#0a1428] border border-white/10 hover:border-[#d4af37]/30 focus-within:border-[#d4af37]/50 transition-all h-12 rounded-xl pl-5 pr-3 gap-2">
                <svg width="12" height="15" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#94a3b8"/>
                </svg>
                <input
                  type="password"
                  placeholder="Password"
                  className="bg-transparent text-white placeholder-white/30 outline-none text-xs w-full h-full font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-8 w-full h-12 rounded-xl text-[#000d1a] bg-[#d4af37] hover:bg-[#ebd171] active:scale-[0.99] transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Creating Account..." : "Register"}
            </button>
          </form>
        </div>

        {/* Footer text pinned at the bottom */}
        <div className="w-full shrink-0 text-center text-xs text-white/50 select-none">
          Already have an account?{" "}
          <Link className="text-[#d4af37] hover:underline font-bold ml-1" href="/login">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
