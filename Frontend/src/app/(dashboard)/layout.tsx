import TopNavBar from "@/components/TopNavBar";
import { MobileSessionNavBar, SessionNavBar } from "@/components/ui/sidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LiveSimulatorBootstrap } from "@/features/simulator/components/LiveSimulatorBootstrap";
import { UserStreamBootstrap } from "@/features/trading/components/UserStreamBootstrap";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <LiveSimulatorBootstrap />
      <UserStreamBootstrap />
      <TopNavBar />
      <div className="flex min-h-[100dvh] w-full pt-14 lg:h-[100dvh] lg:overflow-hidden lg:pt-16">
        <SessionNavBar />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-background pb-[calc(4.75rem+env(safe-area-inset-bottom))] lg:h-[calc(100dvh-4rem)] lg:pb-0">
          {children}
        </main>
        <MobileSessionNavBar />
      </div>
    </AuthGuard>
  );
}
