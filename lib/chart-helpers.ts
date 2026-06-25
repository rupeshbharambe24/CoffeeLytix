import { format } from "date-fns";
import {
  RATING_ATTRIBUTES,
  RATING_LABELS,
  type Cafe,
  type Entry,
  type RatingAttribute,
} from "@/lib/types";

export function averageOverall(entries: Entry[]): number {
  if (entries.length === 0) return 0;
  const sum = entries.reduce((acc, e) => acc + e.overallRating, 0);
  return round1(sum / entries.length);
}

export function favoriteBrew(entries: Entry[]): { type: string; avg: number } | null {
  if (entries.length === 0) return null;
  const byType = new Map<string, { sum: number; count: number }>();
  for (const e of entries) {
    const cur = byType.get(e.brewType) ?? { sum: 0, count: 0 };
    cur.sum += e.overallRating;
    cur.count += 1;
    byType.set(e.brewType, cur);
  }
  let best: { type: string; avg: number; count: number } | null = null;
  for (const [type, { sum, count }] of byType) {
    const avg = sum / count;
    if (!best || count > best.count || (count === best.count && avg > best.avg)) {
      best = { type, avg: round1(avg), count };
    }
  }
  return best ? { type: best.type, avg: best.avg } : null;
}

export function brewTypeCounts(entries: Entry[]): { type: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of entries) counts.set(e.brewType, (counts.get(e.brewType) ?? 0) + 1);
  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

export function blackVsMilk(entries: Entry[]): { name: string; value: number }[] {
  let milk = 0;
  let black = 0;
  for (const e of entries) {
    if (e.milk) milk++;
    else black++;
  }
  return [
    { name: "Black", value: black },
    { name: "With Milk", value: milk },
  ];
}

export function ratingDistribution(entries: Entry[]): { rating: number; count: number }[] {
  const buckets = Array.from({ length: 10 }, (_, i) => ({ rating: i + 1, count: 0 }));
  for (const e of entries) {
    const idx = Math.min(9, Math.max(0, Math.round(e.overallRating) - 1));
    buckets[idx]!.count += 1;
  }
  return buckets;
}

export function ratingOverTime(entries: Entry[]): { month: string; avg: number }[] {
  const byMonth = new Map<string, { sum: number; count: number; key: number }>();
  for (const e of entries) {
    const label = format(e.date, "MMM yyyy");
    const key = e.date.getFullYear() * 12 + e.date.getMonth();
    const cur = byMonth.get(label) ?? { sum: 0, count: 0, key };
    cur.sum += e.overallRating;
    cur.count += 1;
    byMonth.set(label, cur);
  }
  return [...byMonth.entries()]
    .sort((a, b) => a[1].key - b[1].key)
    .map(([month, { sum, count }]) => ({ month, avg: round1(sum / count) }));
}

export function topCafes(
  entries: Entry[],
  cafes: Cafe[],
  limit = 5,
): { name: string; count: number; avg: number }[] {
  const nameById = new Map(cafes.map((c) => [c.id, c.name]));
  const byCafe = new Map<string, { sum: number; count: number }>();
  for (const e of entries) {
    if (!e.cafeId) continue;
    const cur = byCafe.get(e.cafeId) ?? { sum: 0, count: 0 };
    cur.sum += e.overallRating;
    cur.count += 1;
    byCafe.set(e.cafeId, cur);
  }
  return [...byCafe.entries()]
    .map(([id, { sum, count }]) => ({
      name: nameById.get(id) ?? "Unknown café",
      count,
      avg: round1(sum / count),
    }))
    .sort((a, b) => b.count - a.count || b.avg - a.avg)
    .slice(0, limit);
}

export function tagCounts(entries: Entry[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of entries) {
    for (const tag of e.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function averageRatingsByAttribute(
  entries: Entry[],
): { attribute: RatingAttribute; label: string; avg: number }[] {
  return RATING_ATTRIBUTES.map((attribute) => {
    if (entries.length === 0) {
      return { attribute, label: RATING_LABELS[attribute], avg: 0 };
    }
    const sum = entries.reduce((acc, e) => acc + (e.ratings[attribute] ?? 0), 0);
    return {
      attribute,
      label: RATING_LABELS[attribute],
      avg: round1(sum / entries.length),
    };
  });
}

export function entriesForBean(entries: Entry[], beanId: string): Entry[] {
  return entries.filter((e) => e.beanId === beanId);
}

export function entriesForCafe(entries: Entry[], cafeId: string): Entry[] {
  return entries.filter((e) => e.cafeId === cafeId);
}

/** Stats-based insights (light v2 — no external AI). */
export function buildInsights(entries: Entry[]): string[] {
  if (entries.length < 3) return [];
  const insights: string[] = [];

  const attrs = averageRatingsByAttribute(entries);
  const ranked = [...attrs].sort((a, b) => b.avg - a.avg);
  const top = ranked[0];
  const bottom = ranked[ranked.length - 1];
  if (top && bottom && top.avg - bottom.avg >= 0.5) {
    insights.push(
      `You rate ${top.label.toLowerCase()} highest on average (${top.avg}), and ${bottom.label.toLowerCase()} lowest (${bottom.avg}).`,
    );
  }

  const milkEntries = entries.filter((e) => e.milk);
  const blackEntries = entries.filter((e) => !e.milk);
  if (milkEntries.length >= 2 && blackEntries.length >= 2) {
    const milkAvg = averageOverall(milkEntries);
    const blackAvg = averageOverall(blackEntries);
    if (Math.abs(milkAvg - blackAvg) >= 0.4) {
      const prefersMilk = milkAvg > blackAvg;
      insights.push(
        `Your ${prefersMilk ? "milk" : "black"} coffees rate higher on average (${
          prefersMilk ? milkAvg : blackAvg
        } vs ${prefersMilk ? blackAvg : milkAvg}).`,
      );
    }
  }

  const fav = favoriteBrew(entries);
  if (fav) {
    insights.push(`${fav.type} is your most-logged brew, averaging ${fav.avg}/10.`);
  }

  const topTag = tagCounts(entries)[0];
  if (topTag && topTag.count >= 3) {
    insights.push(
      `"${topTag.tag}" is your most common flavor note, appearing in ${topTag.count} entries.`,
    );
  }

  return insights;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
