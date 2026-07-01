import { apiClient } from "@/lib/api/client";

export type SimulatorStatus = {
  status: string;
  innings?: number;
  cursor?: number;
  totalEvents?: number;
  currentScore?: string;
  oversText?: string;
  targetScore?: number;
};

const MATCH_SCRIPT_BY_ID: Record<string, string> = {
  "0000000000000000000000aa": "csk_vs_mi",
  "0000000000000000000000bb": "rcb_vs_kkr",
};

export function resolveSimulatorScript(
  matchId: string,
  teamA?: string,
  teamB?: string
): string | null {
  const mapped = MATCH_SCRIPT_BY_ID[matchId];
  if (mapped) return mapped;

  const label = `${teamA ?? ""} ${teamB ?? ""}`.toUpperCase();
  if (label.includes("CSK") && label.includes("MI")) return "csk_vs_mi";
  if (label.includes("RCB") && label.includes("KKR")) return "rcb_vs_kkr";

  return null;
}

export async function fetchSimulatorStatus(
  hexMatchId: string
): Promise<SimulatorStatus | null> {
  try {
    const response = await apiClient.get<{ success: boolean; data: SimulatorStatus }>(
      `/v1/admin/matches/${hexMatchId}/simulator/status`
    );
    return response.data.data ?? null;
  } catch {
    return null;
  }
}

export async function startSimulator(hexMatchId: string, scriptName: string): Promise<void> {
  await apiClient.post(`/v1/admin/matches/${hexMatchId}/simulator/start`, { scriptName });
}

export async function resumeSimulator(hexMatchId: string): Promise<void> {
  await apiClient.post(`/v1/admin/matches/${hexMatchId}/simulator/resume`);
}

export async function resetSimulator(hexMatchId: string): Promise<void> {
  await apiClient.post(`/v1/admin/matches/${hexMatchId}/simulator/reset`);
}

function isFinished(status: SimulatorStatus): boolean {
  const normalized = status.status.toLowerCase();
  if (normalized === "completed" || normalized === "finished" || normalized === "done") {
    return true;
  }
  if (
    typeof status.cursor === "number" &&
    typeof status.totalEvents === "number" &&
    status.totalEvents > 0 &&
    status.cursor >= status.totalEvents
  ) {
    return true;
  }
  return false;
}

/** Start, resume, or loop the CSV replay worker for a live match. */
export async function ensureMatchSimulatorRunning(
  hexMatchId: string,
  scriptName: string
): Promise<void> {
  const status = await fetchSimulatorStatus(hexMatchId);

  if (!status) {
    await startSimulator(hexMatchId, scriptName);
    return;
  }

  const normalized = status.status.toLowerCase();

  if (normalized === "running") {
    return;
  }

  if (normalized === "paused") {
    await resumeSimulator(hexMatchId);
    return;
  }

  if (isFinished(status)) {
    await resetSimulator(hexMatchId);
    await startSimulator(hexMatchId, scriptName);
    return;
  }

  await startSimulator(hexMatchId, scriptName);
}
