# Deployment

> **TL;DR** Honest status: there is no deployment. No CI/CD pipeline, no hosting target —
> the app runs locally via `just start`. `just build` produces a static, PWA-enabled
> `dist/` that any static host could serve, but shipping it for real needs a shared
> Firebase project config first.

## Current state

| Aspect | Status |
| --- | --- |
| CI/CD | None — no workflow files, no pipeline |
| Hosting | None — local `just start` (dev) / `just preview` (built bundle) on :8115 |
| Backend | Firebase (per-dev project; committed config is empty) |
| Secrets | None committed; `.mcp.json` (Claude tooling) is git-ignored |

## What a build produces

`just build` → `vite build` → `dist/`:

- Hashed JS chunks: one per lazy-loaded view + a main vendor chunk (~965 kB minified — the
  Firebase SDK dominates; a >500 kB warning is expected).
- `manifest.webmanifest` + `sw.js`/workbox runtime — the installable-PWA layer, precaching
  all built assets (`generateSW` mode, autoUpdate).
- `index.html` loading Roboto + Font Awesome from CDNs (external at runtime).

Verify a build locally with `just preview` → `http://localhost:8115`.

## If this ever deploys

1. Decide the shared Firebase project; fill its web config in
   `src/includes/firebase.js` (or refactor to `import.meta.env` variables first — cleaner).
2. Lock down Firestore/Storage security rules in that project (the client assumes
   auth-gated writes).
3. Any static host works (SPA + service worker): Firebase Hosting is the natural fit.
   Configure a history-mode fallback (rewrite all paths to `/index.html`).
4. Add a CI step for `just lint` + `just test` + `just build` — nothing exists today.

## Related docs

| Doc | Why |
| --- | --- |
| [`../02-setup/getting-started.md`](../02-setup/getting-started.md) | The Firebase config the build depends on |
| [`../05-reference/commands.md`](../05-reference/commands.md) | `build` / `preview` recipes |
| [`../01-overview/architecture.md`](../01-overview/architecture.md) | PWA and chunking background |
