export function isOrderPreviewFresh(expiresAt: string | undefined, now: number): boolean {
  if (!expiresAt || !Number.isFinite(now)) return false;
  const expiry = Date.parse(expiresAt);
  return Number.isFinite(expiry) && expiry > now;
}
