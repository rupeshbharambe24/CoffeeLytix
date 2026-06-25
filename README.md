# ☕ Coffeelytix

A mobile-first, installable (PWA) coffee-tracking app. Log every cup, rate what you
taste, build your tasting profile, browse analytics, manage your beans / cafés /
equipment, and compare tastes with a friend.

Built with **Next.js 16 (App Router) + TypeScript**, **Tailwind CSS + shadcn/ui**,
**Firebase** (Auth + Firestore + Storage), **Recharts**, and **Serwist** (PWA).

---

## Features (v1 + light v2)

- 🔐 Google sign-in (Firebase Auth)
- 📓 Coffee entry CRUD — photo, brew type, 1–10 slider ratings (aroma, flavor,
  aftertaste, acidity, body), overall score, milk toggle, flavor tags, notes
- 📊 Dashboard with stats, charts (brew breakdown, black-vs-milk, rating trend) and
  stats-based insights
- 🫘 Beans, ☕ Cafés and 🛠️ Equipment inventories, each linked to your entries
- 🔎 Search & filter your entries
- 👥 Compare with a friend via a share code
- 🌗 Light / dark theme, accessible UI, installable + offline (PWA)

---

## Prerequisites

- **Node.js 20+** (developed on Node 23)
- A **Firebase project** (free Spark plan is fine to start)
- Optionally the **Firebase CLI** (`npm i -g firebase-tools`) to deploy rules / run emulators

---

## 1. Firebase setup

In the [Firebase Console](https://console.firebase.google.com/):

1. **Open your project** (you've already created it).
2. **Authentication** → *Get started* → **Sign-in method** → enable **Google**
   (set a support email). Under **Settings → Authorized domains**, `localhost` is
   present by default; add your Vercel domain after deploying.
3. **Firestore Database** → *Create database* → **Production mode** → choose a region
   (e.g. `asia-south1` for Bangalore).
4. **Register a Web App**: Project settings (⚙️) → *General* → *Your apps* →
   **Add app → Web (`</>`)**. Copy the `firebaseConfig` values — you'll need:
   - `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`

> **No Cloud Storage / Blaze plan needed.** Photos are resized + compressed in the
> browser and stored inline in Firestore, so the whole app runs on the free
> **Spark** plan — only Auth and Firestore are required.

### What I need from you
The **Web App config values** above (paste them into `.env.local`, see next step),
and two services **enabled**: Google **Auth** and **Firestore**.

---

## 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your Firebase Web App config:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abc123
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
```

> These are `NEXT_PUBLIC_*` because the Firebase Web SDK runs in the browser. They
> are not secrets — access is controlled by the Security Rules in this repo.

---

## 3. Deploy the Security Rules

This repo ships `firestore.rules` and `firestore.indexes.json`. Deploy them so
per-user access (and opt-in sharing) is enforced (`.firebaserc` already targets
your project, so no `firebase use --add` is needed):

```bash
firebase login
firebase deploy --only firestore:rules,firestore:indexes
```

(You can also paste the rules into the Console's Rules tab.)

---

## 4. Run locally

```bash
npm install
npm run dev          # http://localhost:3000  (webpack — required by the PWA plugin)
```

Sign in with Google and start logging coffees.

### Optional: Firebase Local Emulator Suite
Run the app fully locally without touching production data:

```bash
firebase emulators:start
# in another terminal, set NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true in .env.local, then:
npm run dev
```

---

## 5. Deploy to Vercel

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com), **Import** the repo (framework auto-detected as Next.js).
3. Add the same `NEXT_PUBLIC_FIREBASE_*` values under **Project Settings → Environment
   Variables** (Production + Preview).
4. Deploy. Then add your Vercel domain to Firebase **Auth → Authorized domains**.

> The build is pinned to webpack (`next build --webpack`) because the Serwist PWA
> plugin doesn't support Turbopack yet.

---

## Scripts

| Command             | Description                         |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Start the dev server (webpack)      |
| `npm run build`     | Production build (generates the SW) |
| `npm run start`     | Serve the production build          |
| `npm run lint`      | ESLint                              |
| `npm run typecheck` | TypeScript check                    |
| `npm run test`      | Run unit tests (Vitest)             |
| `npm run format`    | Prettier                            |

---

## Project structure

```
app/                      # App Router routes
  page.tsx                # public landing
  (app)/                  # auth-guarded app (dashboard, entries, beans, cafes, …)
  sw.ts                   # Serwist service worker source
components/               # UI: cards, forms, charts, navbar, primitives (ui/)
lib/                      # firebase, auth-context, db, hooks, schemas, chart-helpers, share
firestore.rules           # per-user access + opt-in sharing
firebase.json             # rules + emulator config
docs/superpowers/specs/   # design specification
```

## Notes

- **Photos (free, no Cloud Storage):** Uploaded photos are resized and JPEG-compressed
  in the browser and stored inline in the Firestore document (kept under Firestore's
  ~1 MB doc limit). This avoids the Blaze-only Cloud Storage entirely, so everything
  stays on the free Spark plan.
- **Sharing & privacy:** Compare works via an opt-in share code. While sharing is on,
  anyone with your code can read your entries (read-only). Turning it off revokes access.
- **Offline:** Firestore caches data in IndexedDB and Serwist precaches the app shell,
  so it keeps working offline and syncs when you reconnect.
- **Roadmap:** v2/v3 AI features (menu scanning, auto-tagging, chatbot, recommendations)
  are intentionally out of scope for this build — the architecture is modular to add them later.
