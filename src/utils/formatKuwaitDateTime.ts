/** API datetimes are in Kuwait (+03:00). Format in this zone so UI matches the API wall clock. */
const KUWAIT_TZ = "Asia/Kuwait";

function part(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes
): string {
  return parts.find((p) => p.type === type)?.value ?? "";
}

/**
 * @param dateString ISO string from API (e.g. with +03:00) or date-only YYYY-MM-DD
 */
export function formatKuwaitDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: KUWAIT_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const parts = dtf.formatToParts(date);
  return `${part(parts, "day")}/${part(parts, "month")}/${part(parts, "year")}`;
}

/**
 * @param dateString ISO string from API (e.g. with +03:00)
 */
export function formatKuwaitDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: KUWAIT_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(date);
  return `${part(parts, "day")}/${part(parts, "month")}/${part(parts, "year")} ${part(parts, "hour")}:${part(parts, "minute")}`;
}
