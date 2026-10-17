"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Hourglass,
  Repeat,
  Radio,
  Wallet,
  Receipt,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminUser } from "@/features/analytics/hooks";
import {
  formatDate,
  formatDuration,
  formatRelative,
} from "@/features/analytics/utils/format";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-400/10 text-emerald-300",
  dormant: "bg-amber-300/10 text-amber-200",
  never: "bg-gray-700/40 text-gray-400",
};

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="flex h-[8.5rem] flex-col gap-2 rounded-xl border border-gray-800 bg-gray-950 p-5">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <span className="text-2xl font-bold leading-none tabular-nums">{value}</span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  );
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const { data: user, isLoading, isError } = useAdminUser(userId);

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <Link
        href="/admin/analytics"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Usage Analytics
      </Link>

      {isError ? (
        <div className="rounded-lg border border-dashed border-gray-800 bg-gray-950/50 p-8 text-center text-gray-500">
          Could not load this user. They may have been removed.
        </div>
      ) : isLoading || !user ? (
        <div className="space-y-6">
          <Skeleton className="h-24 w-full rounded-xl bg-gray-900" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[8.5rem] rounded-xl bg-gray-900" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    STATUS_STYLES[user.status] ?? STATUS_STYLES.never
                  }`}
                >
                  {user.status === "never" ? "Never active" : user.status}
                </span>
                {user.role === "admin" && (
                  <span className="rounded-full bg-violet-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-300">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">{user.email}</p>
              {user.phone && (
                <p className="text-sm text-gray-500">{user.phone}</p>
              )}
            </div>

            <div className="text-right text-xs text-gray-500">
              <p>Joined {formatDate(user.createdAt)}</p>
              <p>Last seen {formatRelative(user.lastSeenAt)}</p>
              <p>Tier {user.tier}</p>
            </div>
          </div>

          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">
            Activity
          </h2>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              icon={Hourglass}
              label="Total time"
              value={formatDuration(user.totalActiveSeconds)}
              sub="all sessions combined"
              color="text-violet-400 bg-violet-400/10"
            />
            <Stat
              icon={Clock}
              label="Avg. session"
              value={formatDuration(user.avgSessionSeconds)}
              sub="per visit"
              color="text-sky-500 bg-sky-500/10"
            />
            <Stat
              icon={Repeat}
              label="Sessions"
              value={user.sessionCount ? String(user.sessionCount) : "—"}
              sub="visits since tracking began"
              color="text-emerald-400 bg-emerald-400/10"
            />
            <Stat
              icon={Radio}
              label="Current session"
              value={
                user.currentSessionSeconds > 0
                  ? formatDuration(user.currentSessionSeconds)
                  : "—"
              }
              sub={user.currentSessionSeconds > 0 ? "in progress" : "not online"}
              color="text-amber-300 bg-amber-300/10"
            />
          </div>

          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">
            Trading &amp; wallet
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              icon={Receipt}
              label="Orders placed"
              value={user.orderCount.toLocaleString("en-IN")}
              color="text-sky-500 bg-sky-500/10"
            />
            <Stat
              icon={CheckCircle2}
              label="Orders filled"
              value={user.filledOrders.toLocaleString("en-IN")}
              sub={
                user.orderCount > 0
                  ? `${Math.round((user.filledOrders / user.orderCount) * 100)}% fill rate`
                  : undefined
              }
              color="text-emerald-400 bg-emerald-400/10"
            />
            <Stat
              icon={Wallet}
              label="Available balance"
              value={`₵${Math.round(user.walletBalance).toLocaleString("en-IN")}`}
              color="text-violet-400 bg-violet-400/10"
            />
            <Stat
              icon={Lock}
              label="Reserved margin"
              value={`₵${Math.round(user.walletReserved).toLocaleString("en-IN")}`}
              sub="held against open orders"
              color="text-amber-300 bg-amber-300/10"
            />
          </div>
        </>
      )}
    </div>
  );
}
