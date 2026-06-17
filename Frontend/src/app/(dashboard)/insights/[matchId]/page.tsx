import { IntelligenceWorkspace } from "@/features/intelligence/components";

interface PageProps {
  params: Promise<{ matchId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { matchId } = await params;
  const label = matchId.replace(/-/g, " ").toUpperCase();
  return {
    title: `Intelligence HQ — ${label} | CricOptions`,
    description: `Match DNA Engine, AI Signals, Predictive Models, and Scenario Lab for ${label}`,
  };
}

export default async function InsightsPage({ params }: PageProps) {
  const { matchId } = await params;

  return <IntelligenceWorkspace matchId={matchId} />;
}
