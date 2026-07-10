"use client";

import { usePathname } from "next/navigation";
import { LiveSimulatorBootstrap } from "@/features/simulator/components/LiveSimulatorBootstrap";
import { UserStreamBootstrap } from "@/features/trading/components/UserStreamBootstrap";

export function DashboardRouteBootstraps() {
  const pathname = usePathname();
  const isSimulatorRoute = pathname === "/simulator" || pathname.startsWith("/simulator/");

  if (isSimulatorRoute) return null;

  return (
    <>
      <LiveSimulatorBootstrap />
      <UserStreamBootstrap />
    </>
  );
}
