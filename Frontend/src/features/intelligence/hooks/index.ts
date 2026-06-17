import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  fetchAISignals,
  fetchDNAMatches,
  fetchEventImpacts,
  fetchMatchIntelligence,
  fetchMomentum,
  fetchOutcomeDistribution,
  fetchPatterns,
  fetchScenarioProjection,
  getScenarios,
} from "../services/intelligence.service";

export function useIntelligence(matchId: string) {
  return useQuery({
    queryKey: ["intelligence", matchId],
    queryFn: () => fetchMatchIntelligence(matchId),
    enabled: !!matchId,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useDNAEngine(matchId: string) {
  const { data, ...rest } = useQuery({
    queryKey: ["dna", matchId],
    queryFn: () => fetchDNAMatches(matchId),
    enabled: !!matchId,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const heatmapMatrix = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((match) => [match.similarity / 100]);
  }, [data]);

  return { data: data ?? [], heatmapMatrix, ...rest };
}

export function useAISignals(matchId: string) {
  return useQuery({
    queryKey: ["ai-signals", matchId],
    queryFn: () => fetchAISignals(matchId, 0),
    enabled: !!matchId,
    staleTime: 15_000,
    refetchInterval: 15_000,
  });
}

export function useMomentum(matchId: string) {
  return useQuery({
    queryKey: ["momentum", matchId],
    queryFn: () => fetchMomentum(matchId),
    enabled: !!matchId,
    staleTime: 10_000,
    refetchInterval: 10_000,
  });
}

export function usePatterns(matchId: string) {
  return useQuery({
    queryKey: ["patterns", matchId],
    queryFn: () => fetchPatterns(matchId),
    enabled: !!matchId,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useEventImpacts(matchId: string) {
  return useQuery({
    queryKey: ["event-impacts", matchId],
    queryFn: () => fetchEventImpacts(matchId),
    enabled: !!matchId,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useOutcomeDistribution(matchId: string) {
  return useQuery({
    queryKey: ["outcomes", matchId],
    queryFn: () => fetchOutcomeDistribution(matchId),
    enabled: !!matchId,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useScenarioLab(matchId: string) {
  const scenarios = getScenarios();
  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0]?.id ?? "");

  const projection = useQuery({
    queryKey: ["scenario", matchId, activeScenarioId],
    queryFn: () => fetchScenarioProjection(matchId, activeScenarioId),
    enabled: !!matchId && !!activeScenarioId,
    staleTime: Infinity,
  });

  return {
    scenarios,
    activeScenarioId,
    setActiveScenarioId,
    projection: projection.data ?? null,
    isLoading: projection.isLoading,
  };
}
