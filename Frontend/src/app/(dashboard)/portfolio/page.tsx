import type { Metadata } from "next";
import { PortfolioView } from "@/features/portfolio/components/PortfolioView";

export const metadata: Metadata = {
  title: "Portfolio Hub | CricOptions",
  description:
    "Aggregated positions, equity curve, PnL analytics, and risk metrics for your CricOptions portfolio.",
};

export default function PortfolioPage() {
  return <PortfolioView />;
}
