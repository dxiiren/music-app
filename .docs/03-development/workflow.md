# Development Workflow

> **TL;DR** Branch off `main`, develop against `just start` (HMR), verify in the browser,
> then `just lint` + `just format` + `just test` before committing — there are no hooks or
> CI to catch you. Conventional Commits, no attribution footers, PRs into `main`.

## The loop

1. `git checkout -b feat/<topic>` off `main`.
2. `just start` (or `just dev` for foreground logs). Edit under `src/` — Vite HMR applies
   changes instantly.
3. Verify in the browser at `http://localhost:8115`. Firebase-backed behavior needs a
   filled `.env` (copy `.env.example`; see
   [getting-started](../02-setup/getting-started.md)) — otherwise you get the setup banner.
4. Quality gates (manual — nothing runs automatically):
   - `just lint` — ESLint 9 flat config with `--fix`; **it edits files**.
   - `just format` — Prettier over `src/`; **it edits files**.
   - `just test` — Vitest single pass (all green; no Firebase keys needed).
   - `just build` — catches import/bundling errors the dev server tolerates.
5. Commit with a Conventional message (`feat(player): ...`, `fix(auth): ...`) — the
   `/commit` skill automates this. **No `Co-Authored-By` / "Generated with" footers.**
6. PR into `main` (`/create-pr`), ideally after a `/pre-pr-review` self-audit.

## Unit tests (Vitest)

- Specs live in `src/components/__tests__/` (9 files: router-link stub, pinia counter,
  SongItem props, snapshot, about/home views, an example spec, the env-driven firebase
  config, and the not-configured banner).
- The npm script `test:unit` is `vitest --ui` — watch mode plus a browser UI that **never
  exits**. `just test` appends `--run` for a headless single pass; add flags with
  `just test -- <flags>` if needed.
- **The whole suite is green with no Firebase keys**: `homeview.spec.js` stubs the
  firebase bundle with `vi.mock('@/includes/firebase')`, and `firebase-config.spec.js`
  drives the env-var reading with `vi.stubEnv`. Keep it that way — specs must never need
  a real Firebase project.
- If you intentionally change `SongItem.vue` markup, refresh the snapshot with
  `npx vitest run -u` in the same commit that blesses the new markup.
- New logic (stores, helpers) should get a spec in the same folder.

## E2E tests (Cypress)

Cypress 14 is configured (`cypress.config.js`, specs in `cypress/e2e/`) but intentionally
**not wired as a just recipe** — it isn't reliable headless here yet:

- `npm run test:e2e` — builds nothing itself; it starts `vite preview` on **:4173** (the
  baseUrl in `cypress.config.js`) and runs `cypress run --e2e`. Run `just build` first.
- `npm run test:e2e:dev` — starts a dev server on :4173 and opens the interactive runner.
- Both need a filled `.env`, otherwise every visit hits the "Firebase not configured"
  banner instead of the app.
- The binary is downloaded by `npm ci` (`prepare` script) into the user-level Cypress cache.

## Conventions

| Topic | Rule |
| --- | --- |
| Commits | Conventional Commits; scopes in use: `manage`, `player`, `auth`, `views`, `router`, `includes`, `i18n`, `styles`, `config`, `tooling`, `docs`, `skills` |
| Author | `mohdakmal875@gmail.com` (already set repo-locally) |
| Firebase access | Always through the `src/includes/firebase.js` bundle — never re-import `firebase/*` in a component |
| Styling | Tailwind v4 utilities; shared look via `src/assets/*.css` |
| Ports | Dev/preview on **8115** only (`--strictPort`); Cypress preview uses 4173 |
| Generated files | Don't commit `dev-dist/` churn (`git restore dev-dist`) or a regenerated `stats.html` unless intentional |

## Related docs

| Doc | Why |
| --- | --- |
| [`../05-reference/commands.md`](../05-reference/commands.md) | Exact recipe/script behavior |
| [`../06-troubleshooting/common-issues.md`](../06-troubleshooting/common-issues.md) | When the loop breaks |
| [`../01-overview/architecture.md`](../01-overview/architecture.md) | Where a change belongs |
