"use client";

import { useState } from "react";
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2, X } from "lucide-react";
import { getErrorMessage } from "@/lib/error-message";
import { GoogleAuthButton } from "@/features/auth/components/GoogleAuthButton";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const { login, loginWithGoogle, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (error: unknown) {
      setFormError(getErrorMessage(error, "Invalid credentials. Please try again."));
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    setFormError(null);
    try {
      await loginWithGoogle(credential);
      router.push("/dashboard");
    } catch (error: unknown) {
      setFormError(getErrorMessage(error, "Google sign-in failed. Please try again."));
    }
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#01040a] font-sans text-white">
      {/* Left-side visual panel - Fixed and non-scrollable */}
      <div className="hidden md:flex relative w-1/2 h-full bg-[#01040a] items-center justify-center p-6">
        <img
          className="w-full h-full object-contain object-center select-none"
          src="/image.png"
          alt="Welcome to CricOptions"
        />
        {/* Subtle Gradient Overlays for seamless blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#01040a] via-transparent to-[#01040a] pointer-events-none opacity-30" />
      </div>

      {/* Right-side form panel - Internally scrollable if needed */}
      <div className="relative flex flex-col w-full md:w-1/2 h-full bg-[#000d1a]/95 border-l border-white/5">
        
        {/* Fixed Header */}
        <div className="absolute top-0 left-0 w-full flex justify-between items-center p-6 z-20 bg-gradient-to-b from-[#000d1a] to-transparent">
          <div className="flex items-center gap-2 select-none">
            <img src="/cricoptions.png" alt="CricOptions" className="h-8 sm:h-9 w-auto object-contain" />
          </div>
          <Link href="/" className="text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all p-2">
            <X className="w-5 h-5" />
          </Link>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 py-20 sm:px-12 z-10">

        {/* Center Form Container */}
        <div className="mx-auto my-6 flex w-full max-w-sm flex-grow flex-col items-center justify-center sm:my-8">
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            <h3 className="mb-1 text-center font-sans text-xl font-bold uppercase tracking-wider text-white sm:text-2xl mt-4">Sign In</h3>
            <p className="text-xs text-white/50 text-center mb-8 font-medium">
              Welcome back! Please sign in to continue
            </p>

            {formError && (
              <div className="w-full mb-6 p-3 rounded-xl border border-destructive/20 bg-destructive/10 flex items-center gap-2 text-xs text-destructive font-medium animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Google Authentication Button */}
            <div className="mb-6 flex w-full justify-center">
              <GoogleAuthButton onCredential={handleGoogleCredential} text="signin_with" disabled={isLoading} />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 w-full mb-6">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {/* Input Fields Stack */}
            <div className="flex flex-col gap-4 w-full">
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

            {/* Remember me & Forgot Password */}
            <div className="w-full flex items-center justify-between mt-6 text-white/50 text-xs">
              <div className="flex items-center gap-2 cursor-pointer">
                <input className="h-4 w-4 rounded border-white/10 text-[#d4af37] focus:ring-[#d4af37]/30 bg-transparent" type="checkbox" id="checkbox" />
                <label className="cursor-pointer select-none" htmlFor="checkbox">Remember me</label>
              </div>
              <a className="underline hover:text-white transition-colors" href="#">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-8 w-full h-12 rounded-xl text-[#000d1a] bg-[#d4af37] hover:bg-[#ebd171] active:scale-[0.99] transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? "Signing In..." : "Login"}
            </button>
          </form>

          <div className="w-full shrink-0 text-center text-xs text-white/50 select-none mt-8 pb-4">
            Don’t have an account?{" "}
            <Link className="text-[#d4af37] hover:underline font-bold ml-1" href="/register">
              Sign up
            </Link>
          </div>
        </div>

        </div>
      </div>
    </div>
  );
}
