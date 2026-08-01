# Music App

A Vue 3 + Vite music-streaming SPA (installable PWA): browse a paginated song playlist,
register/log in, upload your own tracks, edit or delete them on the manage page, play songs
through a persistent Howler.js player bar, and comment on songs. All data lives in Firebase
(Auth + Firestore + Storage). The committed Firebase config is **empty** — the app serves
fine, but the UI only mounts in a browser once you fill a real project config into
`src/includes/firebase.js`.

> **New developer? Start with [`.docs/tldr.md`](.docs/tldr.md)** — every doc summarised on one
> page. The full guide lives in [`.docs/`](.docs/README.md).

## Prerequisites

| Tool | Version | Installed by |
| --- | --- | --- |
| PowerShell + winget | Windows 10/11 stock | — (the only true prerequisites) |
| Git | any recent | `setup.ps1` (winget) |
| Node.js | LTS (verified on v24) | `setup.ps1` (winget) |
| just | any recent | `setup.ps1` |
| Claude Code CLI | latest | `setup.ps1` (optional, for AI-assisted dev) |

## Quick start

```powershell
# 1. One-time machine setup (idempotent — safe to re-run)
pwsh ./setup.ps1

# 2. Close and reopen PowerShell so PATH updates land

# 3. Install dependencies (npm ci from the lockfile; also downloads the Cypress binary)
just install

# 4. Start the dev server
just start
```

The app is now at **http://localhost:8115**. Stop it with `just stop`.
(Use `localhost`, not `127.0.0.1` — Vite binds the IPv6 loopback `[::1]` here.)

## Commands

Run `just` with no arguments to list every recipe. The ones you'll use daily:

| Command | What it does |
| --- | --- |
| `just install` | Install dependencies (`npm ci`) |
| `just start` | Dev server on :8115 in a background window |
| `just dev` | Dev server in the foreground (Ctrl+C to stop) |
| `just stop` | Stop only THIS repo's node processes |
| `just build` | Production build to `dist/` (includes the PWA service worker) |
| `just preview` | Serve the production build on :8115 |
| `just lint` | ESLint with auto-fix (`eslint . --fix`) |
| `just format` | Prettier write on `src/` |
| `just test` | Vitest single run (2 specs fail pre-existing — see Troubleshooting) |
| `just claudex` | Launch Claude Code (Sonnet, all permissions) |

Cypress e2e exists too (`npm run test:e2e`) but is intentionally not a just recipe — it
drives `vite preview` on :4173 and needs a filled Firebase config to get past the blank
mount. See [`.docs/03-development/workflow.md`](.docs/03-development/workflow.md).

## Troubleshooting

### `127.0.0.1:8115` refuses to connect but the server is running

Vite binds the IPv6 loopback (`[::1]`) on this setup — use `http://localhost:8115`, not the
IPv4 literal.

### The page loads but stays blank (console: `auth/invalid-api-key`)

The Firebase config object in `src/includes/firebase.js` is empty (`{}`), and the app only
mounts inside `onAuthStateChanged` — so with no valid config nothing renders. Create a
Firebase project (Auth + Firestore + Storage), paste its web-app config into
`firebaseConfig`, and reload. Expected during infra-only work.

### `just start` window closes immediately / "Port 8115 is already in use"

The dev server runs with `--strictPort`, so it exits instead of hopping ports. Run
`just stop` to kill a lingering server from this repo, or find the squatter with
`netstat -ano | findstr :8115` and stop it.

### `just test` reports 2 failed test files

Pre-existing failures, not your change: `homeview.spec.js` dies importing the empty Firebase
config (`auth/invalid-api-key`), and `snapshot.spec.js` has a stale snapshot (SongItem gained
a `song-item` class after it was recorded). The other 5 spec files pass. Also note the npm
script `test:unit` is `vitest --ui` (watch + browser — never exits); `just test` appends
`--run` for a single pass.

### `just` or `node` not found after running setup.ps1

PATH changes land in new shells only. Close and reopen PowerShell, then retry. If it
persists, re-run `pwsh ./setup.ps1` and read its `[FAIL]`/`[WARN]` lines.

More in [`.docs/06-troubleshooting/common-issues.md`](.docs/06-troubleshooting/common-issues.md).

## Project layout

```
music-app/
  index.html               # Vite entry page (Roboto + Font Awesome CDN links)
  vite.config.js           # Vue + PWA + devtools + Tailwind v4 plugins, @ -> src alias
  vitest.config.js         # jsdom test env (merges vite.config.js)
  cypress.config.js        # e2e baseUrl http://localhost:4173 (vite preview)
  eslint.config.js         # ESLint 9 flat config (vue + vitest + cypress + prettier)
  justfile, setup.ps1      # dev recipes + machine bootstrap
  src/
    main.js                # createApp gated inside firebase.onAuthStateChanged
    App.vue                # AppHeader + <router-view> + AppPlayer + AppAuth modal
    router/index.js        # /, /about, /manage (auth-guarded), /song/:id, catch-all
    views/                 # HomeView, AboutView, ManageView, SongView
    components/            # AppHeader, AppAuth + Auth/, AppPlayer, Upload,
                           # SongItem, CompositionItem (+ __tests__/ with 7 specs)
    stores/                # user, player (Howler), modal, counter (unused scaffold)
    includes/              # firebase.js (EMPTY config), validation.js, i18n.js,
                           # helper.js, progress-bar.js, _global.js
    directives/icon.js     # v-icon Font Awesome helper
    locales/               # en.json, ms.json (vue-i18n)
  cypress/                 # e2e specs + support commands
  template/                # original static HTML mockups the views were built from
  public/assets/img/       # header/intro/song images + PWA icon
  dev-dist/                # PWA dev service-worker output (tracked; regenerated in dev)
  .docs/                   # developer documentation (start at tldr.md)
  .claude/                 # Claude Code skills, settings, statusline
```
