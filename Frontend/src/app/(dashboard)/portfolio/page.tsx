import type { Metadata } from "next";
import { PortfolioView } from "@/features/portfolio/components/PortfolioView";

export const metadata: Metadata = {
  title: "Portfolio Hub | CrikOptions",
  description:
    "Aggregated positions, equity curve, PnL analytics, and risk metrics for your CrikOptions portfolio.",
};

export default function PortfolioPage() {
  return <PortfolioView />;
}
