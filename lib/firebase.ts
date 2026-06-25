import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  connectAuthEmulator,
  type Auth,
} from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";
import {
  getStorage,
  connectStorageEmulator,
  type FirebaseStorage,
} from "firebase/storage";

// Real values come from NEXT_PUBLIC_FIREBASE_* env vars. The non-empty
// fallbacks let the app build and render before credentials are configured
// (e.g. first `next build`); Firebase only throws on actual network calls,
// not at init, so the UI still loads. Set real values in .env.local to use it.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "missing-api-key",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "missing.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "missing",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "missing.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "0000000000",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:0:web:missing",
};

const useEmulator =
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

const isBrowser = typeof window !== "undefined";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * Firestore is initialized with a persistent IndexedDB cache in the browser so
 * the app works offline (cached reads + queued writes). On the server we fall
 * back to the in-memory client. `initializeFirestore` throws if called twice
 * (e.g. on HMR), so we guard with a try/catch.
 */
function createFirestore(): Firestore {
  if (!isBrowser) return getFirestore(app);
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    return getFirestore(app);
  }
}

export const auth: Auth = getAuth(app);
export const db: Firestore = createFirestore();
export const storage: FirebaseStorage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Connect to the Local Emulator Suite when explicitly enabled.
declare global {
  var __CP_EMULATORS_CONNECTED__: boolean | undefined;
}

if (isBrowser && useEmulator && !globalThis.__CP_EMULATORS_CONNECTED__) {
  globalThis.__CP_EMULATORS_CONNECTED__ = true;
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectStorageEmulator(storage, "127.0.0.1", 9199);
}

export { app };
