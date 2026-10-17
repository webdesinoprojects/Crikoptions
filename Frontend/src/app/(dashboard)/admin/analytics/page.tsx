"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, UserPlus, Activity, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminAnalyticsOverview,
  useAdminUsers,
} from "@/features/analytics/hooks";
import { SignupTrendChart } from "@/features/analytics/components/SignupTrendChart";
import { UsersTable } from "@/features/analytics/components/UsersTable";
import type { UserStatus } from "@/features/analytics/services/analytics.service";

const PAGE_SIZE = 25;

export default function AdminAnalyticsPage() {
  const { data, isLoading, isError } = useAdminAnalyticsOverview();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [page, setPage] = useState(1);

  // Debounce so typing does not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // A filter change invalidates the current page number, so both are set
  // together in the handler rather than reacting to the change afterwards.
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: UserStatus | "all") => {
    setStatus(value);
    setPage(1);
  };

  const usersQuery = useAdminUsers({
    search: debouncedSearch || undefined,
    status,
    page,
    limit: PAGE_SIZE,
  });

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
          sub: "across active users",
          icon: Clock,
          color: "text-violet-400 bg-violet-400/10",
        },
      ]
    : [];

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Admin Console
      </Link>

      <h1 className="mb-2 text-3xl font-bold tracking-tight">Usage Analytics</h1>
      <p className="mb-8 text-sm text-gray-400">
        A session is a visit: 30 minutes of inactivity starts a new one. Times
        are measured from first to last action, so they undercount reading on a
        final page.
      </p>

      {isError ? (
        <div className="rounded-lg border border-dashed border-gray-800 bg-gray-950/50 p-8 text-center text-gray-500">
          Failed to load analytics. Try refreshing the page.
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  <span className="text-2xl font-bold leading-none tabular-nums">
                    {tile.value}
                  </span>
                  {tile.sub && (
                    <span className="text-xs text-gray-500">{tile.sub}</span>
                  )}
                </div>
              ))}
        </div>
      )}

      <div className="mb-8 rounded-xl border border-gray-800 bg-gray-950 p-5">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-gray-400">
          Signups per day
        </h2>
        <p className="mb-4 text-xs text-gray-500">Last 30 days</p>
        {isLoading || !data ? (
          <Skeleton className="h-56 w-full rounded-lg bg-gray-900" />
        ) : (
          <SignupTrendChart data={data.signupTrend} />
        )}
      </div>

      <h2 className="mb-1 text-2xl font-bold tracking-tight">Users</h2>
      <p className="mb-4 text-sm text-gray-400">
        Select a user to see their full activity.
      </p>

      <UsersTable
        rows={usersQuery.data?.users ?? []}
        total={usersQuery.data?.total ?? 0}
        page={page}
        limit={PAGE_SIZE}
        isLoading={usersQuery.isLoading}
        isError={usersQuery.isError}
        search={search}
        status={status}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onPageChange={setPage}
      />

      {data && (
        <p className="mt-6 text-xs text-gray-600">
          Last updated {new Date(data.generatedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
