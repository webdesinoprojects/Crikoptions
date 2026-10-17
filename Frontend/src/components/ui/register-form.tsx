"use client";

import { useState } from "react";
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2, X, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { getErrorMessage } from "@/lib/error-message";
import { GoogleAuthButton } from "@/features/auth/components/GoogleAuthButton";
import { AuthVisualPanel } from "@/components/ui/auth-visual-panel";

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
}

function validateForm(name: string, email: string, phone: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!name.trim() || name.trim().length < 2) errors.name = "Name must be at least 2 characters.";
  if (name.trim().length > 80) errors.name = "Name must be under 80 characters.";
  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Please enter a valid email address.";
  const phoneDigits = phone.replace(/[\s\-\+\(\)]/g, "").replace(/\D/g, "");
  if (!phone.trim()) errors.phone = "Phone number is required.";
  else if (phoneDigits.length < 10) errors.phone = "Phone must be at least 10 digits.";
  if (!password) errors.password = "Password is required.";
  else if (password.length < 8) errors.password = "Password must be at least 8 characters.";
  else if (password.length > 128) errors.password = "Password must not exceed 128 characters.";
  return errors;
}

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const { register, loginWithGoogle, isLoading } = useAuthStore();

  const handleGoogleCredential = async (credential: string) => {
    setFormError(null);
    try {
      await loginWithGoogle(credential);
      router.push("/dashboard");
    } catch (error: unknown) {
      setFormError(getErrorMessage(error, "Google sign-in failed. Please try again."));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldErrors(validateForm(name, email, phone, password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setTouched({ name: true, email: true, phone: true, password: true });
    const errs = validateForm(name, email, phone, password);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await register({ name: name.trim(), email: email.trim(), phone: phone.trim(), password });
      router.push("/dashboard");
    } catch (error: unknown) {
      setFormError(getErrorMessage(error, "Failed to create account. Please try again."));
    }
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", "bg-red-500", "bg-yellow-500", "bg-emerald-500"][passwordStrength];

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#030814] font-sans text-white">
      <AuthVisualPanel />

      {/* Right-side form panel - Internally scrollable if needed */}
      <div className="relative flex h-full min-w-0 flex-1 flex-col bg-gradient-to-b from-[#030814] via-[#0b152d] to-[#030814] border-l border-white/5">
        
        {/* Ambient decorative glows */}
        <div className="absolute top-[15%] right-[10%] w-72 h-72 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[15%] left-[10%] w-72 h-72 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

        {/* Fixed Header */}
        <div className="absolute top-0 left-0 w-full flex justify-between items-center p-6 z-20 bg-gradient-to-b from-[#030814] to-transparent">
          <div className="flex items-center gap-2 select-none">
            <img src="/cricoptions.png" alt="CricOptions" className="h-8 sm:h-9 w-auto object-contain" />
          </div>
          <Link href="/" className="text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all p-2">
            <X className="w-5 h-5" />
          </Link>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start px-4 py-20 sm:px-12 z-10">

          <div className="mx-auto my-6 flex w-full max-w-md flex-grow flex-col items-center justify-center sm:my-8 z-10">
            <div className="w-full bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-white/15">
              <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col items-center">
                <h3 className="mb-1 text-center font-sans text-xl font-bold uppercase tracking-wider text-white sm:text-2xl mt-2">Sign Up</h3>
                <p className="text-xs text-white/50 text-center mb-5 font-medium">
                  Create your institutional sports trading account · Get ₵5,000 free
                </p>
            
                <div className="w-full shrink-0 text-center text-xs text-white/50 select-none mb-6">
                  Already have an account?{" "}
                  <Link className="text-amber-400 hover:underline font-bold ml-1 hover:text-amber-300 transition-colors" href="/login">Sign In</Link>
                </div>

                {/* API error */}
                {formError && (
                  <div className="w-full mb-5 p-3 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-2 text-xs text-red-400 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex flex-col gap-4 w-full">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <div className={`flex items-center w-full bg-[#0c162d]/90 border transition-all h-12 rounded-xl pl-5 pr-3 gap-2.5 ${touched.name && fieldErrors.name ? "border-red-500/60 bg-red-500/5" : "border-white/10 hover:border-white/15 hover:bg-[#101c3b]/90 focus-within:border-amber-500/50 focus-within:bg-[#101c3b]/90"}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" className="shrink-0">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        type="text" placeholder="Full Name"
                        className="bg-transparent text-white placeholder-white/30 outline-none text-xs w-full h-full font-medium"
                        value={name}
                        onChange={(e) => { setName(e.target.value); if (touched.name) setFieldErrors(validateForm(e.target.value, email, phone, password)); }}
                        onBlur={() => handleBlur("name")}
                      />
                    </div>
                    {touched.name && fieldErrors.name && (
                      <p className="text-[11px] text-red-400 pl-1 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" />{fieldErrors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <div className={`flex items-center w-full bg-[#0c162d]/90 border transition-all h-12 rounded-xl pl-5 pr-3 gap-2.5 ${touched.email && fieldErrors.email ? "border-red-500/60 bg-red-500/5" : "border-white/10 hover:border-white/15 hover:bg-[#101c3b]/90 focus-within:border-amber-500/50 focus-within:bg-[#101c3b]/90"}`}>
                      <svg width="14" height="10" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                        <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#94a3b8"/>
                      </svg>
                      <input
                        type="email" placeholder="Email address"
                        className="bg-transparent text-white placeholder-white/30 outline-none text-xs w-full h-full font-medium"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (touched.email) setFieldErrors(validateForm(name, e.target.value, phone, password)); }}
                        onBlur={() => handleBlur("email")}
                      />
                    </div>
                    {touched.email && fieldErrors.email && (
                      <p className="text-[11px] text-red-400 pl-1 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" />{fieldErrors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <div className={`flex items-center w-full bg-[#0c162d]/90 border transition-all h-12 rounded-xl pl-5 pr-3 gap-2.5 ${touched.phone && fieldErrors.phone ? "border-red-500/60 bg-red-500/5" : "border-white/10 hover:border-white/15 hover:bg-[#101c3b]/90 focus-within:border-amber-500/50 focus-within:bg-[#101c3b]/90"}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" className="shrink-0">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <input
                        type="tel"
                        placeholder="Phone number"
                        required
                        className="bg-transparent text-white placeholder-white/30 outline-none text-xs w-full h-full font-medium"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); if (touched.phone) setFieldErrors(validateForm(name, email, e.target.value, password)); }}
                        onBlur={() => handleBlur("phone")}
                      />
                    </div>
                    {touched.phone && fieldErrors.phone && (
                      <p className="text-[11px] text-red-400 pl-1 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" />{fieldErrors.phone}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <div className={`flex items-center w-full bg-[#0c162d]/90 border transition-all h-12 rounded-xl pl-5 pr-3 gap-2.5 ${touched.password && fieldErrors.password ? "border-red-500/60 bg-red-500/5" : "border-white/10 hover:border-white/15 hover:bg-[#101c3b]/90 focus-within:border-amber-500/50 focus-within:bg-[#101c3b]/90"}`}>
                      <svg width="12" height="15" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                        <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#94a3b8"/>
                      </svg>
                      <input
                        type={showPassword ? "text" : "password"} placeholder="Password (min. 8 characters)"
                        className="bg-transparent text-white placeholder-white/30 outline-none text-xs w-full h-full font-medium"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); if (touched.password) setFieldErrors(validateForm(name, email, phone, e.target.value)); }}
                        onBlur={() => handleBlur("password")}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-white/30 hover:text-white/60 transition shrink-0 cursor-pointer">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Strength meter */}
                    {password.length > 0 && (
                      <div className="flex items-center gap-2 pl-1 mt-0.5">
                        <div className="flex gap-1 flex-1">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength >= i ? strengthColor : "bg-white/10"}`} />
                          ))}
                        </div>
                        <span className={`text-[10px] font-semibold ${["", "text-red-400", "text-yellow-400", "text-emerald-400"][passwordStrength]}`}>{strengthLabel}</span>
                      </div>
                    )}
                    {touched.password && fieldErrors.password && (
                      <p className="text-[11px] text-red-400 pl-1 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" />{fieldErrors.password}</p>
                    )}
                    {touched.password && !fieldErrors.password && password.length > 0 && (
                      <p className="text-[11px] text-emerald-400 pl-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 shrink-0" />Password looks good</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit" disabled={isLoading}
                  className="mt-8 w-full h-12 rounded-xl text-slate-950 bg-gradient-to-r from-amber-400 to-[#d4af37] hover:from-amber-300 hover:to-[#ebd171] active:scale-[0.99] hover:shadow-[0_4px_30px_rgba(212,175,55,0.3)] hover:scale-[1.01] transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? "Creating Account..." : "Create Account — Get ₵5,000 Free"}
                </button>

                {/* Divider */}
                <div className="my-5 flex w-full items-center gap-3">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">or</span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                {/* Google sign-up */}
                <div className="flex w-full justify-center">
                  <GoogleAuthButton onCredential={handleGoogleCredential} text="signup_with" disabled={isLoading} />
                </div>

                <p className="mt-4 text-[11px] text-white/30 text-center">Paper money only — no real funds involved.</p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


