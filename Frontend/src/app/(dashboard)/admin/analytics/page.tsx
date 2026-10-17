"use client";

import Link from "next/link";
import { ArrowLeft, Users, UserPlus, Activity, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAnalyticsOverview } from "@/features/analytics/hooks";

export default function AdminAnalyticsPage() {
  const { data, isLoading, isError } = useAdminAnalyticsOverview();

  const tiles = data
    ? [
        {
          label: "Total Users",
          value: data.totalUsers.toLocaleString("en-IN"),
          icon: Users,
          color: "text-sky-500 bg-sky-500/10",
        },
        {
          label: "New This Week",
          value: data.newUsersThisWeek.toLocaleString("en-IN"),
          sub: `${data.newUsersToday.toLocaleString("en-IN")} today`,
          icon: UserPlus,
          color: "text-emerald-400 bg-emerald-400/10",
        },
        {
          label: "Daily Active Users",
          value: data.dailyActiveUsers.toLocaleString("en-IN"),
          sub: "active in last 24h",
          icon: Activity,
          color: "text-amber-300 bg-amber-300/10",
        },
        {
          label: "Avg. Session",
          value:
            data.avgSessionMinutes > 0
              ? `${data.avgSessionMinutes.toFixed(1)} min`
              : "—",
          sub: "approx., last 24h",
          icon: Clock,
          color: "text-violet-400 bg-violet-400/10",
        },
      ]
    : [];

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Admin Console
      </Link>

      <h1 className="text-3xl font-bold tracking-tight mb-2">Usage Analytics</h1>
      <p className="text-gray-400 mb-8 text-sm">
        Daily active users and average session length are approximate — based on
        the last authenticated request per user, not a dedicated session tracker.
      </p>

      {isError ? (
        <div className="p-8 text-center text-gray-500 border border-gray-800 border-dashed rounded-lg bg-gray-950/50">
          Failed to load analytics. Try refreshing the page.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[8.5rem] rounded-xl bg-gray-900" />
              ))
            : tiles.map((tile) => (
                <div
                  key={tile.label}
                  className="flex h-[8.5rem] flex-col gap-2 rounded-xl border border-gray-800 bg-gray-950 p-5"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${tile.color}`}
                  >
                    <tile.icon className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    {tile.label}
                  </span>
                  <span className="text-2xl font-bold tabular-nums leading-none">
                    {tile.value}
                  </span>
                  {tile.sub && (
                    <span className="text-xs text-gray-500">{tile.sub}</span>
                  )}
                </div>
              ))}
        </div>
      )}

      {data && (
        <p className="text-xs text-gray-600">
          Last updated {new Date(data.generatedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
