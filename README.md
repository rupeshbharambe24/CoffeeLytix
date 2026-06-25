<div align="center">

<img src="public/icons/icon.svg" width="92" height="92" alt="Coffeelytix logo" />

# ☕ Coffeelytix

**Your personal passport for coffee** — log every cup, rate what you taste, build your palate profile, and discover what you truly love.

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-coffeelytix.vercel.app-6F4E37?style=for-the-badge&logo=vercel&logoColor=white)](https://coffeelytix.vercel.app)

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React_19-149ECA?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

</div>

---

Coffeelytix is a mobile-first, **installable (PWA)** coffee journal. Score every cup across aroma, flavor, acidity, body and more; watch charts and insights reveal your patterns; keep inventories of your beans, cafés and gear; and compare your palate with a friend — all on a free, serverless stack.

> 🟢 **Live:** [coffeelytix.vercel.app](https://coffeelytix.vercel.app) · Sign in with Google and log your first coffee.

## ✨ Features

- ☕ **Rich entry logging** — photo, brew type, 1–10 sliders (aroma · flavor · aftertaste · acidity · body), overall score, milk toggle, flavor-tag chips and notes
- 📊 **Dashboard & insights** — brew breakdown, black-vs-milk, rating-over-time charts plus stats-based insights about your taste
- 🫘 **Inventories** — Beans, Cafés and Equipment, each linked to your entries with running averages
- 🔎 **Search & filter** your whole journal by name, café, tags or rating
- 👥 **Compare with a friend** via a private, opt-in share code
- 🌗 **Light / dark theme**, fully accessible, **installable & offline-ready**
- 🆓 **100% free tier** — photos are compressed in-browser and stored inline in Firestore, so no paid Cloud Storage is needed

## 🛠️ Tech Stack

| Layer        | Technology                                              |
| ------------ | ------------------------------------------------------- |
| **Framework**| Next.js 16 (App Router) · React 19 · TypeScript (strict)|
| **UI**       | Tailwind CSS v4 · shadcn/ui (Base UI) · Recharts · lucide |
| **Forms**    | React Hook Form · Zod                                   |
| **Backend**  | Firebase Authentication · Cloud Firestore               |
| **PWA**      | Serwist service worker · offline Firestore persistence  |
| **Tooling**  | Vitest · ESLint · Prettier                              |
| **Hosting**  | Vercel                                                  |

## 🚀 Getting Started

<details>
<summary><b>1 · Set up Firebase (free Spark plan — only Auth + Firestore)</b></summary>

<br>

In the [Firebase Console](https://console.firebase.google.com/):

1. **Authentication** → enable **Google** sign-in (set a support email).
2. **Firestore Database** → create in **Production mode** (pick a nearby region, e.g. `asia-south1`).
3. **Register a Web App** (Project settings → Your apps → Web `</>`) and copy the config values.

> No Cloud Storage / Blaze plan needed — photos are resized + compressed in the browser and stored inline in Firestore.

</details>

<details>
<summary><b>2 · Configure environment</b></summary>

<br>

```bash
cp .env.example .env.local
```

Fill in your Firebase Web App config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...        # optional (Analytics)
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
```

These are `NEXT_PUBLIC_*` (they run in the browser) — not secrets. Access is governed by the Security Rules in this repo.

</details>

<details>
<summary><b>3 · Deploy the security rules</b></summary>

<br>

```bash
npm i -g firebase-tools
firebase login
firebase deploy --only firestore:rules,firestore:indexes
```

`.firebaserc` already targets the project, so no `firebase use --add` needed.

</details>

<details>
<summary><b>4 · Run it</b></summary>

<br>

```bash
npm install
npm run dev      # → http://localhost:3000
```

> Dev & build are pinned to **webpack** (`--webpack`) because the Serwist PWA plugin doesn't support Turbopack yet.

</details>

## ☁️ Deploy to Vercel

1. Push to GitHub and **Import** the repo at [vercel.com/new](https://vercel.com/new) (framework auto-detected as Next.js).
2. Add the same `NEXT_PUBLIC_FIREBASE_*` env vars in **Project Settings → Environment Variables**.
3. Deploy, then add your Vercel domain to Firebase **Auth → Settings → Authorized domains**.

Every push to `main` then auto-deploys. 🚀

## 🗂️ Project Structure

<details>
<summary>Expand</summary>

<br>

```
app/                  # App Router routes
  page.tsx            # public landing
  (app)/              # auth-guarded app (dashboard, entries, beans, cafes, …)
  sw.ts               # Serwist service worker source
components/           # cards, forms, charts, navbar, UI primitives (ui/)
lib/                  # firebase, auth-context, db, hooks, schemas, chart-helpers, image, share
firestore.rules       # per-user access + opt-in sharing
firebase.json         # rules + emulator config
docs/                 # product spec + executive summary
```

</details>

## 📜 Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Dev server (webpack)                 |
| `npm run build`     | Production build (generates the SW)  |
| `npm run start`     | Serve the production build           |
| `npm run lint`      | ESLint                               |
| `npm run typecheck` | TypeScript check                     |
| `npm run test`      | Unit tests (Vitest)                  |

## 🗺️ Roadmap

- ✅ **v1 + light v2** — logging, dashboard, inventories, compare, PWA *(shipped)*
- 🔜 **v2** — café menu scanning (OCR), trend analytics
- 🌟 **v3** — AI auto-tagging, a "personal barista" chatbot, and recommendations

---

<div align="center">

Built with ☕ and a lot of caffeine.

</div>
