import { describe, it, expect } from "vitest";
import {
  averageOverall,
  blackVsMilk,
  brewTypeCounts,
  buildInsights,
  favoriteBrew,
  ratingDistribution,
  topCafes,
} from "@/lib/chart-helpers";
import type { Cafe, Entry } from "@/lib/types";

let counter = 0;
function entry(partial: Partial<Entry> = {}): Entry {
  counter += 1;
  return {
    id: `e${counter}`,
    date: new Date(2026, 5, 1),
    equipmentIds: [],
    brewType: "Espresso",
    milk: false,
    ratings: { aroma: 7, flavor: 7, aftertaste: 7, acidity: 6, body: 7 },
    overallRating: 7,
    tags: [],
    createdAt: new Date(2026, 5, 1),
    updatedAt: new Date(2026, 5, 1),
    ...partial,
  };
}

describe("averageOverall", () => {
  it("returns 0 for no entries", () => {
    expect(averageOverall([])).toBe(0);
  });

  it("averages and rounds to one decimal", () => {
    const entries = [
      entry({ overallRating: 8 }),
      entry({ overallRating: 7 }),
      entry({ overallRating: 6 }),
    ];
    expect(averageOverall(entries)).toBe(7);
  });
});

describe("favoriteBrew", () => {
  it("returns null with no entries", () => {
    expect(favoriteBrew([])).toBeNull();
  });

  it("picks the most-logged brew", () => {
    const entries = [
      entry({ brewType: "Latte", overallRating: 8 }),
      entry({ brewType: "Latte", overallRating: 6 }),
      entry({ brewType: "Espresso", overallRating: 9 }),
    ];
    expect(favoriteBrew(entries)?.type).toBe("Latte");
  });
});

describe("brewTypeCounts", () => {
  it("counts and sorts descending", () => {
    const entries = [
      entry({ brewType: "Latte" }),
      entry({ brewType: "Latte" }),
      entry({ brewType: "Espresso" }),
    ];
    const result = brewTypeCounts(entries);
    expect(result[0]).toEqual({ type: "Latte", count: 2 });
    expect(result[1]).toEqual({ type: "Espresso", count: 1 });
  });
});

describe("blackVsMilk", () => {
  it("splits black and milk", () => {
    const entries = [
      entry({ milk: true }),
      entry({ milk: false }),
      entry({ milk: false }),
    ];
    expect(blackVsMilk(entries)).toEqual([
      { name: "Black", value: 2 },
      { name: "With Milk", value: 1 },
    ]);
  });
});

describe("ratingDistribution", () => {
  it("buckets ratings 1–10", () => {
    const dist = ratingDistribution([
      entry({ overallRating: 8 }),
      entry({ overallRating: 8 }),
      entry({ overallRating: 3 }),
    ]);
    expect(dist).toHaveLength(10);
    expect(dist[7]).toEqual({ rating: 8, count: 2 });
    expect(dist[2]).toEqual({ rating: 3, count: 1 });
  });
});

describe("topCafes", () => {
  it("ranks cafés by visit count", () => {
    const cafes: Cafe[] = [
      {
        id: "c1",
        name: "Blue Tokai",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const entries = [
      entry({ cafeId: "c1", overallRating: 8 }),
      entry({ cafeId: "c1", overallRating: 6 }),
      entry({ cafeId: null }),
    ];
    const result = topCafes(entries, cafes);
    expect(result[0]).toEqual({ name: "Blue Tokai", count: 2, avg: 7 });
  });
});

describe("buildInsights", () => {
  it("returns nothing with too few entries", () => {
    expect(buildInsights([entry(), entry()])).toEqual([]);
  });

  it("produces insights for a richer history", () => {
    const entries = [
      entry({ brewType: "Latte", milk: true, overallRating: 9, tags: ["Chocolate"] }),
      entry({ brewType: "Latte", milk: true, overallRating: 8, tags: ["Chocolate"] }),
      entry({ brewType: "Espresso", milk: false, overallRating: 5, tags: ["Chocolate"] }),
      entry({ brewType: "Espresso", milk: false, overallRating: 4 }),
    ];
    const insights = buildInsights(entries);
    expect(insights.length).toBeGreaterThan(0);
  });
});
