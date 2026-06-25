import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// Unambiguous alphabet (no 0/O, 1/I/L).
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomCode(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i]! % ALPHABET.length];
  return out;
}

export interface ResolvedShare {
  uid: string;
  displayName: string;
}

/**
 * Turn sharing on: mint a unique share code, store a public `shareCodes/{code}`
 * lookup (with display name), and flip the user's `shareEnabled` flag.
 */
export async function enableSharing(
  uid: string,
  displayName: string,
): Promise<string> {
  let code = randomCode();
  for (let i = 0; i < 5; i++) {
    const existing = await getDoc(doc(db, "shareCodes", code));
    if (!existing.exists()) break;
    code = randomCode();
  }
  await setDoc(doc(db, "shareCodes", code), {
    uid,
    displayName,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "users", uid), {
    shareEnabled: true,
    shareCode: code,
    updatedAt: serverTimestamp(),
  });
  return code;
}

/** Turn sharing off and remove the public lookup. */
export async function disableSharing(
  uid: string,
  code?: string | null,
): Promise<void> {
  if (code) {
    try {
      await deleteDoc(doc(db, "shareCodes", code));
    } catch {
      // Already removed — ignore.
    }
  }
  await updateDoc(doc(db, "users", uid), {
    shareEnabled: false,
    shareCode: null,
    updatedAt: serverTimestamp(),
  });
}

/** Resolve a friend's share code to their uid + display name. */
export async function resolveShareCode(
  code: string,
): Promise<ResolvedShare | null> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  const snap = await getDoc(doc(db, "shareCodes", normalized));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (typeof data.uid !== "string") return null;
  return {
    uid: data.uid,
    displayName: data.displayName ?? "Coffee Lover",
  };
}
