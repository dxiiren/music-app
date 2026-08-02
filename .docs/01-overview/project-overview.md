# Project Overview

> **TL;DR** Music App is a Vue 3 + Vite music-streaming SPA (installable PWA) backed entirely
> by Firebase: browse a paginated public playlist, register/log in, upload your own audio
> files, edit/delete them on a manage page, play any song through a persistent Howler.js
> player bar, and comment on songs. The Firebase config is injected via `VITE_FIREBASE_*`
> env vars (`.env`, copied from `.env.example`); without them the app renders a
> "Firebase not configured" setup banner instead of mounting.

## What it is

A classic "music streaming" course-style app rebuilt around Firebase v11. Everything is
client-side; Firebase Auth, Firestore, and Storage are the backend.

| Feature | Where | How it works |
| --- | --- | --- |
| Song playlist | `src/views/HomeView.vue` + `src/components/SongItem.vue` | Firestore query ordered by name, paginated 7 at a time (`orderBy` + `startAfter(lastDoc)` + `limit`); infinite scroll loads the next page near the bottom. |
| Auth (register/login) | `src/components/AppAuth.vue` + `Auth/LoginForm.vue`, `Auth/RegisterForm.vue`, `src/stores/user.js` | Modal (Pinia `modal` store) with VeeValidate forms; register also writes a `users/{uid}` Firestore doc. |
| Upload | `src/components/Upload.vue` (on `/manage`) | Drag-drop or file picker, multiple files, `uploadBytesResumable` to Storage with live progress bars; upload tasks cancel on unmount; song metadata written to Firestore. |
| Manage songs | `src/views/ManageView.vue` + `CompositionItem.vue` | Auth-guarded route; edit modified name/genre or delete a song (Firestore doc + Storage file); warns before leaving with unsaved forms. |
| Player | `src/components/AppPlayer.vue` + `src/stores/player.js` | Persistent bottom bar; Pinia store wraps a Howler `Howl` (html5 mode), `requestAnimationFrame` loop drives seek/duration display; click-to-seek on the progress bar. |
| Song page + comments | `src/views/SongView.vue` | Play button, i18n comment count and localized currency, VeeValidate comment form (logged-in only), latest/oldest sort. |
| i18n | `src/includes/i18n.js`, `src/locales/` | vue-i18n with `ms` (default) and `en` fallback; header toggles locale; currency formats USD/MYR. |
| PWA | `vite.config.js` (`vite-plugin-pwa`) | autoUpdate service worker, manifest "Music App"; dev-mode SW enabled (`devOptions`) writes `dev-dist/`. |

## What it talks to

Firebase only — wired once in `src/includes/firebase.js`, which exports one bundle object
(app, auth, db, storage, analytics + the SDK functions the app uses):

| Service | Used for |
| --- | --- |
| Firebase Auth | email/password register, login, logout; app mount waits for `onAuthStateChanged` |
| Firestore (persistent local cache) | `songs` and `comments` collections, `users/{uid}` profile docs |
| Firebase Storage | the uploaded audio files (`uploadBytesResumable`, download URLs, delete) |
| Firebase Analytics | initialized alongside the app |

**The config comes from `VITE_FIREBASE_*` env vars** (`src/includes/firebase-config.js`),
with an empty-object fallback. With no `.env` the services stay uninitialized and
`src/main.js` renders the "Firebase not configured" banner (`src/includes/not-configured.js`)
instead of mounting. Fill `.env` (copy `.env.example`) to work on any Firebase-backed
feature; see [`../02-setup/getting-started.md`](../02-setup/getting-started.md).

## What it is NOT

- Not a full-stack repo — no server code of its own; Firebase is the backend.
- Not CI/CD-gated — a live build is hosted at https://music-plum-chi.vercel.app, but local
  dev runs on `http://localhost:8115` via `just start` with no pipeline in this repo.
- Unit-tested only — 9 Vitest spec files in `src/components/__tests__/`, all green with no
  Firebase keys needed; Cypress e2e is scaffolded with 2 specs against the preview server
  on `:4173` (not wired as a just recipe).
- Not payment-enabled — the "price" on the song page is an i18n currency-formatting demo.

## Tech stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Vue 3.5, mostly Options API | plain JavaScript — no TypeScript |
| Build | Vite 6 | plugins: vue, PWA, vue-devtools, Tailwind v4 (visualizer commented out) |
| Styling | Tailwind CSS v4 | via `@tailwindcss/vite`; no tailwind.config file |
| Backend | Firebase 11 | Auth + Firestore (persistent cache) + Storage + Analytics |
| Audio | Howler 2 | wrapped by the `player` Pinia store |
| Forms | VeeValidate 4 + `@vee-validate/rules` | global plugin in `src/includes/validation.js` |
| State | Pinia 3 | `user`, `player`, `modal` (+ unused `counter` scaffold) |
| i18n | vue-i18n 9 | `ms` default, `en` fallback, currency number formats |
| Tests | Vitest 3 + jsdom, Cypress 14 | unit specs in `src/components/__tests__/`, e2e in `cypress/e2e/` |
| Quality | ESLint 9 (flat) + Prettier 3 | no hooks, no CI — run manually |

## Related docs

| Doc | Why |
| --- | --- |
| [`architecture.md`](architecture.md) | Boot gating, stores, and data flow in detail |
| [`../02-setup/getting-started.md`](../02-setup/getting-started.md) | Get it running locally |
| [`../07-faq/faq.md`](../07-faq/faq.md) | Quick answers about Firebase, ports, tests |
