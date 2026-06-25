import { format, formatDistanceToNow } from "date-fns";

export function formatDate(date: Date): string {
  return format(date, "d MMM yyyy");
}

export function formatLongDate(date: Date): string {
  return format(date, "EEEE, d MMMM yyyy");
}

export function toDateInputValue(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function fromDateInputValue(value: string): Date {
  // Interpret as local midnight to avoid timezone drift.
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function timeAgo(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}
