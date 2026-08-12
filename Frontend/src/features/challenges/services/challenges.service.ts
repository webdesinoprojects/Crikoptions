import { apiClient } from "@/lib/api/client";

interface ApiResponse<T> {
  data: T;
}

/** Server-derived challenge state. Progress, status and reward are authoritative. */
export interface ServerChallenge {
  id: string;
  academyId: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  status: "LOCKED" | "IN_PROGRESS" | "COMPLETE";
  claimed: boolean;
  /** Set when the platform cannot verify this challenge yet. */
  lockedReason?: string;
}

class ChallengesService {
  async list(): Promise<ServerChallenge[]> {
    const response = await apiClient.get<ApiResponse<ServerChallenge[]>>("/v1/challenges");
    return response.data.data ?? [];
  }

  /** The server re-verifies completion and decides the reward; nothing is sent. */
  async claim(challengeId: string): Promise<ServerChallenge> {
    const response = await apiClient.post<ApiResponse<ServerChallenge>>(
      `/v1/challenges/${encodeURIComponent(challengeId)}/claim`,
    );
    return response.data.data;
  }
}

export const challengesService = new ChallengesService();
