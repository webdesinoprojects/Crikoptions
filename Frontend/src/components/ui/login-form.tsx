"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";

export default function Example() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const router = useRouter();
    const { login, isLoading } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        try {
            await login({ email, password });
            router.push("/");
        } catch (err: any) {
            setFormError(err.message || "Invalid credentials. Please try again.");
        }
    };

    return (
        <div className="flex h-screen w-full bg-background text-foreground">
            {/* Left side visual panel with sport/trading Unsplash background */}
            <div className="w-full hidden md:inline-block relative">
                <img 
                    className="h-full w-full object-cover brightness-[0.4] contrast-[1.1]" 
                    src="https://images.unsplash.com/photo-1540747737956-3787293f9de0?auto=format&fit=crop&q=80&w=1200" 
                    alt="leftSideImage" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background" />
                <div className="absolute bottom-12 left-12 max-w-md select-none">
                    <h1 className="text-3xl font-extrabold text-white uppercase tracking-wider font-display">
                        CrikOptions Terminal
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        Institutional-grade cricket options trading. Access real-time order books, live match insights, and manage portfolio risk.
                    </p>
                </div>
            </div>
        
            {/* Right side login form */}
            <div className="w-full flex flex-col items-center justify-center p-6">
        
                <form onSubmit={handleSubmit} className="md:w-96 w-80 flex flex-col items-center justify-center">
                    <h2 className="text-4xl text-foreground font-semibold font-display uppercase tracking-tight">Sign in</h2>
                    <p className="text-sm text-muted-foreground mt-3">Welcome back! Please sign in to continue</p>
        
                    {formError && (
                        <div className="w-full mt-4 p-3 rounded-lg border border-destructive/20 bg-destructive/10 flex items-center gap-2 text-xs text-destructive font-medium animate-fadeIn">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <button type="button" className="w-full mt-8 bg-muted hover:bg-muted/80 flex items-center justify-center h-12 rounded-full border border-border/50 transition-colors">
                        <img className="w-5 h-5" src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleLogo.svg" alt="googleLogo" />
                    </button>
        
                    <div className="flex items-center gap-4 w-full my-5">
                        <div className="w-full h-px bg-border"></div>
                        <p className="w-full text-nowrap text-xs text-muted-foreground text-center">or sign in with email</p>
                        <div className="w-full h-px bg-border"></div>
                    </div>
        
                    <div className="flex items-center w-full bg-background border border-input focus-within:border-primary/50 transition-all h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-muted-foreground">
                            <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="currentColor"/>
                        </svg>
                        <input 
                            type="email" 
                            placeholder="Email id" 
                            className="bg-transparent text-foreground placeholder-muted-foreground/60 outline-none text-sm w-full h-full" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />                 
                    </div>
        
                    <div className="flex items-center mt-6 w-full bg-background border border-input focus-within:border-primary/50 transition-all h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-muted-foreground">
                            <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="currentColor"/>
                        </svg>
                        <input 
                            type="password" 
                            placeholder="Password" 
                            className="bg-transparent text-foreground placeholder-muted-foreground/60 outline-none text-sm w-full h-full" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
        
                    <div className="w-full flex items-center justify-between mt-8 text-muted-foreground">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <input className="h-4 w-4 rounded border-input text-primary focus:ring-primary/30 bg-transparent" type="checkbox" id="checkbox" />
                            <label className="text-sm cursor-pointer select-none" htmlFor="checkbox">Remember me</label>
                        </div>
                        <a className="text-sm underline hover:text-foreground transition-colors" href="#">Forgot password?</a>
                    </div>
        
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="mt-8 w-full h-11 rounded-full text-white bg-primary hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all font-semibold flex items-center justify-center gap-2"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoading ? "Signing In..." : "Login"}
                    </button>
                    <p className="text-muted-foreground text-sm mt-4 select-none">
                        Don’t have an account? <Link className="text-primary hover:underline font-bold" href="/register">Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
