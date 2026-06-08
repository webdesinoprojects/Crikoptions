import { Match as FrontendMatch, Team as FrontendTeam } from "@/types";

export interface BackendMatch {
  _id: string;
  tournamentId: string;
  format: string;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  teamALogo: string;
  teamBLogo: string;
  startTime: string;
  status: string;
  innings: number;
  currentScore: number;
  wicketsLost: number;
  ballsLeft: number;
  oversText: string;
  createdAt: string;
  updatedAt: string;
}

export function adaptMatch(backend: BackendMatch): FrontendMatch {
  const homeTeam: FrontendTeam = {
    id: backend.teamAId || "team-a",
    name: backend.teamAName,
    shortName: backend.teamAName,
    logoUrl: backend.teamALogo,
  };

  const awayTeam: FrontendTeam = {
    id: backend.teamBId || "team-b",
    name: backend.teamBName,
    shortName: backend.teamBName,
    logoUrl: backend.teamBLogo,
  };

  let status: FrontendMatch["status"] = "UPCOMING";
  const statusLower = backend.status.toLowerCase();
  if (statusLower === "live") {
    status = "LIVE";
  } else if (statusLower === "completed") {
    status = "COMPLETED";
  }

  let homeScore = "";
  if (status === "LIVE" || status === "COMPLETED") {
    homeScore = `${backend.currentScore}/${backend.wicketsLost}`;
  }

  return {
    id: backend._id,
    title: `${backend.teamAName} vs ${backend.teamBName}`,
    status,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore: "",
    currentOver: backend.oversText || "0.0",
    format: backend.format,
    startTime: backend.startTime,
  };
}

export function adaptMatches(backendMatches: BackendMatch[]): FrontendMatch[] {
  if (!backendMatches) return [];
  return backendMatches.map(adaptMatch);
}
