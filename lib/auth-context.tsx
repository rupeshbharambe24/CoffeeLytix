"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { profileFromDoc } from "@/lib/converters";
import type { UserProfile } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Create the user's profile document on first sign-in if it doesn't exist. */
async function ensureUserProfile(user: User): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    displayName: user.displayName ?? "Coffee Lover",
    email: user.email ?? "",
    photoURL: user.photoURL ?? null,
    shareEnabled: false,
    shareCode: null,
    preferences: { defaultView: "grid" },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (nextUser) => {
        setUser(nextUser);
        if (nextUser) {
          try {
            await ensureUserProfile(nextUser);
          } catch (err) {
            console.error("Failed to ensure user profile", err);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (error) => {
        // e.g. Firebase not configured yet — don't get stuck on a spinner.
        console.error("Auth state error", error);
        setUser(null);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  // Live-subscribe to the profile document while signed in.
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) setProfile(profileFromDoc(snap));
    });
    return unsubscribe;
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, profile, loading, signInWithGoogle, signOut }),
    [user, profile, loading, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
