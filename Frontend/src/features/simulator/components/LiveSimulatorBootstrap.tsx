"use client";

import { useEffect } from "react";
import { dashboardService } from "@/features/dashboard/services/dashboard.service";
import {
  ensureMatchSimulatorRunning,
  resolveSimulatorScript,
} from "@/features/simulator/services/simulator.service";

const POLL_MS = 15_000;
const autoStartEnabled = process.env.NEXT_PUBLIC_SIMULATOR_AUTO_START !== "false";

/**
 * Keeps CSV match simulators running for all LIVE matches — no admin clicks required.
 * Polls periodically so paused/finished workers are resumed or restarted.
 */
export function LiveSimulatorBootstrap() {
  useEffect(() => {
    if (!autoStartEnabled) return;

    let active = true;

    const syncSimulators = async () => {
      try {
        const matches = await dashboardService.fetchHomeMatches();
        const liveMatches = matches.filter((match) => match.status === "LIVE");

        for (const match of liveMatches) {
          if (!active) return;

          const scriptName = resolveSimulatorScript(
            match.id,
            match.homeTeam.name,
            match.awayTeam.name
          );
          if (!scriptName) continue;

          await ensureMatchSimulatorRunning(match.id, scriptName);
        }
      } catch {
        // Backend may be offline or user not authenticated yet — retry on next poll.
      }
    };

    void syncSimulators();
    const interval = window.setInterval(() => {
      void syncSimulators();
    }, POLL_MS);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
