"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Wallet, Activity, ChevronRight } from "lucide-react";

type AdminMatch = {
  _id: string;
  teams?: { home?: string; away?: string };
  teamAName?: string;
  teamBName?: string;
  tournament?: string;
  status?: string;
};

export default function AdminConsolePage() {
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await apiClient.get<{ data?: AdminMatch[] }>("/v1/matches/home");
        setMatches(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch matches", error);
        toast.error("Failed to load active matches");
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Admin Console</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Wallets Control Card */}
        <Link href="/admin/wallets">
          <div className="group border border-gray-800 rounded-xl p-6 bg-gray-950 hover:bg-gray-900 transition-colors cursor-pointer h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-sky-500/10 text-sky-500 rounded-lg flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold mb-2">Wallet Funding & Ledgers</h2>
              <p className="text-gray-400 text-sm">
                Credit paper money to user accounts, view active wallet balances, and monitor reserved margins.
              </p>
            </div>
            <div className="mt-6 flex items-center text-sky-500 font-medium group-hover:translate-x-1 transition-transform">
              Manage Wallets <ChevronRight className="ml-1 w-4 h-4" />
            </div>
          </div>
        </Link>

        {/* Global Match Settings Card (Placeholder for future) */}
        <div className="opacity-50 pointer-events-none border border-gray-800 rounded-xl p-6 bg-gray-950 h-full flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-gray-800 text-gray-500 rounded-lg flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-gray-400">System Activity</h2>
            <p className="text-gray-500 text-sm">
              Global order rejection rates, matching engine logs, and real-time active WebSocket connection counts. (Coming Soon)
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight mb-4">Live Match Simulators</h2>
      <p className="text-gray-400 mb-6">
        Select an active match below to open the Match Control Simulator. From there, you can manually trigger ball events and watch the pricing engine and market snapshots react in real-time.
      </p>

      {loading ? (
        <div className="p-8 text-center text-gray-500 border border-gray-800 border-dashed rounded-lg">
          Loading active matches...
        </div>
      ) : matches.length === 0 ? (
        <div className="p-8 text-center text-gray-500 border border-gray-800 border-dashed rounded-lg bg-gray-950/50">
          No active matches found. Check your database seeds.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {matches.map((match) => {
            const teamA = match.teamAName || match.teams?.home || "Unknown";
            const teamB = match.teamBName || match.teams?.away || "Unknown";
            
            return (
              <div key={match._id} className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-gray-950">
                <div className="flex flex-col">
                  <span className="font-bold text-lg">{teamA} vs {teamB}</span>
                  <span className="text-sm text-gray-400">
                    {match.tournament || "Tournament"} • Status: <span className="text-sky-500 uppercase">{match.status}</span>
                  </span>
                </div>
                <Link href={`/admin/matches/${match._id}`}>
                  <Button variant="secondary">Open Simulator: {teamA} vs {teamB}</Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
