# TL;DR — every doc in 30 seconds

One paragraph per document. Read this page top to bottom and you know where everything is.

## [01-overview/project-overview.md](01-overview/project-overview.md)

Music App is a Vue 3 + Vite music-streaming SPA and installable PWA backed entirely by
Firebase (Auth + Firestore + Storage): browse a paginated playlist with infinite scroll,
register/log in via a modal, upload audio files with drag-drop progress bars, edit/delete
your songs on an auth-guarded manage page, play anything through a persistent Howler.js
player bar, and comment on songs (with vue-i18n `ms`/`en` localization). The Firebase
config comes from `VITE_FIREBASE_*` env vars (`.env`, copied from `.env.example`); with
none set the app shows a "Firebase not configured" setup banner. Runs locally on port
8115; live demo at https://music-plum-chi.vercel.app.

## [01-overview/architecture.md](01-overview/architecture.md)

`main.js` creates the app only after Firebase Auth's first `onAuthStateChanged`; with no
Firebase config it renders the setup banner instead. `App.vue` hosts header, router-view, player bar,
and auth modal; four lazy routes (`/`, `/about`, `/manage` auth-guarded, `/song/:id`).
Pinia stores: `user` (auth), `player` (owns the Howler `Howl` + a rAF progress loop),
`modal`. All Firebase access goes through the single export bundle in
`src/includes/firebase.js`; Firestore holds `songs`, `comments`, and `users`, paginated by
cursor on Home.

## [02-setup/getting-started.md](02-setup/getting-started.md)

Run `pwsh ./setup.ps1` once (installs Git, Node LTS, just, uv, Claude Code, gh —
idempotent), reopen PowerShell, then `just install` (npm ci — also downloads the Cypress
binary) and `just start`. The app is at `http://localhost:8115` (use `localhost`, not
`127.0.0.1`). Expect the "Firebase not configured" banner until you copy `.env.example`
to `.env` and fill the `VITE_FIREBASE_*` values. VSCode + Volar is the recommended IDE.

## [03-development/workflow.md](03-development/workflow.md)

Branch off `main`, edit with `just start` running (HMR), verify in the browser, then
`just lint` + `just format` + `just test` before committing — no hooks or CI catch you.
`just test` forces vitest into single-run mode; all 9 spec files pass without Firebase
keys (specs stub the firebase bundle). Cypress e2e exists but runs via npm scripts against
:4173, not a just recipe. Conventional Commits, no attribution footers, PRs into `main`.

## [04-deployment/deployment.md](04-deployment/deployment.md)

Honest status: there is no deployment. No CI/CD, no hosting — local only. `just build`
emits a static PWA `dist/` (hashed chunks, service worker, ~965 kB Firebase-dominated main
chunk) verifiable with `just preview`. Shipping for real would need a shared Firebase
project (ideally via env vars), hardened security rules, a static host with SPA fallback,
and a CI gate — none exist today.

## [05-reference/commands.md](05-reference/commands.md)

The full `just` recipe table (install/start/dev/stop/build/preview/lint/format/test/
claudex) and the npm scripts underneath, with the gotchas: `start` is :8115 `--strictPort`,
`stop` kills only this repo's node processes, `lint`/`format` WRITE files, `test:unit` is
`vitest --ui` (never exits — `just test` appends `--run`), and `test:e2e` needs a build +
Firebase config.

## [05-reference/project-layout.md](05-reference/project-layout.md)

Annotated tree: root configs (vite/vitest/cypress/eslint), `src/` (views own pages, stores
own cross-page state, `includes/` owns app-wide wiring like the firebase bundle and i18n),
`cypress/` e2e, `template/` original HTML mockups, tracked-but-generated `dev-dist/` and
`stats.html`, and the kit meta (`justfile`, `setup.ps1`, `.docs/`, `.claude/`).

## [06-troubleshooting/common-issues.md](06-troubleshooting/common-issues.md)

Real symptoms with fixes: `127.0.0.1` refuses (IPv6 loopback — use `localhost`), the
"Firebase not configured" banner (missing `.env`), `--strictPort` exit when 8115 is
taken, `npm run test:unit` never exiting, slow first
`npm ci` (Cypress binary), `dev-dist/` churn in `git status`, PATH not updating until a new
shell, and the harmless >500 kB chunk warning.

## [07-faq/faq.md](07-faq/faq.md)

Quick answers: why port 8115, the setup banner, whether the Firebase config is a
secret, why Cypress isn't a just recipe, why the app opens in Malay,
what `dev-dist/`/`stats.html`/`template/` are, the unused `counter` store, the
`.mcp.json.stub` pattern, and why `uv`/Python exist in a Vue repo.
