import { describe, it, expect } from "vitest";
import { beanFormSchema, entryFormSchema } from "@/lib/schemas";

describe("beanFormSchema", () => {
  it("requires a name", () => {
    const result = beanFormSchema.safeParse({
      name: "",
      brand: "",
      roast: "Medium",
      origin: "",
      tastingNotes: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid bean", () => {
    const result = beanFormSchema.safeParse({
      name: "Yirgacheffe",
      brand: "Blue Tokai",
      roast: "Light",
      origin: "Ethiopia",
      tastingNotes: "Floral",
    });
    expect(result.success).toBe(true);
  });
});

describe("entryFormSchema", () => {
  const base = {
    date: "2026-06-25",
    coffeeName: "Flat White",
    cafeId: null,
    beanId: null,
    equipmentIds: [],
    brewType: "Flat White",
    milk: true,
    milkType: "Oat",
    aroma: 8,
    flavor: 7,
    aftertaste: 7,
    acidity: 5,
    body: 8,
    overallRating: 8,
    tags: ["Chocolate"],
    notes: "Lovely",
  };

  it("accepts a valid entry", () => {
    expect(entryFormSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an out-of-range rating", () => {
    expect(
      entryFormSchema.safeParse({ ...base, overallRating: 11 }).success,
    ).toBe(false);
  });

  it("rejects an unknown brew type", () => {
    expect(
      entryFormSchema.safeParse({ ...base, brewType: "Nitro" }).success,
    ).toBe(false);
  });

  it("requires a date", () => {
    expect(entryFormSchema.safeParse({ ...base, date: "" }).success).toBe(false);
  });
});
