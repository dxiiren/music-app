# FAQ

> **TL;DR** Quick answers about the port, the env-driven Firebase config, the test suite,
> the Malay default locale, Cypress, `dev-dist/`, `template/`, and the Claude Code tooling.

**Why port 8115?**
Every repo in this workspace gets a unique assigned port so several dev servers can run at
once. `--strictPort` makes collisions loud instead of silent port-hopping. Don't change it.

**Why do I see demo songs and a "Firebase not configured" notice instead of the app?**
No `VITE_FIREBASE_*` env vars were found, so the app renders a static demo shell (real UI,
sample playlist, nothing playable) with a dismissible setup notice instead of
mounting — see [common-issues](../06-troubleshooting/common-issues.md). Copy
`.env.example` to `.env`, fill your own project's web config, and restart the server.

**Is the Firebase web config a secret?**
Not in the credential sense — it ships to every browser in production apps; Firebase
security rules do the protecting. Each dev fills their own `.env` here; the file is
git-ignored, so it can't be committed by accident.

**Do the tests need Firebase keys?**
No. All 15 spec files (90 tests) pass on a clean checkout: specs that touch the SDK stub the
firebase bundle with `vi.mock('@/includes/firebase')`, `firebase-config.spec.js` stubs the env
vars, and the player specs stub Howler. Details in
[common-issues](../06-troubleshooting/common-issues.md).

**Why isn't there a `just` recipe for Cypress?**
The e2e flow targets `vite preview` on :4173, needs a filled `.env`, and isn't
reliable headless on this setup — so it stays an npm-script affair (`npm run test:e2e`,
`npm run test:e2e:dev`) documented in [workflow](../03-development/workflow.md).

**Why does the app open in Malay?**
`src/includes/i18n.js` sets `locale: "ms"` with `en` fallback. The header's locale link
toggles between them; the song page's price demo formats MYR vs USD accordingly.

**What are `dev-dist/` and `stats.html`?**
Generated artifacts: `dev-dist/` is the PWA plugin's dev service-worker output
(git-ignored; regenerated on every dev run), and `stats.html` is an old tracked
rollup-visualizer bundle report (the plugin is commented out in `vite.config.js`).

**What is `template/` for?**
The original static HTML mockups (index/manage/song) the Vue views were transcribed from.
Reference only — nothing imports them.

**Why is there a `counter` store and a `basic.vue` nobody uses?**
Vue scaffold leftovers. `counter.js` is still exercised by `pinia.spec.js`; `basic.vue` is
dead. Safe to ignore; removal is a candidate cleanup commit.

**What's the `.mcp.json.stub` / `.mcp.json` pair?**
Claude Code MCP wiring: the stub is committed with placeholders; `setup.ps1` copies it to
the git-ignored `.mcp.json`, where you fill real values (GitHub PAT). See `CLAUDE.md` and
`/setup-mcp`.

**Do I need `uv`/Python for a Vue app?**
Only for the `.claude` tooling (statusline + skill scripts run via
`uv run --no-project python`). The app itself never touches Python.

## Related docs

| Doc | Why |
| --- | --- |
| [`../01-overview/project-overview.md`](../01-overview/project-overview.md) | The bigger picture behind these answers |
| [`../06-troubleshooting/common-issues.md`](../06-troubleshooting/common-issues.md) | Symptom-shaped versions of the same facts |
| [`../02-setup/getting-started.md`](../02-setup/getting-started.md) | First-run walkthrough |
