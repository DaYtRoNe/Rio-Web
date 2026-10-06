/** All "today" logic uses Sri Lanka time, regardless of where the server runs. */
export const TIME_ZONE = "Asia/Colombo";

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Today's date in Sri Lanka as YYYY-MM-DD. */
export function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Validates a YYYY-MM-DD string; falls back to today when missing or malformed. */
export function parseIsoDate(value: string | undefined): string {
  if (value && ISO_DATE.test(value) && !Number.isNaN(Date.parse(value))) {
    return value;
  }
  return todayIso();
}

/** Shift a YYYY-MM-DD string by N days (calendar arithmetic, no DST surprises in UTC). */
export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday, matching the `timetable.weekday` column. */
export function weekdayOf(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getUTCDay();
}

/**
 * The exact string the old desktop app produced and copied to the clipboard:
 *   "6 ශ්‍රේණිය - ගණිතය (2026-09-22)"
 */
export function formatClassName(grade: string, subject: string, iso: string) {
  return `${grade} - ${subject} (${iso})`;
}

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/**
 * Timestamp in Sri Lanka time. Formatted on the server with an explicit time
 * zone so the markup is identical on both sides and can't cause a hydration
 * mismatch.
 */
export function formatDateTime(iso: string): string {
  return DATE_TIME_FORMAT.format(new Date(iso));
}
