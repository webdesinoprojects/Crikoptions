"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/hooks/useAuth";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, token, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  useEffect(() => {
    if (mounted && !isLoading && !token && !isAuthenticated) {
      // If we are on a dashboard route and definitely not logged in, redirect to login
      if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/insights") || pathname?.startsWith("/portfolio") || pathname?.startsWith("/trading") || pathname?.startsWith("/profile") || pathname?.startsWith("/market-scanner")) {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, token, isLoading, mounted, pathname, router]);

  if (!mounted || isLoading || (token && !isAuthenticated)) {
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-[#d4af37] animate-spin" />
          <p className="text-sm font-mono text-muted-foreground animate-pulse">VERIFYING CREDENTIALS...</p>
        </div>
      </div>
    );
  }

  // If not logged in and on a protected route, we return null to prevent flash of content before redirect
  if (!isAuthenticated && !token && (pathname?.startsWith("/dashboard") || pathname?.startsWith("/insights") || pathname?.startsWith("/portfolio") || pathname?.startsWith("/trading") || pathname?.startsWith("/profile") || pathname?.startsWith("/market-scanner"))) {
    return null; 
  }

  return <>{children}</>;
};
