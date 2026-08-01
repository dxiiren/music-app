# FAQ

> **TL;DR** Quick answers about the port, the empty Firebase config, the failing specs, the
> Malay default locale, Cypress, `dev-dist/`, `template/`, and the Claude Code tooling.

**Why port 8115?**
Every repo in this workspace gets a unique assigned port so several dev servers can run at
once. `--strictPort` makes collisions loud instead of silent port-hopping. Don't change it.

**Why is the page blank when the server clearly works?**
The committed Firebase config is empty (`{}`) and the app mounts only after Firebase Auth
initializes — see [common-issues](../06-troubleshooting/common-issues.md). Fill
`src/includes/firebase.js` with your own project's web config to see the UI.

**Is the Firebase web config a secret?**
Not in the credential sense — it ships to every browser in production apps; Firebase
security rules do the protecting. Each dev fills their own here; just don't commit one
without agreeing it's the team's shared project.

**Why do 2 test files fail?**
Pre-existing: `homeview.spec.js` trips over the empty Firebase config at import, and
`snapshot.spec.js` has a stale snapshot from before `SongItem.vue`'s markup changed. The
other 5 files (6 tests) pass. Details in
[common-issues](../06-troubleshooting/common-issues.md).

**Why isn't there a `just` recipe for Cypress?**
The e2e flow targets `vite preview` on :4173, needs a filled Firebase config, and isn't
reliable headless on this setup — so it stays an npm-script affair (`npm run test:e2e`,
`npm run test:e2e:dev`) documented in [workflow](../03-development/workflow.md).

**Why does the app open in Malay?**
`src/includes/i18n.js` sets `locale: "ms"` with `en` fallback. The header's locale link
toggles between them; the song page's price demo formats MYR vs USD accordingly.

**What are `dev-dist/` and `stats.html`?**
Generated artifacts that happen to be tracked: `dev-dist/` is the PWA plugin's dev
service-worker output (regenerated on every dev run — `git restore` the churn), and
`stats.html` is an old rollup-visualizer bundle report (the plugin is commented out in
`vite.config.js`).

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
