"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import { ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const isAuthorized = !isLoading && isAuthenticated && user?.role === "admin";

  useEffect(() => {
    // Wait until auth initialization finishes
    if (!isLoading) {
      if (!isAuthenticated) {
        // If not logged in, send them to login page and redirect back later
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (user?.role !== "admin") {
        // Logged in but NOT an admin
        router.push("/dashboard");
      }
    }
  }, [user, isAuthenticated, isLoading, router, pathname]);

  // Show a loading or unauthorized state while verifying
  if (isLoading || !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <ShieldAlert className="w-16 h-16 text-sky-500/50 mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-gray-300">Verifying Admin Credentials...</h2>
        <p className="text-gray-500 mt-2">Ensuring secure access to the operations console.</p>
      </div>
    );
  }

  // User is fully authorized
  return <>{children}</>;
}
