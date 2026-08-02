# Deployment

> **TL;DR** A live build is hosted on Vercel at <https://music-plum-chi.vercel.app>.
> There is no CI/CD in this repo. `just build` produces a static, PWA-enabled `dist/`
> that any static host can serve; the Firebase config is injected via `VITE_FIREBASE_*`
> env vars at build time, so a real deployment needs those set in the host's env.

## Current state

| Aspect | Status |
| --- | --- |
| CI/CD | None in this repo — no workflow files, no pipeline |
| Hosting | Vercel — <https://music-plum-chi.vercel.app>; local `just start` (dev) / `just preview` (built bundle) on :8115 |
| Backend | Firebase (per-dev project via `.env`; deployed builds need `VITE_FIREBASE_*` set in the host's env or they show the setup banner) |
| Secrets | None committed; `.env` and `.mcp.json` (Claude tooling) are git-ignored |

## What a build produces

`just build` → `vite build` → `dist/`:

- Hashed JS chunks: one per lazy-loaded view + a main vendor chunk (~965 kB minified — the
  Firebase SDK dominates; a >500 kB warning is expected).
- `manifest.webmanifest` + `sw.js`/workbox runtime — the installable-PWA layer, precaching
  all built assets (`generateSW` mode, autoUpdate).
- `index.html` loading Roboto + Font Awesome from CDNs (external at runtime).

Verify a build locally with `just preview` → `http://localhost:8115`.

## Hardening a real deployment

1. The config is already env-driven (`src/includes/firebase-config.js` reads
   `VITE_FIREBASE_*` — see `.env.example`). Set those variables in the host's project
   settings (e.g. Vercel → Settings → Environment Variables) and rebuild; without them
   the deployed site shows the "Firebase not configured" banner.
2. Lock down Firestore/Storage security rules in that project (the client assumes
   auth-gated writes).
3. Any static host works (SPA + service worker) — configure a history-mode fallback
   (rewrite all paths to `/index.html`).
4. Add a CI step for `just lint` + `just test` + `just build` — nothing exists today.

## Related docs

| Doc | Why |
| --- | --- |
| [`../02-setup/getting-started.md`](../02-setup/getting-started.md) | The Firebase config the build depends on |
| [`../05-reference/commands.md`](../05-reference/commands.md) | `build` / `preview` recipes |
| [`../01-overview/architecture.md`](../01-overview/architecture.md) | PWA and chunking background |
