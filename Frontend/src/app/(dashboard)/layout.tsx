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
      <div className="flex flex-1 overflow-hidden mt-14 h-[calc(100vh-56px)]">
        <SessionNavBar />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
