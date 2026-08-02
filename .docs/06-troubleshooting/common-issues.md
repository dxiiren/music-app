# Common Issues

> **TL;DR** The issues actually hit while standing this repo up, each with symptom → cause →
> fix. Headliners: `127.0.0.1` refusing while `localhost` works (IPv6 loopback), the
> "Firebase not configured" banner from a missing `.env`, `--strictPort` exits when 8115
> is taken, and the watch-mode vitest script.

### `127.0.0.1:8115` refuses to connect but the server says it's running

**Cause:** on Windows with Node ≥17, Vite binds the IPv6 loopback `[::1]` only.
**Fix:** use `http://localhost:8115`. All docs and recipes in this repo already do.

### Page shows a "Firebase not configured" banner instead of the app

**Cause:** no `VITE_FIREBASE_*` env vars found — `src/includes/firebase-config.js` falls
back to an empty config, so `main.js` renders the setup banner
(`src/includes/not-configured.js`) instead of mounting.
**Fix:** copy `.env.example` to `.env`, fill the values, restart the dev server (see
[getting-started §5](../02-setup/getting-started.md)). For infra-only work (kit, docs,
build tooling) the banner is expected and harmless. If you instead see a truly *blank*
page, check the browser console — that is not the configured behavior.

### `just start` window closes immediately / "Port 8115 is already in use"

**Cause:** the dev server runs `--strictPort`, so it exits instead of hopping ports.
**Fix:** `just stop` (kills only this repo's node processes). If something else owns the
port: `netstat -ano | findstr :8115`, then stop that PID.

### `just test` reports a failing spec

**Cause:** the suite (9 spec files) is green on a clean checkout with no Firebase keys —
`homeview.spec.js` stubs the firebase bundle via `vi.mock('@/includes/firebase')` and the
config spec stubs env vars. A failure is therefore caused by your change.
**Fix:** read the failing assertion. If you intentionally changed `SongItem.vue` markup,
refresh the snapshot with `npx vitest run -u` in the commit that blesses the new markup.

### Running `npm run test:unit` directly never finishes

**Cause:** the script is `vitest --ui` — watch mode plus a browser UI server.
**Fix:** use `just test` (it appends `--run` for a single headless pass), or Ctrl+C the
watcher.

### `npm ci` seems stuck for minutes

**Cause:** the `prepare` script downloads and installs the Cypress binary (~hundreds of MB)
into the user cache on first install.
**Fix:** wait it out once; later installs hit the cache ("Skipping installation").

### `git status` shows modified `dev-dist/` files after running the dev server

**Cause:** `vite-plugin-pwa` has `devOptions.enabled: true`, and the generated dev
service-worker files under `dev-dist/` are tracked in git.
**Fix:** `git restore dev-dist` — never commit that churn unless a service-worker change is
intentional.

### `just` or `node` not found after running setup.ps1

**Cause:** PATH changes land in new shells only.
**Fix:** close and reopen PowerShell; re-run `pwsh ./setup.ps1` and read its
`[FAIL]`/`[WARN]` lines if it persists.

### `just build` warns "Some chunks are larger than 500 kB"

**Cause:** the Firebase SDK lands in the main chunk (~965 kB minified).
**Fix:** cosmetic — build still exits 0. Code-splitting Firebase imports or
`build.rollupOptions.output.manualChunks` would shrink it; not required locally.

## Related docs

| Doc | Why |
| --- | --- |
| [`../02-setup/getting-started.md`](../02-setup/getting-started.md) | The happy path these issues deviate from |
| [`../05-reference/commands.md`](../05-reference/commands.md) | What each command actually runs |
| [`../07-faq/faq.md`](../07-faq/faq.md) | Conceptual questions rather than breakages |
