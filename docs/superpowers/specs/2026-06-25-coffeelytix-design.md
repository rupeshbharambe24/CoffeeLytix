# Coffeelytix — Design Specification

**Date:** 2026-06-25
**Status:** Approved (proceed to implementation)
**Source:** `executive-summary.md` (full PRD/SRS)

## 1. Summary & Scope

Coffeelytix is a mobile-first, installable (PWA) coffee-tracking web app. Users log
and rate every coffee they try, build tasting profiles, browse analytics, manage
bean/equipment/café inventories, and compare tastes with a friend.

**Build scope (this cycle): v1 MVP + light v2.**

Included:
- Google authentication (Firebase Auth)
- Dashboard with summary stats, charts, and stats-based insights
- Coffee entry CRUD (create/edit/delete) with photo upload and slider ratings
- Entry list + detail with search/filter
- Beans, Equipment, and Cafés inventories (CRUD), each linked to entries
- Compare-with-friend page (share-code mechanism)
- Settings/profile, dark mode, sign out
- PWA (installable, offline support) + responsive, accessible UI

Explicitly excluded (future v2/v3): menu OCR scanning, LLM auto-tagging, chatbot,
recommendations, vector search, latte-art recognition. Architecture stays modular so
these can be added later.

## 2. Tech Stack

- **Next.js 15 (App Router) + TypeScript (strict)**
- **Tailwind CSS + shadcn/ui** (lucide-react icons), custom warm coffee theme (light/dark via `next-themes`)
- **Firebase Web SDK** — Auth (Google), Cloud Firestore, Cloud Storage — used client-side
- **Recharts** for charts
- **React Hook Form + Zod** for forms & validation
- **sonner** for toast feedback
- **Serwist (`@serwist/next`)** for PWA service worker + web manifest
- **Firestore IndexedDB offline persistence**
- **Vitest + React Testing Library** for tests; **ESLint + Prettier** for quality

## 3. Architecture Decisions

### Decision 1 — Data access: client-side Firebase SDK + Security Rules (chosen)
Read/write Firestore directly from React via a thin custom hooks layer (`onSnapshot` for
live data, `getDocs`/`getDoc` for one-offs). Per-user access enforced by Security Rules.
Fastest path, gives real-time + offline for free, no service account. No API routes needed
for CRUD in this scope.

### Decision 2 — Compare-with-friend: share code (chosen)
Each user can enable sharing in Settings, generating a short share code. A friend enters
the code on `/compare` to see a side-by-side view. Implemented via a public
`shareCodes/{code} → {uid}` lookup doc plus a Security Rule allowing reads of a user's data
only when their `shareEnabled` flag is `true`. Opt-in, revocable, live, no Cloud Functions.

## 4. Data Model (Firestore)

`/users/{uid}` (document) — profile + preferences:
- `displayName`, `email`, `photoURL`
- `preferences`: `{ defaultView }`
- `shareEnabled` (bool), `shareCode` (string | null)
- `createdAt`, `updatedAt`

Subcollections under each user:
- `entries/{entryId}`: `date` (Timestamp), `coffeeName?`, `cafeId?`, `beanId?`,
  `equipmentIds[]`, `brewType`, `milk` (bool), `milkType?`, `photoURL?`, `photoPath?`,
  `ratings`: `{ aroma, flavor, aftertaste, acidity, body }` (1–10), `overallRating` (1–10),
  `tags[]`, `notes?`, `createdAt`, `updatedAt`
- `beans/{beanId}`: `name`, `brand?`, `roast?`, `origin?`, `photoURL?`, `photoPath?`,
  `tastingNotes?`, `createdAt`, `updatedAt`
- `cafes/{cafeId}`: `name`, `address?`, `photoURL?`, `photoPath?`, `notes?`, `createdAt`, `updatedAt`
- `equipment/{equipId}`: `name`, `type?`, `photoURL?`, `photoPath?`, `notes?`, `rating?`,
  `createdAt`, `updatedAt`

Top-level:
- `shareCodes/{code}`: `{ uid }` — public-readable lookup for Compare

Storage layout: `userUploads/{uid}/{entries|beans|cafes|equipment}/{filename}`

Committed config: `firestore.rules`, `firestore.indexes.json`, `storage.rules`.

### Security Rules (intent)
- A user may read/write only their own `/users/{uid}/**` data.
- Another authenticated user may **read** a user's `entries/beans/cafes/equipment` only when
  that user's `shareEnabled == true`.
- `shareCodes/{code}` readable by any authenticated user; writable only by the owning user.
- Storage: files under `userUploads/{uid}/**` readable/writable by owner; readable by others
  when owner `shareEnabled == true`.

## 5. Pages & Routing (App Router)

Public:
- `/` — landing (hero, feature bullets, "Sign in with Google"); redirects to `/dashboard` if authed

