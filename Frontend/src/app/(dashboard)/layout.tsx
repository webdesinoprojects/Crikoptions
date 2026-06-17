import TopNavBar from "@/components/TopNavBar";
import { SessionNavBar } from "@/components/ui/sidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <TopNavBar />
      <div className="flex overflow-hidden mt-14 h-[calc(100vh-56px)] w-full">
        <SessionNavBar />
        <main className="flex-1 min-h-0 min-w-0 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
