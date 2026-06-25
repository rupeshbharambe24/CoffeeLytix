import {
  Timestamp,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";
import type {
  Bean,
  Cafe,
  Entry,
  Equipment,
  Ratings,
  UserProfile,
} from "@/lib/types";
import { RATING_ATTRIBUTES } from "@/lib/types";

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

function toRatings(value: unknown): Ratings {
  const source = (value ?? {}) as Record<string, unknown>;
  const ratings = {} as Ratings;
  for (const attr of RATING_ATTRIBUTES) {
    const n = Number(source[attr]);
    ratings[attr] = Number.isFinite(n) ? n : 5;
  }
  return ratings;
}

type Snap = DocumentSnapshot<DocumentData>;

export function entryFromDoc(snap: Snap): Entry {
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    date: toDate(d.date),
    coffeeName: d.coffeeName ?? "",
    cafeId: d.cafeId ?? null,
    beanId: d.beanId ?? null,
    equipmentIds: Array.isArray(d.equipmentIds) ? d.equipmentIds : [],
    brewType: d.brewType ?? "Other",
    milk: Boolean(d.milk),
    milkType: d.milkType ?? null,
    photoURL: d.photoURL ?? null,
    photoPath: d.photoPath ?? null,
    ratings: toRatings(d.ratings),
    overallRating: Number(d.overallRating ?? 5),
    tags: Array.isArray(d.tags) ? d.tags : [],
    notes: d.notes ?? "",
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

export function beanFromDoc(snap: Snap): Bean {
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    name: d.name ?? "",
    brand: d.brand ?? "",
    roast: d.roast ?? undefined,
    origin: d.origin ?? "",
    photoURL: d.photoURL ?? null,
    photoPath: d.photoPath ?? null,
    tastingNotes: d.tastingNotes ?? "",
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

export function cafeFromDoc(snap: Snap): Cafe {
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    name: d.name ?? "",
    address: d.address ?? "",
    photoURL: d.photoURL ?? null,
    photoPath: d.photoPath ?? null,
    notes: d.notes ?? "",
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

export function equipmentFromDoc(snap: Snap): Equipment {
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    name: d.name ?? "",
    type: d.type ?? undefined,
    photoURL: d.photoURL ?? null,
    photoPath: d.photoPath ?? null,
    notes: d.notes ?? "",
    rating: typeof d.rating === "number" ? d.rating : null,
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

export function profileFromDoc(snap: Snap): UserProfile {
  const d = snap.data() ?? {};
  return {
    uid: snap.id,
    displayName: d.displayName ?? "",
    email: d.email ?? "",
    photoURL: d.photoURL ?? null,
    shareEnabled: Boolean(d.shareEnabled),
    shareCode: d.shareCode ?? null,
    preferences: {
      defaultView: d.preferences?.defaultView === "list" ? "list" : "grid",
    },
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}
