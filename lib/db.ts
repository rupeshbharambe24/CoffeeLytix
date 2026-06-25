import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type DocumentData,
  type FirestoreError,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  beanFromDoc,
  cafeFromDoc,
  entryFromDoc,
  equipmentFromDoc,
} from "@/lib/converters";
import type { Bean, Cafe, Entry, Equipment } from "@/lib/types";

export type EntryInput = Omit<Entry, "id" | "createdAt" | "updatedAt">;
export type BeanInput = Omit<Bean, "id" | "createdAt" | "updatedAt">;
export type CafeInput = Omit<Cafe, "id" | "createdAt" | "updatedAt">;
export type EquipmentInput = Omit<Equipment, "id" | "createdAt" | "updatedAt">;

type ErrCb = (error: FirestoreError) => void;

function userCol(uid: string, name: string) {
  return collection(db, "users", uid, name);
}

function userDoc(uid: string, name: string, id: string) {
  return doc(db, "users", uid, name, id);
}

/** Remove `undefined` values — Firestore rejects them. */
function clean<T extends DocumentData>(data: T): DocumentData {
  const out: DocumentData = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

function entryToDoc(input: Partial<EntryInput>): DocumentData {
  const out: DocumentData = { ...input };
  if (input.date instanceof Date) out.date = Timestamp.fromDate(input.date);
  return clean(out);
}

/* ----------------------------- Entries ----------------------------- */

export function subscribeEntries(
  uid: string,
  cb: (entries: Entry[]) => void,
  onError?: ErrCb,
) {
  const q = query(userCol(uid, "entries"), orderBy("date", "desc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map(entryFromDoc)), onError);
}

export function subscribeEntry(
  uid: string,
  id: string,
  cb: (entry: Entry | null) => void,
  onError?: ErrCb,
) {
  return onSnapshot(
    userDoc(uid, "entries", id),
    (snap) => cb(snap.exists() ? entryFromDoc(snap) : null),
    onError,
  );
}

export async function createEntry(uid: string, input: EntryInput) {
  const ref = await addDoc(userCol(uid, "entries"), {
    ...entryToDoc(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateEntry(
  uid: string,
  id: string,
  input: Partial<EntryInput>,
) {
  await updateDoc(userDoc(uid, "entries", id), {
    ...entryToDoc(input),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEntry(uid: string, id: string) {
  await deleteDoc(userDoc(uid, "entries", id));
}

/* ------------------------------ Beans ------------------------------ */

export function subscribeBeans(
  uid: string,
  cb: (beans: Bean[]) => void,
  onError?: ErrCb,
) {
  const q = query(userCol(uid, "beans"), orderBy("name"));
  return onSnapshot(q, (snap) => cb(snap.docs.map(beanFromDoc)), onError);
}

export function subscribeBean(
  uid: string,
  id: string,
  cb: (bean: Bean | null) => void,
  onError?: ErrCb,
) {
  return onSnapshot(
    userDoc(uid, "beans", id),
    (snap) => cb(snap.exists() ? beanFromDoc(snap) : null),
    onError,
  );
}

export async function createBean(uid: string, input: BeanInput) {
  const ref = await addDoc(userCol(uid, "beans"), {
    ...clean(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateBean(
  uid: string,
  id: string,
  input: Partial<BeanInput>,
) {
  await updateDoc(userDoc(uid, "beans", id), {
    ...clean(input),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBean(uid: string, id: string) {
  await deleteDoc(userDoc(uid, "beans", id));
}

/* ------------------------------ Cafés ------------------------------ */

export function subscribeCafes(
  uid: string,
  cb: (cafes: Cafe[]) => void,
  onError?: ErrCb,
) {
  const q = query(userCol(uid, "cafes"), orderBy("name"));
  return onSnapshot(q, (snap) => cb(snap.docs.map(cafeFromDoc)), onError);
}

export function subscribeCafe(
  uid: string,
  id: string,
  cb: (cafe: Cafe | null) => void,
  onError?: ErrCb,
) {
  return onSnapshot(
    userDoc(uid, "cafes", id),
    (snap) => cb(snap.exists() ? cafeFromDoc(snap) : null),
    onError,
  );
}

export async function createCafe(uid: string, input: CafeInput) {
  const ref = await addDoc(userCol(uid, "cafes"), {
    ...clean(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCafe(
  uid: string,
  id: string,
  input: Partial<CafeInput>,
) {
  await updateDoc(userDoc(uid, "cafes", id), {
    ...clean(input),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCafe(uid: string, id: string) {
  await deleteDoc(userDoc(uid, "cafes", id));
}

/* ---------------------------- Equipment ---------------------------- */

export function subscribeEquipment(
  uid: string,
  cb: (equipment: Equipment[]) => void,
  onError?: ErrCb,
) {
  const q = query(userCol(uid, "equipment"), orderBy("name"));
  return onSnapshot(q, (snap) => cb(snap.docs.map(equipmentFromDoc)), onError);
}

export async function createEquipment(uid: string, input: EquipmentInput) {
  const ref = await addDoc(userCol(uid, "equipment"), {
    ...clean(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateEquipment(
  uid: string,
  id: string,
  input: Partial<EquipmentInput>,
) {
  await updateDoc(userDoc(uid, "equipment", id), {
    ...clean(input),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEquipment(uid: string, id: string) {
  await deleteDoc(userDoc(uid, "equipment", id));
}
