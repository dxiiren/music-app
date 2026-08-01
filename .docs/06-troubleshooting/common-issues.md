# Common Issues

> **TL;DR** The issues actually hit while standing this repo up, each with symptom → cause →
> fix. Headliners: `127.0.0.1` refusing while `localhost` works (IPv6 loopback), the blank
> page from the empty Firebase config, `--strictPort` exits when 8115 is taken, the
> watch-mode vitest script, and the 2 pre-existing spec failures.

### `127.0.0.1:8115` refuses to connect but the server says it's running

**Cause:** on Windows with Node ≥17, Vite binds the IPv6 loopback `[::1]` only.
**Fix:** use `http://localhost:8115`. All docs and recipes in this repo already do.

### Page returns HTTP 200 but renders blank; console shows `FirebaseError: auth/invalid-api-key`

**Cause:** `firebaseConfig` in `src/includes/firebase.js` is an empty `{}`, and `main.js`
only mounts the app inside `onAuthStateChanged` — `getAuth` throws first, so the callback
never runs.
**Fix:** paste a real Firebase web-app config (see
[getting-started §5](../02-setup/getting-started.md)). For infra-only work (kit, docs,
build tooling) the blank page is expected and harmless.

### `just start` window closes immediately / "Port 8115 is already in use"

**Cause:** the dev server runs `--strictPort`, so it exits instead of hopping ports.
**Fix:** `just stop` (kills only this repo's node processes). If something else owns the
port: `netstat -ano | findstr :8115`, then stop that PID.

### `just test` reports "2 failed | 5 passed" test files

**Cause (pre-existing, not your change):**
- `src/components/__tests__/homeview.spec.js` fails at collection — mounting HomeView
  imports the firebase bundle, which throws `auth/invalid-api-key` (empty config) even in
  jsdom.
- `src/components/__tests__/snapshot.spec.js` — the stored snapshot predates a markup
  change (`SongItem.vue` root gained a `song-item` class).

**Fix:** none required for kit/tooling work. To make the suite green: fill a Firebase config
(or mock the firebase module in that spec) and, in a deliberate commit, refresh the snapshot
with `npx vitest run -u`.

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
