/**
 * Formats a duration the way a screen-time readout does: the two largest
 * meaningful units, never a bare float. 0 renders as an em dash so empty
 * cells stay quiet instead of showing a misleading "0s".
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 1) return "—";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

/** Short absolute date, e.g. "17 Oct 2026". */
export function formatDate(value?: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Relative age, e.g. "3m ago" / "2d ago", for last-seen columns. */
export function formatRelative(value?: string): string {
  if (!value) return "Never";

  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return formatDate(value);
}
