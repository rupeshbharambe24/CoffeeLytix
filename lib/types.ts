/** Shared domain types for Coffeelytix. */

export const BREW_TYPES = [
  "Espresso",
  "Pour-over",
  "French Press",
  "Aeropress",
  "Moka Pot",
  "Cold Brew",
  "Drip",
  "Latte",
  "Cappuccino",
  "Flat White",
  "Americano",
  "Other",
] as const;
export type BrewType = (typeof BREW_TYPES)[number];

export const ROAST_LEVELS = [
  "Light",
  "Medium-Light",
  "Medium",
  "Medium-Dark",
  "Dark",
] as const;
export type RoastLevel = (typeof ROAST_LEVELS)[number];

export const EQUIPMENT_TYPES = [
  "Grinder",
  "Espresso Machine",
  "French Press",
  "Pour-over",
  "Aeropress",
  "Moka Pot",
  "Kettle",
  "Scale",
  "Other",
] as const;
export type EquipmentType = (typeof EQUIPMENT_TYPES)[number];

/** Rating attributes scored 1–10 on each entry. */
export const RATING_ATTRIBUTES = [
  "aroma",
  "flavor",
  "aftertaste",
  "acidity",
  "body",
] as const;
export type RatingAttribute = (typeof RATING_ATTRIBUTES)[number];
export type Ratings = Record<RatingAttribute, number>;

export const RATING_LABELS: Record<RatingAttribute, string> = {
  aroma: "Aroma",
  flavor: "Flavor",
  aftertaste: "Aftertaste",
  acidity: "Acidity",
  body: "Body",
};

/** Common flavor tags offered as quick-add suggestions. */
export const SUGGESTED_TAGS = [
  "Chocolate",
  "Fruity",
  "Nutty",
  "Floral",
  "Caramel",
  "Citrus",
  "Berry",
  "Earthy",
  "Spicy",
  "Smoky",
  "Sweet",
  "Bright",
] as const;

export interface Entry {
  id: string;
  date: Date;
  coffeeName?: string;
  cafeId?: string | null;
  beanId?: string | null;
  equipmentIds: string[];
  brewType: BrewType;
  milk: boolean;
  milkType?: string | null;
  photoURL?: string | null;
  photoPath?: string | null;
  ratings: Ratings;
  overallRating: number;
  tags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bean {
  id: string;
  name: string;
  brand?: string;
  roast?: RoastLevel;
  origin?: string;
  photoURL?: string | null;
  photoPath?: string | null;
  tastingNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cafe {
  id: string;
  name: string;
  address?: string;
  photoURL?: string | null;
  photoPath?: string | null;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Equipment {
  id: string;
  name: string;
  type?: EquipmentType;
  photoURL?: string | null;
  photoPath?: string | null;
  notes?: string;
  rating?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string | null;
  shareEnabled: boolean;
  shareCode?: string | null;
  preferences: {
    defaultView: "grid" | "list";
  };
  createdAt: Date;
  updatedAt: Date;
}

/** Collection names under /users/{uid}. */
export type CollectionName = "entries" | "beans" | "cafes" | "equipment";
