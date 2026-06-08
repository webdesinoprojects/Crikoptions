import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  generateMatchIntelligence,
  generateDNAMatches,
  generateAISignals,
  generatePatterns,
  generateMomentum,
  generateEventImpacts,
  generateOutcomeDistribution,
  generateScenarioProjection,
  getScenarios,
} from "../services/intelligence.service";

// ── Master hook — full match intelligence context ─────────────────────────────
export function useIntelligence(matchId: string) {
  return useQuery({
    queryKey: ["intelligence", matchId],
    queryFn: () => generateMatchIntelligence(matchId),
    enabled: !!matchId,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

// ── DNA Engine — similar matches + heatmap data ───────────────────────────────
export function useDNAEngine(matchId: string) {
  const { data, ...rest } = useQuery({
    queryKey: ["dna", matchId],
    queryFn: () => generateDNAMatches(matchId),
    enabled: !!matchId,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  /** Build a 12×8 heatmap matrix from similarity data */
  const heatmapMatrix = useMemo(() => {
    if (!data) return [];
    const matrix: number[][] = [];
    for (let row = 0; row < 8; row++) {
      const cells: number[] = [];
      for (let col = 0; col < 12; col++) {
        const matchIdx = (row + col) % data.length;
        const base = data[matchIdx].similarity / 100;
        const noise = (Math.sin(row * 7 + col * 13 + matchIdx) + 1) / 2;
        cells.push(Math.round(base * noise * 100) / 100);
      }
      matrix.push(cells);
    }
    return matrix;
  }, [data]);

  return { data: data ?? [], heatmapMatrix, ...rest };
}

// ── AI Signals ────────────────────────────────────────────────────────────────
export function useAISignals(matchId: string) {
  return useQuery({
    queryKey: ["ai-signals", matchId],
    queryFn: () => generateAISignals(matchId, 6),
    enabled: !!matchId,
    staleTime: 15_000,
    refetchInterval: 15_000,
  });
}

// ── Momentum ──────────────────────────────────────────────────────────────────
export function useMomentum(matchId: string) {
  return useQuery({
    queryKey: ["momentum", matchId],
    queryFn: () => generateMomentum(matchId),
    enabled: !!matchId,
    staleTime: 10_000,
    refetchInterval: 10_000,
  });
}

// ── Patterns ──────────────────────────────────────────────────────────────────
export function usePatterns(matchId: string) {
  return useQuery({
    queryKey: ["patterns", matchId],
    queryFn: () => generatePatterns(matchId),
    enabled: !!matchId,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

// ── Event Impacts ─────────────────────────────────────────────────────────────
export function useEventImpacts(matchId: string) {
  return useQuery({
    queryKey: ["event-impacts", matchId],
    queryFn: () => generateEventImpacts(matchId),
    enabled: !!matchId,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

// ── Outcome Distribution ──────────────────────────────────────────────────────
export function useOutcomeDistribution(matchId: string) {
  return useQuery({
    queryKey: ["outcomes", matchId],
    queryFn: () => generateOutcomeDistribution(matchId),
    enabled: !!matchId,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

// ── Scenario Lab ──────────────────────────────────────────────────────────────
export function useScenarioLab(matchId: string) {
  const scenarios = getScenarios();
  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0]?.id ?? "s1");

  const projection = useQuery({
    queryKey: ["scenario", matchId, activeScenarioId],
    queryFn: () => generateScenarioProjection(matchId, activeScenarioId),
    enabled: !!matchId && !!activeScenarioId,
    staleTime: Infinity, // manual refresh only via scenario change
  });

  return {
    scenarios,
    activeScenarioId,
    setActiveScenarioId,
    projection: projection.data,
    isLoading: projection.isLoading,
  };
}
