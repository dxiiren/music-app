# Architecture

> **TL;DR** `main.js` mounts the app only after Firebase Auth resolves its first
> `onAuthStateChanged` event. Four lazy-loaded routes hang off `App.vue`, which also hosts
> the persistent header, player bar, and auth modal. Three Pinia stores carry cross-page
> state (`user`, `player`, `modal`); all Firebase access flows through the single export
> bundle in `src/includes/firebase.js`.

## Boot sequence

1. `src/main.js` imports CSS, registers the PWA service worker (`registerSW`), and wires
   NProgress to router navigation (`src/includes/progress-bar.js`).
2. It then checks `firebase.isConfigured` (driven by the `VITE_FIREBASE_*` env vars via
   `src/includes/firebase-config.js`). Unconfigured: it renders a static demo shell —
   header, hero, sample playlist — plus a dismissible "Firebase not configured" notice
   (`src/includes/not-configured.js`) instead of mounting. Configured:
   it calls `firebase.onAuthStateChanged(firebase.auth, ...)` and only inside that
   callback creates the Vue app — so the router guard sees the correct auth state on a
   hard refresh.
3. Plugins installed on the app: Pinia, Router, vue-i18n, the VeeValidate plugin
   (`src/includes/validation.js`), a Base-component auto-registrar
   (`src/includes/_global.js`, globs `src/components/Base/*.vue`), and the `v-icon`
   Font Awesome directive (`src/directives/icon.js`).

## Component tree

```
App.vue
├── AppHeader.vue          # nav, login/logout link, locale toggle (ms ⇄ en)
├── <router-view>          # transition-wrapped, lazy-loaded views
│   ├── HomeView.vue       # playlist: paginated Firestore query + infinite scroll
│   │   └── SongItem.vue   # one row: link to /song/:id, comment count
│   ├── AboutView.vue      # static page
│   ├── ManageView.vue     # requiresAuth; upload + own-songs list
│   │   ├── Upload.vue     # drag-drop -> Storage uploadBytesResumable + progress bars
│   │   └── CompositionItem.vue  # inline edit/delete of one song
│   └── SongView.vue       # play button, price (i18n currency), comment form + list
├── AppPlayer.vue          # fixed bottom bar: play/pause, seek bar, timers
└── AppAuth.vue            # modal with tabbed LoginForm / RegisterForm
```

## State (Pinia stores)

| Store | File | Holds | Notes |
| --- | --- | --- | --- |
| `user` | `src/stores/user.js` | `userLoggedIn` | actions `login`/`register`/`logout` call Firebase Auth; register also writes `users/{uid}` |
| `player` | `src/stores/player.js` | `currentSong`, `sound` (Howl), formatted `seek`/`duration`, `playerProgress` | `newSong()` unloads the previous Howl; a `requestAnimationFrame` loop updates progress while playing; `updateSeek()` maps a click on the bar to `sound.seek()`. `sound` starts as a bare `{}`, so `toggleAudio`/`progress`/`updateSeek` bail out until a Howl is loaded, and `progress()` reports `0%` rather than `NaN%` while `duration()` is still 0 |
| `modal` | `src/stores/modal.js` | `isOpen` + `hiddenClass` getter | drives the auth modal |
| `counter` | `src/stores/counter.js` | scaffold demo | unused by the app and by the suite |

## Data model (Firestore)

| Collection | Written by | Key fields |
| --- | --- | --- |
| `songs` | `Upload.vue` after each Storage upload | `uid`, `display_name`, `original_name`, `modified_name`, `genre`, `comment_count`, `url` (download URL) |
| `comments` | `SongView.vue` comment form | `content`, `datePosted`, `sid` (song id), `name`, `uid` |
| `users` | `user` store on register | `uid`, `name`, `email` (+ profile fields) |

Pagination on Home uses a cursor: `orderBy('modified_name')` + `startAfter(lastDoc)` +
`limit(perPage)`; the view keeps `lastDoc`, `noMoreSongs`, and a `pendingRequest` flag so
scroll events can't double-fetch. `pendingRequest` is released in a `finally`, so a failed
page logs and lets the next scroll retry instead of latching infinite scroll off for good.

`Upload.vue` refuses anything that is not `audio/mpeg` / `audio/wav`, and when
`navigator.onLine` is false it records a red failed row locally instead of calling Storage.

## Routing

`src/router/index.js` — history mode, 4 routes + catch-all redirect to home. `/manage`
carries `meta: { requiresAuth: true }`; a global `beforeEach` bounces logged-out users to
home. The mirror image lives in `AppHeader.signOut()`: logging out while the current route
carries `requiresAuth` pushes the user home, so nobody is left on a view the guard would
now reject. Active links get `text-yellow-500`. All views are lazy `import()`s, so each becomes
its own chunk in the build.

## i18n

`src/includes/i18n.js`: default locale **`ms`** with `en` fallback (`src/locales/*.json`).
The header link toggles locale at runtime. Number formats define `currency` per locale
(USD for `en`, MYR for `ms`) — used by the song page's `$n(1, "currency")` price demo.

## Key design choices

- **One Firebase bundle** — components never import `firebase/*` directly; they import the
  default export of `src/includes/firebase.js`, which exposes services and SDK functions.
  Keep it that way (see `/pre-pr-review`).
- **Mount gated on auth** — avoids a logged-in flash and lets route guards trust the store.
- **Howler over `<audio>`** — html5 streaming mode for large files; the store is the single
  owner of the active `Howl` instance.
- **PWA in dev** — `devOptions.enabled: true` registers the service worker during `just
  dev/start` and regenerates the git-ignored `dev-dist/` folder on every run.

## Related docs

| Doc | Why |
| --- | --- |
| [`project-overview.md`](project-overview.md) | Feature-level view of the same app |
| [`../03-development/workflow.md`](../03-development/workflow.md) | How to change this code safely |
| [`../05-reference/project-layout.md`](../05-reference/project-layout.md) | Every file, annotated |
