"use client";

import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminUserRow, UserStatus } from "../services/analytics.service";
import { formatDuration, formatRelative } from "../utils/format";

const STATUS_FILTERS: { value: UserStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "dormant", label: "Dormant" },
  { value: "never", label: "Never active" },
];

const STATUS_STYLES: Record<UserStatus, string> = {
  active: "bg-emerald-400/10 text-emerald-300",
  dormant: "bg-amber-300/10 text-amber-200",
  never: "bg-gray-700/40 text-gray-400",
};

function StatusPill({ status }: { status: UserStatus }) {
  const label = status === "never" ? "Never active" : status;
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[status]}`}
    >
      {label}
    </span>
  );
}

type Props = {
  rows: AdminUserRow[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  isError: boolean;
  search: string;
  status: UserStatus | "all";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: UserStatus | "all") => void;
  onPageChange: (page: number) => void;
};

export function UsersTable({
  rows,
  total,
  page,
  limit,
  isLoading,
  isError,
  search,
  status,
  onSearchChange,
  onStatusChange,
  onPageChange,
}: Props) {
  const router = useRouter();
  const lastPage = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950">
      {/* Filters: search plus status chips, all in one row above the table. */}
      <div className="flex flex-col gap-3 border-b border-gray-800 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name or email"
            aria-label="Search users by name or email"
            className="w-full rounded-lg border border-gray-800 bg-gray-900 py-2 pl-9 pr-3 text-sm text-gray-200 placeholder:text-gray-600 focus:border-sky-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => onStatusChange(filter.value)}
              aria-pressed={status === filter.value}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                status === filter.value
                  ? "bg-sky-600 text-white"
                  : "border border-gray-800 text-gray-400 hover:bg-gray-900"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <div className="p-8 text-center text-sm text-gray-500">
          Failed to load users. Try refreshing the page.
        </div>
      ) : isLoading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg bg-gray-900" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500">
          {search || status !== "all"
            ? "No users match this filter."
            : "No users registered yet."}
        </div>
      ) : (
        // Horizontal scroll rather than hiding columns, so nothing is lost
        // on a phone.
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-[11px] uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3 font-bold">User</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Last seen</th>
                <th className="px-4 py-3 text-right font-bold">Sessions</th>
                <th className="px-4 py-3 text-right font-bold">Avg session</th>
                <th className="px-4 py-3 text-right font-bold">Total time</th>
                <th className="px-4 py-3 text-right font-bold">Orders</th>
                <th className="px-4 py-3 text-right font-bold">Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => router.push(`/admin/analytics/users/${user.id}`)}
                  className="cursor-pointer border-b border-gray-900 transition-colors last:border-0 hover:bg-gray-900"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-200">{user.name}</span>
                      {user.isNew && (
                        <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-400">
                          New
                        </span>
                      )}
                      {user.role === "admin" && (
                        <span className="rounded-full bg-violet-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-300">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={user.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-400">
                    {formatRelative(user.lastSeenAt)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-300">
                    {user.sessionCount || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-gray-300">
                    {formatDuration(user.avgSessionSeconds)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-gray-300">
                    {formatDuration(user.totalActiveSeconds)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-300">
                    {user.orderCount}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-gray-300">
                    ₵{Math.round(user.walletBalance).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 && (
        <div className="flex items-center justify-between border-t border-gray-800 px-4 py-3 text-xs text-gray-500">
          <span>
            Showing {from}–{to} of {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
              className="rounded-lg border border-gray-800 p-1.5 transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="tabular-nums">
              {page} / {lastPage}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= lastPage}
              aria-label="Next page"
              className="rounded-lg border border-gray-800 p-1.5 transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