`(app)` route group — auth-guarded, shared layout with `Navbar` (top bar on desktop, bottom tab bar on mobile):
- `/dashboard` — greeting, stats cards, charts, insights, recent entries
- `/entries` — list/gallery, search + filter (keyword, café, rating, date range)
- `/entries/new` — add entry form
- `/entries/[id]` — entry detail (read-only), edit/delete actions
- `/entries/[id]/edit` — edit entry form (reuses EntryForm)
- `/beans`, `/beans/[id]` — beans inventory + detail (entries using this bean)
- `/cafes`, `/cafes/[id]` — cafés inventory + detail (entries at this café, avg rating)
- `/equipment` — equipment inventory
- `/compare` — enter friend's share code, side-by-side comparison
- `/settings` — profile, theme toggle, sharing toggle + code, sign out

Auth guard: client-side `AuthProvider` + a guard in the `(app)` layout that redirects
unauthenticated users to `/`.

## 6. Directory Layout

```
/app
  layout.tsx                 # root: providers (Auth, Theme), fonts, Toaster
  page.tsx                   # landing
  (app)/layout.tsx           # auth guard + Navbar
  (app)/dashboard/page.tsx
  (app)/entries/...          # list, new, [id], [id]/edit
  (app)/beans/...            # list, [id]
  (app)/cafes/...            # list, [id]
  (app)/equipment/page.tsx
  (app)/compare/page.tsx
  (app)/settings/page.tsx
  ~offline/page.tsx          # PWA offline fallback
/components
  navbar.tsx, theme-toggle.tsx, google-sign-in-button.tsx
  entry-form.tsx + rating-slider.tsx, tag-input.tsx, image-uploader.tsx,
    date-picker.tsx, cafe-select.tsx, bean-select.tsx, brew-type-select.tsx, milk-toggle.tsx
  stats-card.tsx, charts/ (bar, pie/donut, line, radar)
  coffee-card.tsx, bean-card.tsx, cafe-card.tsx, equipment-card.tsx
  rating-display.tsx, tag-list.tsx, confirm-dialog.tsx, empty-state.tsx
  ui/ (shadcn components)
/lib
  firebase.ts                # init app/auth/db/storage, emulator flag
  auth-context.tsx           # AuthProvider, useAuth
  hooks/                     # useEntries, useEntry, useBeans, useCafes, useEquipment, useShare
  storage.ts                 # uploadImage, deleteImage
  schemas.ts                 # zod schemas
  chart-helpers.ts           # aggregations for charts + insights
  types.ts                   # shared TS types
  utils.ts                   # cn(), formatters
/public
  manifest.json, icons/*
firestore.rules, firestore.indexes.json, storage.rules
README.md                    # setup + Firebase + Vercel deploy guide
```

## 7. Key Components

- **EntryForm** — date picker (default today), café autocomplete (+ add new), bean select
  (+ add new), brew-type select, photo upload with preview, per-attribute RatingSliders
  (aroma/flavor/aftertaste/acidity/body, 1–10), black/milk toggle (+ milk type), tag chips,
  overall rating, notes textarea. Validation: date, brew type, overall rating required.
- **RatingSlider** — `<input type=range>` with visible value + ARIA (`aria-valuemin/max/now`).
- **Charts** — Recharts wrappers: brew-type bar, black-vs-milk donut, rating-over-time line,
  per-entry radar (detail page).
- **Navbar** — responsive; desktop top bar, mobile bottom tab bar; links to all sections + sign out.

## 8. Cross-Cutting

- **Theme:** warm coffee palette (espresso browns, cream, gold accents); light + dark; WCAG AA
  contrast (≥4.5:1).
- **Accessibility:** semantic HTML, `<label>` per input, ARIA on custom controls, visible focus
  rings, keyboard nav, alt text on images, mobile-friendly hit areas (~44px).
- **Analytics (client-side):** total entries, average overall rating, favorite brew type, cafés
  visited, beans logged; charts as above; insights ("you rate aroma highest on average",
  "your milk coffees average X vs Y for black").
- **PWA:** manifest (name, icons, theme color, start URL), Serwist service worker (precache
  shell + static, runtime cache, offline fallback), Firestore IndexedDB persistence for offline
  reads + queued writes.

## 9. Testing & Verification

- **Vitest + RTL** unit tests for: chart-helpers aggregations, zod schemas/validation, share-code
  utilities, and a few key components (RatingSlider, TagInput).
- **Verification gate:** `tsc --noEmit`, `next lint`, `next build`, and dev-server render must pass.
  Full Firebase e2e verified against the real project config (or emulators) once credentials are wired.

## 10. Deployment

- **Firebase setup** (user actions): create Web App + get config; enable Google Auth; create
  Firestore (Native mode, region `asia-south1`); enable Storage; deploy `firestore.rules`,
  `firestore.indexes.json`, `storage.rules`; add authorized domains (localhost + Vercel domain).
- **Env:** `NEXT_PUBLIC_FIREBASE_*` config in `.env.local` (dev) and Vercel project env vars (prod);
  optional `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` flag for local emulator runs.
- **Vercel:** connect repo, set env vars, deploy. README documents every step.

## 11. Out of Scope / Non-Goals

- No public social feed, no ecommerce, no real-time collaboration beyond opt-in share.
- No external AI/LLM/OCR/vision in this cycle.
