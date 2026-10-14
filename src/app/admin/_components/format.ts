// Display helpers for the admin panel. All dates are shown in Philippine time.

const TZ = "Asia/Manila";

/** "Oct 6, 2026, 2:05 PM" */
export const dateTime = (ms: number) =>
  new Intl.DateTimeFormat("en-PH", { timeZone: TZ, dateStyle: "medium", timeStyle: "short" }).format(ms);

/** "YYYY-MM-DD" → "Mon, Oct 12, 2026" (the string is already a local date). */
export function longDate(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("en-PH", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(
    Date.UTC(y, m - 1, d),
  );
}

/** "14:30" → "2:30 PM" */
export function clock(hhmm?: string) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export const peso = (centavos: number) =>
  `₱${(centavos / 100).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Today's date in Manila, YYYY-MM-DD. */
export const todayManila = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

export const statusClass = (status: string) => `pill pill-${status.toLowerCase()}`;

/** Turns a Convex error into a sentence for the admin. */
export function errorMessage(error: unknown) {
  const data = (error as { data?: unknown })?.data;
  if (typeof data === "string") return data;
  return "Something went wrong. Please try again.";
}
