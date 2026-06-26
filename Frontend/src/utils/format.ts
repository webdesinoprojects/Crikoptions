export function formatMoney(value: number, decimals: number = 2): string {
  if (!Number.isFinite(value)) return "0.00";
  return value.toLocaleString("en-IN", { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
}

export function formatTime(date: Date, options?: { seconds?: boolean }): string {
  const opts: Intl.DateTimeFormatOptions = { 
    hour: "2-digit", 
    minute: "2-digit" 
  };
  if (options?.seconds) {
    opts.second = "2-digit";
  }
  return date.toLocaleTimeString([], opts);
}

export function shortId(value: string | undefined | null, maxLength: number = 8): string {
  if (!value) return "";
  return value.slice(0, maxLength);
}
